import js::rust::{bare_compartment, methods};
import js::{JS_ARGV, JSCLASS_HAS_RESERVED_SLOTS, JSPROP_ENUMERATE, JSPROP_SHARED, JSVAL_NULL,
            JS_THIS_OBJECT, JS_SET_RVAL};
import js::jsapi::{JSContext, jsval, JSObject, JSBool, jsid, JSClass, JSFreeOp};
import js::jsapi::bindgen::{JS_ValueToString, JS_GetStringCharsZAndLength, JS_ReportError,
                            JS_GetReservedSlot, JS_SetReservedSlot, JS_NewStringCopyN,
    JS_DefineFunctions, JS_DefineProperty, JS_DefineProperties, JS_EncodeString, JS_free};
import js::glue::bindgen::*;
import js::global::jsval_to_rust_str;
import js::crust::{JS_PropertyStub, JS_StrictPropertyStub, JS_EnumerateStub, JS_ConvertStub, JS_ResolveStub};
import js::glue::bindgen::RUST_JSVAL_TO_INT;
import result::{result, ok, err};
import ptr::null;
import libc::c_uint;
import utils::{rust_box, squirrel_away, jsval_to_str};
import bindings::node::create;
import base::{Node, Window};
import dvec::{DVec, dvec};

extern fn alert(cx: *JSContext, argc: c_uint, vp: *jsval) -> JSBool {
  unsafe {
    let argv = JS_ARGV(cx, vp);
    assert (argc == 1);
    // Abstract this pattern and use it in debug, too?
    let jsstr = JS_ValueToString(cx, *ptr::offset(argv, 0));
    // Right now, just print to the console
    io::println(#fmt("ALERT: %s", jsval_to_rust_str(cx, jsstr)));
    JS_SET_RVAL(cx, vp, JSVAL_NULL);
  }
  1_i32
}

// Holder for the various JS values associated with setTimeout
// (ie. function value to invoke and all arguments to pass
//      to the function when calling it)
struct TimerData {
    let funval: jsval;
    let args: DVec<jsval>;
    new(argc: c_uint, argv: *jsval) unsafe {
        self.funval = *argv;
        self.args = dvec();
        let mut i = 2;
        while i < argc as uint {
            self.args.push(*ptr::offset(argv, i));
            i += 1;
        };
    }
}

extern fn setTimeout(cx: *JSContext, argc: c_uint, vp: *jsval) -> JSBool unsafe {
    let argv = JS_ARGV(cx, vp);
    assert (argc >= 2);

    //TODO: don't crash when passed a non-integer value for the timeout

    // Post a delayed message to the per-window timer task; it will dispatch it
    // to the relevant content handler that will deal with it.
    std::timer::delayed_send(std::uv_global_loop::get(),
                             RUST_JSVAL_TO_INT(*ptr::offset(argv, 1)) as uint,
                             (*unwrap(JS_THIS_OBJECT(cx, vp))).payload.timer_chan,
                             base::Fire(~TimerData(argc, argv)));

    JS_SET_RVAL(cx, vp, JSVAL_NULL);
    return 1;
}

unsafe fn unwrap(obj: *JSObject) -> *rust_box<Window> {
    let val = JS_GetReservedSlot(obj, 0);
    unsafe::reinterpret_cast(RUST_JSVAL_TO_PRIVATE(val))
}

extern fn finalize(_fop: *JSFreeOp, obj: *JSObject) {
    #debug("finalize!");
    unsafe {
        let val = JS_GetReservedSlot(obj, 0);
        let _: @Window = unsafe::reinterpret_cast(RUST_JSVAL_TO_PRIVATE(val));
    }
}

fn init(compartment: bare_compartment, win: @Window) {
    let proto = utils::define_empty_prototype(~"Window", none, compartment);
    compartment.register_class(utils::instance_jsclass(~"WindowInstance", finalize));

    let obj = result::unwrap(
                 compartment.new_object_with_proto(~"WindowInstance",
                                                   ~"Window", null()));

    /* Define methods on a window */
    let methods = ~[{name: compartment.add_name(~"alert"),
                     call: alert,
                     nargs: 1,
                     flags: 0},
                    {name: compartment.add_name(~"setTimeout"),
                     call: setTimeout,
                     nargs: 2,
                     flags: 0}];

    vec::as_buf(methods, |fns, _len| {
        JS_DefineFunctions(compartment.cx.ptr, proto.ptr, fns);
      });

    unsafe {
        let raw_ptr: *libc::c_void = unsafe::reinterpret_cast(squirrel_away(win));
        JS_SetReservedSlot(obj.ptr, 0, RUST_PRIVATE_TO_JSVAL(raw_ptr));
    }

    //TODO: All properties/methods on Window need to be available on the global
    //      object as well. We probably want a special JSClass with a resolve hook.
    compartment.define_property(~"window", RUST_OBJECT_TO_JSVAL(obj.ptr),
                                JS_PropertyStub, JS_StrictPropertyStub,
                                JSPROP_ENUMERATE);
}
