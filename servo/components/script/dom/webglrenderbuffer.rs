/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// https://www.khronos.org/registry/webgl/specs/latest/1.0/webgl.idl
use dom::bindings::codegen::Bindings::WebGLRenderbufferBinding;
use dom::bindings::global::GlobalRef;
use dom::bindings::js::Root;
use dom::bindings::utils::reflect_dom_object;
use dom::webglobject::WebGLObject;

use canvas_traits::{CanvasMsg, CanvasWebGLMsg};
use std::sync::mpsc::{channel, Sender};
use std::cell::Cell;

#[dom_struct]
pub struct WebGLRenderbuffer {
    webgl_object: WebGLObject,
    id: u32,
    is_deleted: Cell<bool>,
    renderer: Sender<CanvasMsg>,
}

impl WebGLRenderbuffer {
    fn new_inherited(renderer: Sender<CanvasMsg>, id: u32) -> WebGLRenderbuffer {
        WebGLRenderbuffer {
            webgl_object: WebGLObject::new_inherited(),
            id: id,
            is_deleted: Cell::new(false),
            renderer: renderer,
        }
    }

    pub fn maybe_new(global: GlobalRef, renderer: Sender<CanvasMsg>) -> Option<Root<WebGLRenderbuffer>> {
        let (sender, receiver) = channel();
        renderer.send(CanvasMsg::WebGL(CanvasWebGLMsg::CreateRenderbuffer(sender))).unwrap();

        let result = receiver.recv().unwrap();
        result.map(|renderbuffer_id| WebGLRenderbuffer::new(global, renderer, *renderbuffer_id))
    }

    pub fn new(global: GlobalRef, renderer: Sender<CanvasMsg>, id: u32) -> Root<WebGLRenderbuffer> {
        reflect_dom_object(box WebGLRenderbuffer::new_inherited(renderer, id), global, WebGLRenderbufferBinding::Wrap)
    }
}

pub trait WebGLRenderbufferHelpers {
    fn id(self) -> u32;
    fn bind(self, target: u32);
    fn delete(self);
}

impl<'a> WebGLRenderbufferHelpers for &'a WebGLRenderbuffer {
    fn id(self) -> u32 {
        self.id
    }

    fn bind(self, target: u32) {
        self.renderer.send(CanvasMsg::WebGL(CanvasWebGLMsg::BindRenderbuffer(target, self.id))).unwrap();
    }

    fn delete(self) {
        if !self.is_deleted.get() {
            self.is_deleted.set(true);
            self.renderer.send(CanvasMsg::WebGL(CanvasWebGLMsg::DeleteRenderbuffer(self.id))).unwrap();
        }
    }
}
