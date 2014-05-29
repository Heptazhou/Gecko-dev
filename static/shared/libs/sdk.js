/**
 * @license  OpenTok JavaScript Library v2.0.18.1
 * http://www.tokbox.com/
 *
 * Copyright (c) 2013 TokBox, Inc.
 *
 * Date: March 18 06:20:17 2014
 */

(function(window) {
if (!window.OT) window.OT = {};

OT.properties = {
  version: "v2.0.18.1",         // The current version (eg. v2.0.4) (This is replaced by gradle)
  build: "7333ca3",    // The current build hash (This is replaced by gradle)

  debug: "false",      // Whether or not to turn on debug logging by default
  websiteURL: "http://www.tokbox.com",      // The URL of the tokbox website

  cdnURL: "http://static.opentok.com",        // The URL of the CDN
  loggingURL: "http://hlg.tokbox.com/prod",   // The URL to use for logging
  apiURL: "http://anvil.opentok.com",          // The anvil API URL

  messagingProtocol: "wss",         // What protocol to use when connecting to the rumor web socket
  messagingPort: 443,               // What port to use when connection to the rumor web socket

  supportSSL: "true",           // If this environment supports SSL
  cdnURLSSL: "https://static.opentok.com",         // The CDN to use if we're using SSL
  loggingURLSSL: "https://hlg.tokbox.com/prod",    // The loggging URL to use if we're using SSL
  apiURLSSL: "https://anvil.opentok.com"             // The anvil API URL to use if we're using SSL
};

})(window);
/**
 * @license  Common JS Helpers on OpenTok 0.1.0 628a0b9 master
 * http://www.tokbox.com/
 *
 * Copyright (c) 2014 TokBox, Inc.
 *
 * Date: January 08 04:13:37 2014
 *
 */

// OT Helper Methods
//
// helpers.js                           <- the root file
// helpers/lib/{helper topic}.js        <- specialised helpers for specific tasks/topics
//                                          (i.e. video, dom, etc)
//
// @example Getting a DOM element by it's id
//  var element = OTHelpers('domId');
//
// @example Testing for web socket support
//  if (OT.supportsWebSockets()) {
//      // do some stuff with websockets
//  }
//

/*jshint browser:true, smarttabs:true*/

!(function(window, undefined) {


var OTHelpers = function(domId) {
    return document.getElementById(domId);
};

var previousOTHelpers = window.OTHelpers;

window.OTHelpers = OTHelpers;

OTHelpers.noConflict = function() {
  OTHelpers.noConflict = function() {
    return OTHelpers;
  };
  window.OTHelpers = previousOTHelpers;
  return OTHelpers;
};


OTHelpers.isEmpty = function(obj) {
  if (obj === null || obj === undefined) return true;
  if (Array.isArray(obj) || typeof(obj) === 'string') return obj.length === 0;

  // Objects without enumerable owned properties are empty.
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }

  return true;
};

OTHelpers.isNone = function(obj) {
  return obj === undefined || obj === null;
};

OTHelpers.isObject = function(obj) {
  return obj === Object(obj);
};


OTHelpers.isFunction = function(obj) {
    return typeof obj === 'function';
};

// Extend a target object with the properties from one or
// more source objects
//
// @example:
//    dest = OTHelpers.extend(dest, source1, source2, source3);
//
OTHelpers.extend = function(/* dest, source1[, source2, ..., , sourceN]*/) {
    var sources = Array.prototype.slice.call(arguments),
        dest = sources.shift();

    sources.forEach(function(source) {
        for (var key in source) {
            dest[key] = source[key];
        }
    });

    return dest;
};

// Ensures that the target object contains certain defaults.
//
// @example
//   var options = OTHelpers.defaults(options, {
//     loading: true     // loading by default
//   });
//
OTHelpers.defaults = function(/* dest, defaults1[, defaults2, ..., , defaultsN]*/) {
    var sources = Array.prototype.slice.call(arguments),
        dest = sources.shift();

    sources.forEach(function(source) {
        for (var key in source) {
            if (dest[key] === void 0) dest[key] = source[key];
        }
    });

    return dest;
};

//
OTHelpers.clone = function(obj) {
    if (!OTHelpers.isObject(obj)) return obj;
    return Array.isArray(obj) ? obj.slice() : OTHelpers.extend({}, obj);
};



// Handy do nothing function
OTHelpers.noop = function() {};

// Returns true if the client supports WebSockets, false otherwise.
OTHelpers.supportsWebSockets = function() {
    return 'WebSocket' in window;
};

// Returns the number of millisceonds since the the UNIX epoch, this is functionally
// equivalent to executing new Date().getTime().
//
// Where available, we use 'performance.now' which is more accurate and reliable,
// otherwise we default to new Date().getTime().
OTHelpers.now = (function() {
    var performance = window.performance || {},
        navigationStart,
        now =  performance.now       ||
               performance.mozNow    ||
               performance.msNow     ||
               performance.oNow      ||
               performance.webkitNow;

    if (now) {
        now = now.bind(performance);
        navigationStart = performance.timing.navigationStart;

        return  function() { return navigationStart + now(); };
    }
    else {
        return function() { return new Date().getTime(); };
    }
})();

OTHelpers.browser = function() {
    var userAgent = window.navigator.userAgent.toLowerCase(),
        navigatorVendor,
        browser = 'Unknown';

    if (userAgent.indexOf('firefox') > -1)   {
        browser = 'Firefox';
    }
    if (userAgent.indexOf('opera') > -1)   {
        browser = 'Opera';
    }
    else if (userAgent.indexOf("msie") > -1) {
        browser = "IE";
    }
    else if (userAgent.indexOf("chrome") > -1) {
        browser = "Chrome";
    }

    if ((navigatorVendor = window.navigator.vendor) && navigatorVendor.toLowerCase().indexOf("apple") > -1) {
        browser = "Safari";
    }

    userAgent = null;
    OTHelpers.browser = function() { return browser; };
    return browser;
};


OTHelpers.canDefineProperty = true;

try {
    Object.defineProperty({}, 'x', {});
} catch (err) {
    OTHelpers.canDefineProperty = false;
}

// A helper for defining a number of getters at once.
//
// @example: from inside an object
//   OTHelpers.defineGetters(this, {
//     apiKey: function() { return _apiKey; },
//     token: function() { return _token; },
//     connected: function() { return this.is('connected'); },
//     connection: function() { return _socket && _socket.id ? this.connections.get(_socket.id) : null; },
//     capabilities: function() { return _socket.capabilities; },
//     sessionId: function() { return _sessionId; },
//     id: function() { return _sessionId; }
//   });
//
OTHelpers.defineGetters = function(self, getters, enumerable) {
  var propsDefinition = {};

  if (enumerable === void 0) enumerable = false;

  for (var key in getters) {
    propsDefinition[key] = {
      get: getters[key],
      enumerable: enumerable
    };
  }

  Object.defineProperties(self, propsDefinition);
};


// Polyfill Object.create for IE8
//
// See https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
//
if (!Object.create) {
    Object.create = function (o) {
        if (arguments.length > 1) {
            throw new Error('Object.create implementation only accepts the first parameter.');
        }
        function F() {}
        F.prototype = o;
        return new F();
    };
}

OTHelpers.setCookie = function(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (err) {
    // Store in browser cookie
    var date = new Date();
    date.setTime(date.getTime()+(365*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
    document.cookie = key+"="+value+expires+"; path=/";
  }
};

OTHelpers.getCookie = function(key) {
    var value;

    try {
      value = localStorage.getItem("opentok_client_id");
      return value;
    } catch (err) {
      // Check browser cookies
      var nameEQ = key + "=";
      var ca = document.cookie.split(';');
      for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) {
          value = c.substring(nameEQ.length,c.length);
        }
      }

      if (value) {
        return value;
      }
    }

    return null;
};


/// Stolen from Underscore, this needs replacing


  // Invert the keys and values of an object. The values must be serializable.
  OTHelpers.invert = function(obj) {
    var result = {};
    for (var key in obj) if (obj.hasOwnProperty(key)) result[obj[key]] = key;
    return result;
  };


  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
  };
  entityMap.unescape = OTHelpers.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + Object.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + Object.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  ['escape', 'unescape'].forEach(function(method) {
    OTHelpers[method] = function(string) {
      if (string === null || string === undefined) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
OTHelpers.templateSettings = {
  evaluate    : /<%([\s\S]+?)%>/g,
  interpolate : /<%=([\s\S]+?)%>/g,
  escape      : /<%-([\s\S]+?)%>/g
};

// When customizing `templateSettings`, if you don't want to define an
// interpolation, evaluation or escaping regex, we need one that is
// guaranteed not to match.
var noMatch = /(.)^/;

// Certain characters need to be escaped so that they can be put into a
// string literal.
var escapes = {
  "'":      "'",
  '\\':     '\\',
  '\r':     'r',
  '\n':     'n',
  '\t':     't',
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

// JavaScript micro-templating, similar to John Resig's implementation.
// Underscore templating handles arbitrary delimiters, preserves whitespace,
// and correctly escapes quotes within interpolated code.
OTHelpers.template = function(text, data, settings) {
  var render;
  settings = OTHelpers.defaults({}, settings, OTHelpers.templateSettings);

  // Combine delimiters into one regular expression via alternation.
  var matcher = new RegExp([
    (settings.escape || noMatch).source,
    (settings.interpolate || noMatch).source,
    (settings.evaluate || noMatch).source
  ].join('|') + '|$', 'g');

  // Compile the template source, escaping string literals appropriately.
  var index = 0;
  var source = "__p+='";
  text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
    source += text.slice(index, offset)
      .replace(escaper, function(match) { return '\\' + escapes[match]; });

    if (escape) {
      source += "'+\n((__t=(" + escape + "))==null?'':OTHelpers.escape(__t))+\n'";
    }
    if (interpolate) {
      source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
    }
    if (evaluate) {
      source += "';\n" + evaluate + "\n__p+='";
    }
    index = offset + match.length;
    return match;
  });
  source += "';\n";

  // If a variable is not specified, place data values in local scope.
  if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

  source = "var __t,__p='',__j=Array.prototype.join," +
    "print=function(){__p+=__j.call(arguments,'');};\n" +
    source + "return __p;\n";


  try {
    // evil is necessary for the new Function line
    /*jshint evil:true */
    render = new Function(settings.variable || 'obj', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  if (data) return render(data);
  var template = function(data) {
    return render.call(this, data);
  };

  // Provide the compiled function source as a convenience for precompilation.
  template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

  return template;
};

})(window);
/*jshint browser:true, smarttabs:true*/

// tb_require('../../helpers.js')

(function(window, OTHelpers, undefined) {

OTHelpers.statable = function(self, possibleStates, initialState, stateChanged, stateChangedFailed) {
  var previousState,
      currentState = initialState;

  var setState = function(state) {
    if (currentState !== state) {
        if (possibleStates.indexOf(state) === -1) {
          if (stateChangedFailed && OTHelpers.isFunction(stateChangedFailed)) stateChangedFailed('invalidState', state);
          return;
        }

        previousState = currentState;
        currentState = state;
        if (stateChanged && OTHelpers.isFunction(stateChanged)) stateChanged(state, previousState);
    }
  };


  // Returns a number of states and returns true if the current state
  // is any of them.
  //
  // @example
  // if (this.is('connecting', 'connected')) {
  //   // do some stuff
  // }
  //
  self.is = function (/* state0:String, state1:String, ..., stateN:String */) {
    return Array.prototype.indexOf.call(arguments, currentState) !== -1;
  };


  // Returns a number of states and returns true if the current state
  // is none of them.
  //
  // @example
  // if (this.isNot('connecting', 'connected')) {
  //   // do some stuff
  // }
  //
  self.isNot = function (/* state0:String, state1:String, ..., stateN:String */) {
    return Array.prototype.indexOf.call(arguments, currentState) === -1;
  };

  Object.defineProperties(self, {
    state: {
      get: function() { return currentState; }
    },

    previousState: {
      get: function() { return previousState; }
    }
  });

  return setState;
};

})(window, window.OTHelpers);
/*!
 *  This is a modified version of Robert Kieffer awesome uuid.js library.
 *  The only modifications we've made are to remove the Node.js specific
 *  parts of the code and the UUID version 1 generator (which we don't
 *  use). The original copyright notice is below.
 *
 *     node-uuid/uuid.js
 *
 *     Copyright (c) 2010 Robert Kieffer
 *     Dual licensed under the MIT and GPL licenses.
 *     Documentation and details at https://github.com/broofa/node-uuid
 */
// tb_require('../helpers.js')

/*global crypto:true, Uint32Array:true, Buffer:true */
/*jshint browser:true, smarttabs:true*/

(function(window, OTHelpers, undefined) {

  // Unique ID creation requires a high quality random # generator, but
  // Math.random() does not guarantee "cryptographic quality".  So we feature
  // detect for more robust APIs, normalizing each method to return 128-bits
  // (16 bytes) of random data.
  var mathRNG, whatwgRNG;

  // Math.random()-based RNG.  All platforms, very fast, unknown quality
  var _rndBytes = new Array(16);
  mathRNG = function() {
    var r, b = _rndBytes, i = 0;

    for (i = 0; i < 16; i++) {
      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
      b[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return b;
  };

  // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
  // WebKit only (currently), moderately fast, high quality
  if (window.crypto && crypto.getRandomValues) {
    var _rnds = new Uint32Array(4);
    whatwgRNG = function() {
      crypto.getRandomValues(_rnds);

      for (var c = 0 ; c < 16; c++) {
        _rndBytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
      }
      return _rndBytes;
    };
  }

  // Select RNG with best quality
  var _rng = whatwgRNG || mathRNG;

  // Buffer class to use
  var BufferClass = typeof(Buffer) == 'function' ? Buffer : Array;

  // Maps for number <-> hex string conversion
  var _byteToHex = [];
  var _hexToByte = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }

  // **`parse()` - Parse a UUID into it's component bytes**
  function parse(s, buf, offset) {
    var i = (buf && offset) || 0, ii = 0;

    buf = buf || [];
    s.toLowerCase().replace(/[0-9a-f]{2}/g, function(oct) {
      if (ii < 16) { // Don't overflow!
        buf[i + ii++] = _hexToByte[oct];
      }
    });

    // Zero out remaining bytes if string was short
    while (ii < 16) {
      buf[i + ii++] = 0;
    }

    return buf;
  }

  // **`unparse()` - Convert UUID byte array (ala parse()) into a string**
  function unparse(buf, offset) {
    var i = offset || 0, bth = _byteToHex;
    return  bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] + '-' +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]] +
            bth[buf[i++]] + bth[buf[i++]];
  }

  // **`v4()` - Generate random UUID**

  // See https://github.com/broofa/node-uuid for API details
  function v4(options, buf, offset) {
    // Deprecated - 'format' argument, as supported in v1.2
    var i = buf && offset || 0;

    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new BufferClass(16) : null;
      options = null;
    }
    options = options || {};

    var rnds = options.random || (options.rng || _rng)();

    // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;

    // Copy bytes to buffer, if provided
    if (buf) {
      for (var ii = 0; ii < 16; ii++) {
        buf[i + ii] = rnds[ii];
      }
    }

    return buf || unparse(rnds);
  }

  // Export public API
  var uuid = v4;
  uuid.v4 = v4;
  uuid.parse = parse;
  uuid.unparse = unparse;
  uuid.BufferClass = BufferClass;

  // Export RNG options
  uuid.mathRNG = mathRNG;
  uuid.whatwgRNG = whatwgRNG;

  OTHelpers.uuid = uuid;

}(window, window.OTHelpers));
// AJAX helpers

/*jshint browser:true, smarttabs:true*/
/*global ActiveXObject:true*/

// tb_require('../helpers.js')

(function(window, OTHelpers, undefined) {

// Shim up XML support for IE8
function shimXMLForIE8(xml) {
    // https://developer.mozilla.org/en/DOM/Element.firstElementChild
    Object.defineProperty(xml.prototype, "firstElementChild", {
        "get" : function() {
            var node = this;
            node = node.firstChild;
            while(node && node.nodeType != 1) node = node.nextSibling;
            return node;
        }
    });

    // https://developer.mozilla.org/En/DOM/Element.lastElementChild
    Object.defineProperty(xml.prototype, "lastElementChild", {
        "get" : function() {
            var node = this;
            node = node.lastChild;
            while(node && node.nodeType != 1) node = node.previousSibling;
            return node;
        }
    });

    // https://developer.mozilla.org/En/DOM/Element.nextElementSibling
    Object.defineProperty(xml.prototype, "nextElementSibling", {
        "get" : function() {
            var node = this;
            while(!OTHelpers.isNone(node = node.nextSibling)) {
                if(node.nodeType == 1) break;
            }

            return node;
        }
    });

    // https://developer.mozilla.org/En/DOM/Element.previousElementSibling
    Object.defineProperty(xml.prototype, "previousElementSibling", {
        "get" : function() {
            var node = this;
            while(!OTHelpers.isNone(node = node.previousSibling)) {
                if(node.nodeType == 1) break;
            }
            return node;
        }
    });
}

OTHelpers.parseXML = function(xmlString) {
    var root, xml;

    if (window.DOMParser) { // Standard IE9 + everyone else
        xml = (new DOMParser()).parseFromString(xmlString, "text/xml");
    } else { // <= IE8
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = "false";
        xml.loadXML(xmlString);

        shimXMLForIE8(xml);
    }

    root = xml.documentElement;

    if (!root || !root.nodeName || root.nodeName === "parsererror") {
        // Badly formed XML
        return null;
    }

    return xml;
};

})(window, window.OTHelpers);
/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')

(function(window, OTHelpers, undefined) {

OTHelpers.useLogHelpers = function(on){

    // Log levels for OTLog.setLogLevel
    on.DEBUG    = 5;
    on.LOG      = 4;
    on.INFO     = 3;
    on.WARN     = 2;
    on.ERROR    = 1;
    on.NONE     = 0;

    var _logLevel = on.NONE,
        _logs = [];

    // Generates a logging method for a particular method and log level.
    //
    // Attempts to handle the following cases:
    // * the desired log method doesn't exist, call fallback (if available) instead
    // * the console functionality isn't available because the developer tools (in IE)
    // aren't open, call fallback (if available)
    // * attempt to deal with weird IE hosted logging methods as best we can.
    //
    function generateLoggingMethod(method, level, fallback) {
        return function() {
            if (on.shouldLog(level)) {
                var cons = window.console;

                // In IE, window.console may not exist if the developer tools aren't open
                if (cons && cons[method]) {
                    // the desired console method isn't a real object, which means
                    // that we can't use apply on it. We force it to be a real object
                    // using Function.bind, assuming that's available.
                    if (cons[method].apply || Function.prototype.bind) {
                        if (!cons[method].apply) {
                            cons[method] = Function.prototype.bind.call(cons[method], cons);
                        }

                        cons[method].apply(cons, arguments);
                    }
                    else {
                        // This isn't the same result as the above, but it's better
                        // than nothing.
                        cons[method](
                            Array.prototype.slice.apply(arguments).join(' ')
                        );
                    }
                }
                else if (fallback) {
                    fallback.apply(on, arguments);
                }

                appendToLogs(method, arguments);
            }
        };
    }


    on.log = generateLoggingMethod('log', on.LOG);

    // Generate debug, info, warn, and error logging methods, these all fallback to on.log
    on.debug = generateLoggingMethod('debug', on.DEBUG, on.log);
    on.info = generateLoggingMethod('info', on.INFO, on.log);
    on.warn = generateLoggingMethod('warn', on.WARN, on.log);
    on.error = generateLoggingMethod('error', on.ERROR, on.log);


    on.setLogLevel = function(level) {
        _logLevel = typeof(level) === 'number' ? level : 0;
        on.debug("TB.setLogLevel(" + _logLevel + ")");
        return _logLevel;
    };

    on.getLogs = function() {
        return _logs;
    };

    // Determine if the level is visible given the current logLevel.
    on.shouldLog = function(level) {
        return _logLevel >= level;
    };

    // Format the current time nicely for logging. Returns the current
    // local time.
    function formatDateStamp() {
        var now = new Date();
        return now.toLocaleTimeString() + now.getMilliseconds();
    }


    // Append +args+ to logs, along with the current log level and the a date stamp.
    function appendToLogs(level, args) {
        if (!args) return;

        var message;

        try {
            message = JSON.stringify(args);
        } catch(e) {
            message = args.toString();
        }

        if (message.length <= 2) return;

        _logs.push(
            [level, formatDateStamp(), message]
        );
    }

};

OTHelpers.useLogHelpers(OTHelpers);
OTHelpers.setLogLevel(OTHelpers.ERROR);

})(window, window.OTHelpers);
/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')

(function(window, OTHelpers, undefined) {

OTHelpers.castToBoolean = function(value, defaultValue) {
    if (value === undefined) return defaultValue;
    return value === 'true' || value === true;
};

OTHelpers.roundFloat = function(value, places) {
    return Number(value.toFixed(places));
};

})(window, window.OTHelpers);
/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')
// tb_require('../vendor/uuid.js')

(function(window, OTHelpers, undefined) {

var timeouts = [],
    messageName = "OTHelpers." + OTHelpers.uuid.v4() + ".zero-timeout";

var handleMessage = function(event) {
// XXX In chrome windows, event.source is not defined, so the full check
// doesn't work. I'm not even convinced they need the window check anyway.
//    if (event.source == window && event.data == messageName) {
    if (event.data == messageName) {
        event.stopPropagation();
        if (timeouts.length > 0) {
            var args = timeouts.shift(),
                fn = args.shift();

            fn.apply(null, args);
        }
    }
};

window.addEventListener("message", handleMessage, true);

// Calls the function +fn+ asynchronously with the current execution.
// This is most commonly used to execute something straight after
// the current function.
//
// Any arguments in addition to +fn+ will be passed to +fn+ when it's
// called.
//
// You would use this inplace of setTimeout(fn, 0) type constructs. callAsync
// is preferable as it executes in a much more predictable time window,
// unlike setTimeout which could execute anywhere from 2ms to several thousand
// depending on the browser/context.
//
OTHelpers.callAsync = function (/* fn, [arg1, arg2, ..., argN] */) {
    timeouts.push(Array.prototype.slice.call(arguments));
    window.postMessage(messageName, "*");
};


// Wraps +handler+ in a function that will execute it asynchronously
// so that it doesn't interfere with it's exceution context if it raises
// an exception.
OTHelpers.createAsyncHandler = function(handler) {
    return function() {
        var args = Array.prototype.slice.call(arguments);

        OTHelpers.callAsync(function() {
          handler.apply(null, args);
        });
    };
};

})(window, window.OTHelpers);
/*jshint browser:true, smarttabs:true*/
/*global jasmine:true*/

// tb_require('../../helpers.js')
// tb_require('../callbacks.js')


(function(window, OTHelpers, undefined) {

/**
* This base class defines the <code>addEventListener()</code> and <code>removeEventListner()</code> methods of objects
* that can dispatch events.
*
* @class EventDispatcher
*/
OTHelpers.eventing = function(self, syncronous) {
  var _events = {};


  // Call the defaultAction, passing args
  function executeDefaultAction(defaultAction, args) {
    if (!defaultAction) return;

    defaultAction.apply(null, args.slice());
  }

  // Execute each handler in +listeners+ with +args+.
  //
  // Each handler will be executed async. On completion the defaultAction
  // handler will be executed with the args.
  //
  // @param [Array] listeners
  //    An array of functions to execute. Each will be passed args.
  //
  // @param [Array] args
  //    An array of arguments to execute each function in  +listeners+ with.
  //
  // @param [String] name
  //    The name of this event.
  //
  // @param [Function, Null, Undefined] defaultAction
  //    An optional function to execute after every other handler. This will execute even
  //    if +listeners+ is empty. +defaultAction+ will be passed args as a normal
  //    handler would.
  //
  // @return Undefined
  //
  function executeListenersAsyncronously(name, args, defaultAction) {
    var listeners = _events[name];
    if (!listeners || listeners.length === 0) return;

    var listenerAcks = listeners.length;

    listeners.forEach(function(listener) { // , index
      function filterHandlerAndContext(_listener) {
        return _listener.context === listener.context && _listener.handler === listener.handler;
      }

      // We run this asynchronously so that it doesn't interfere with execution if an error happens
      OTHelpers.callAsync(function() {
        try {
          // have to check if the listener has not been removed
          if (_events[name] && _events[name].some(filterHandlerAndContext)) {
            (listener.closure || listener.handler).apply(listener.context || null, args);
          }
        }
        finally {
          listenerAcks--;

          if (listenerAcks === 0) {
            executeDefaultAction(defaultAction, args);
          }
        }
      });
    });
  }


  // This is identical to executeListenersAsyncronously except that handlers will
  // be executed syncronously.
  //
  // On completion the defaultAction handler will be executed with the args.
  //
  // @param [Array] listeners
  //    An array of functions to execute. Each will be passed args.
  //
  // @param [Array] args
  //    An array of arguments to execute each function in  +listeners+ with.
  //
  // @param [String] name
  //    The name of this event.
  //
  // @param [Function, Null, Undefined] defaultAction
  //    An optional function to execute after every other handler. This will execute even
  //    if +listeners+ is empty. +defaultAction+ will be passed args as a normal
  //    handler would.
  //
  // @return Undefined
  //
  function executeListenersSyncronously(name, args) { // defaultAction is not used
    var listeners = _events[name];
    if (!listeners || listeners.length === 0) return;

    listeners.forEach(function(listener) { // index
      (listener.closure || listener.handler).apply(listener.context || null, args);
    });
  }

  var executeListeners = syncronous === true ? executeListenersSyncronously : executeListenersAsyncronously;


  var removeAllListenersNamed = function (eventName, context) {
    if (_events[eventName]) {
      if (context) {
        // We are removing by context, get only events that don't
        // match that context
        _events[eventName] = _events[eventName].filter(function(listener){
          return listener.context !== context;
        });
      }
      else {
        delete _events[eventName];
      }
    }
  };

  var addListeners = function (eventNames, handler, context, closure) {
    var listener = {handler: handler};
    if (context) listener.context = context;
    if (closure) listener.closure = closure;

    eventNames.forEach(function(name) {
      if (!_events[name]) _events[name] = [];
      _events[name].push(listener);
    });
  }.bind(self);


  var removeListeners = function (eventNames, handler, context) {
    function filterHandlerAndContext(listener) {
      return !(listener.handler === handler && listener.context === context);
    }

    eventNames.forEach(function(name) {
      if (_events[name]) {
        _events[name] = _events[name].filter(filterHandlerAndContext);
        if (_events[name].length === 0) delete _events[name];
      }
    });
  }.bind(self);


  // Execute any listeners bound to the +event+ Event.
  //
  // Each handler will be executed async. On completion the defaultAction
  // handler will be executed with the args.
  //
  // @param [Event] event
  //    An Event object.
  //
  // @param [Function, Null, Undefined] defaultAction
  //    An optional function to execute after every other handler. This will execute even
  //    if there are listeners bound to this event. +defaultAction+ will be passed
  //    args as a normal handler would.
  //
  // @return this
  //
  self.dispatchEvent = function(event, defaultAction) {
    if (!event.type) {
      OTHelpers.error("OTHelpers.Eventing.dispatchEvent: Event has no type");
      OTHelpers.error(event);

      throw new Error("OTHelpers.Eventing.dispatchEvent: Event has no type");
    }

    if (!event.target) {
      event.target = this;
    }

    if (!_events[event.type] || _events[event.type].length === 0) {
      executeDefaultAction(defaultAction, [event]);
      return;
    }

    executeListeners(event.type, [event], defaultAction);

    return this;
  };

  // Execute each handler for the event called +name+.
  //
  // Each handler will be executed async, and any exceptions that they throw will
  // be caught and logged
  //
  // How to pass these?
  //  * defaultAction
  //
  // @example
  //  foo.on('bar', function(name, message) {
  //    alert("Hello " + name + ": " + message);
  //  });
  //
  //  foo.trigger('OpenTok', 'asdf');     // -> Hello OpenTok: asdf
  //
  //
  // @param [String] eventName
  //    The name of this event.
  //
  // @param [Array] arguments
  //    Any additional arguments beyond +eventName+ will be passed to the handlers.
  //
  // @return this
  //
  self.trigger = function(eventName) {
    if (!_events[eventName] || _events[eventName].length === 0) {
      return;
    }

    var args = Array.prototype.slice.call(arguments);

    // Remove the eventName arg
    args.shift();

    executeListeners(eventName, args);

    return this;
  };

  self.on = function(eventNames, handler_or_context, context) {
    if (typeof(eventNames) === "string" && handler_or_context) {
      addListeners(eventNames.split(' '), handler_or_context, context);
    }
    else {
      for (var name in eventNames) {
        if (eventNames.hasOwnProperty(name)) {
          addListeners([name], eventNames[name], handler_or_context);
        }
      }
    }

    return this;
  };

 self.off = function(eventNames, handler_or_context, context) {
    if (typeof(eventNames) === "string") {
      if (handler_or_context && OTHelpers.isFunction(handler_or_context)) {
        removeListeners(eventNames.split(' '), handler_or_context, context);
      }
      else {
        eventNames.split(' ').forEach(function(name) {
          removeAllListenersNamed(name, handler_or_context);
        }, this);
      }
    }
    else if (!eventNames) {
      // remove all bound events
      _events = {};
    }
    else {
      for (var name in eventNames) {
        if (eventNames.hasOwnProperty(name)) {
          removeListeners([name], eventNames[name], handler_or_context);
        }
      }
    }

    return this;
  };


  self.once = function(eventNames, handler, context) {
    var names = eventNames.split(' '),
        fun = function() {
          var result = handler.apply(context || null, arguments);
          removeListeners(names, handler, context);

          return result;
        }.bind(this);

    addListeners(names, handler, context, fun);
    return this;
  };


  /**
  * This method registers a method as an event listener for a specific event.
  * <p>
  *
  * <p>
  *   If a handler is not registered for an event, the event is ignored locally. If the event listener function does not exist,
  *   the event is ignored locally.
  * </p>
  * <p>
  *   Throws an exception if the <code>listener</code> name is invalid.
  * </p>
  *
  * @param {String} type The string identifying the type of event.
  *
  * @param {Function} listener The function to be invoked when the object dispatches the event.
  *
  * @memberOf EventDispatcher
  * @method #addEventListener
  * @see <a href="#events">Events</a>
  */
  // See 'on' for usage.
  // @depreciated will become a private helper function in the future.
  self.addEventListener = function(eventName, handler, context) {
    addListeners([eventName], handler, context);
  };


  /**
  * Removes an event listener for a specific event.
  * <p>
  *
  * <p>
  *   Throws an exception if the <code>listener</code> name is invalid.
  * </p>
  *
  * @param {String} type The string identifying the type of event.
  *
  * @param {Function} listener The event listener function to remove.
  *
  * @memberOf EventDispatcher
  * @method #removeEventListener
  * @see <a href="#events">Events</a>
  */
  // See 'off' for usage.
  // @depreciated will become a private helper function in the future.
  self.removeEventListener = function(eventName, handler, context) {
    removeListeners([eventName], handler, context);
  };





  return self;
};

OTHelpers.eventing.Event = function() {

    return function (type, cancelable) {
        this.type = type;
        this.cancelable = cancelable !== undefined ? cancelable : true;

        var _defaultPrevented = false,
            _target = null;

        this.preventDefault = function() {
            if (this.cancelable) {
                _defaultPrevented = true;
            } else {
                OTHelpers.warn("Event.preventDefault :: Trying to preventDefault on an Event that isn't cancelable");
            }
        };

        this.isDefaultPrevented = function() {
            return _defaultPrevented;
        };

        if (OTHelpers.canDefineProperty) {
            Object.defineProperty(this, 'target', {
                set: function(target) {
                    _target = target;
                },

                get: function() {
                    return _target;
                }
            });
        }
    };

};
})(window, window.OTHelpers);
/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')
// tb_require('./callbacks.js')

// DOM helpers
(function(window, OTHelpers, undefined) {

// Returns true if the client supports element.classList
OTHelpers.supportsClassList = function() {
    var hasSupport = typeof(document !== "undefined") && ("classList" in document.createElement("a"));
    OTHelpers.supportsClassList = function() { return hasSupport; };

    return hasSupport;
};

OTHelpers.removeElement = function(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
};

OTHelpers.removeElementById = function(elementId) {
    this.removeElement(OTHelpers(elementId));
};

OTHelpers.removeElementsByType = function(parentElem, type) {
    if (!parentElem) return;

    var elements = parentElem.getElementsByTagName(type);

    // elements is a "live" NodesList collection. Meaning that the collection
    // itself will be mutated as we remove elements from the DOM. This means
    // that "while there are still elements" is safer than "iterate over each
    // element" as the collection length and the elements indices will be modified
    // with each iteration.
    while (elements.length) {
        parentElem.removeChild(elements[0]);
    }
};

OTHelpers.emptyElement = function(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
    return element;
};

OTHelpers.createElement = function(nodeName, attributes, innerHTML) {
    var element = document.createElement(nodeName);

    if (attributes) {
        for (var name in attributes) {
            if (typeof(attributes[name]) === 'object') {
                if (!element[name]) element[name] = {};

                var subAttrs = attributes[name];
                for (var n in subAttrs) {
                    element[name][n] = subAttrs[n];
                }
            }
            else if (name === 'className') {
                element.className = attributes[name];
            }
            else {
                element.setAttribute(name, attributes[name]);
            }
        }
    }

    if (innerHTML) {
        element.innerHTML = innerHTML;
    }

    return element;
};

OTHelpers.createButton = function(innerHTML, attributes, events) {
    var button = OTHelpers.createElement('button', attributes, innerHTML);

    if (events) {
        for (var name in events) {
            if (events.hasOwnProperty(name)) {
                OTHelpers.on(button, name, events[name]);
            }
        }

        button._boundEvents = events;
    }

    return button;
};

// Helper function for adding event listeners to dom elements.
// WARNING: This doesn't preserve event types, your handler could be getting all kinds of different
// parameters depending on the browser. You also may have different scopes depending on the browser
// and bubbling and cancelable are not supported.
OTHelpers.on = function(element, eventName,  handler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, handler, false);
    } else if (element.attachEvent) {
        element.attachEvent("on" + eventName, handler);
    } else {
        var oldHandler = element["on"+eventName];
        element["on"+eventName] = function() {
          handler.apply(this, arguments);
          if (oldHandler) oldHandler.apply(this, arguments);
        };
    }
};

// Helper function for removing event listeners from dom elements.
OTHelpers.off = function(element, eventName, handler) {
    if (element.removeEventListener) {
        element.removeEventListener (eventName, handler,false);
    }
    else if (element.detachEvent) {
        element.detachEvent("on" + eventName, handler);
    }
};


// Detects when an element is not part of the document flow because it or one of it's ancesters has display:none.
OTHelpers.isDisplayNone = function(element) {
    if ( (element.offsetWidth === 0 || element.offsetHeight === 0) && OTHelpers.css(element, 'display') === 'none') return true;
    if (element.parentNode && element.parentNode.style) return OTHelpers.isDisplayNone(element.parentNode);
    return false;
};

OTHelpers.findElementWithDisplayNone = function(element) {
    if ( (element.offsetWidth === 0 || element.offsetHeight === 0) && OTHelpers.css(element, 'display') === 'none') return element;
    if (element.parentNode && element.parentNode.style) return OTHelpers.findElementWithDisplayNone(element.parentNode);
    return null;
};

function objectHasProperties(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) return true;
    }
    return false;
}


// Allows an +onChange+ callback to be triggered when specific style properties
// of +element+ are notified. The callback accepts a single parameter, which is
// a hash where the keys are the style property that changed and the values are
// an array containing the old and new values ([oldValue, newValue]).
//
// Width and Height changes while the element is display: none will not be
// fired until such time as the element becomes visible again.
//
// This function returns the MutationObserver itself. Once you no longer wish
// to observe the element you should call disconnect on the observer.
//
// Observing changes:
//  // observe changings to the width and height of object
//  dimensionsObserver = OTHelpers.observeStyleChanges(object, ['width', 'height'], function(changeSet) {
//      OT.debug("The new width and height are " + changeSet.width[1] + ',' + changeSet.height[1]);
//  });
//
// Cleaning up
//  // stop observing changes
//  dimensionsObserver.disconnect();
//  dimensionsObserver = null;
//
OTHelpers.observeStyleChanges = function(element, stylesToObserve, onChange) {
    var oldStyles = {};

    var getStyle = function getStyle(style) {
            switch (style) {
            case 'width':
                return OTHelpers.width(element);

            case 'height':
                return OTHelpers.height(element);

            default:
                return OTHelpers.css(element);
            }
        };

    // get the inital values
    stylesToObserve.forEach(function(style) {
        oldStyles[style] = getStyle(style);
    });

    var observer = new MutationObserver(function(mutations) {
        var changeSet = {};

        mutations.forEach(function(mutation) {
            if (mutation.attributeName !== 'style') return;

            var isHidden = OTHelpers.isDisplayNone(element);

            stylesToObserve.forEach(function(style) {
                if(isHidden && (style == 'width' || style == 'height')) return;

                var newValue = getStyle(style);

                if (newValue !== oldStyles[style]) {
                    // OT.debug("CHANGED " + style + ": " + oldStyles[style] + " -> " + newValue);

                    changeSet[style] = [oldStyles[style], newValue];
                    oldStyles[style] = newValue;
                }
            });
        });

        if (objectHasProperties(changeSet)) {
            // Do this after so as to help avoid infinite loops of mutations.
            OTHelpers.callAsync(function() {
                onChange.call(null, changeSet);
            });
        }
    });

    observer.observe(element, {
        attributes:true,
        attributeFilter: ['style'],
        childList:false,
        characterData:false,
        subtree:false
    });

    return observer;
};


// trigger the +onChange+ callback whenever
// 1. +element+ is removed
// 2. or an immediate child of +element+ is removed.
//
// This function returns the MutationObserver itself. Once you no longer wish
// to observe the element you should call disconnect on the observer.
//
// Observing changes:
//  // observe changings to the width and height of object
//  nodeObserver = OTHelpers.observeNodeOrChildNodeRemoval(object, function(removedNodes) {
//      OT.debug("Some child nodes were removed");
//      removedNodes.forEach(function(node) {
//          OT.debug(node);
//      });
//  });
//
// Cleaning up
//  // stop observing changes
//  nodeObserver.disconnect();
//  nodeObserver = null;
//
OTHelpers.observeNodeOrChildNodeRemoval = function(element, onChange) {
    var observer = new MutationObserver(function(mutations) {
        var removedNodes = [];

        mutations.forEach(function(mutation) {
            if (mutation.removedNodes.length) {
                removedNodes = removedNodes.concat(Array.prototype.slice.call(mutation.removedNodes));
            }
        });

        if (removedNodes.length) {
            // Do this after so as to help avoid infinite loops of mutations.
            OTHelpers.callAsync(function() {
                onChange(removedNodes);
            });
        }
    });

    observer.observe(element, {
        attributes:false,
        childList:true,
        characterData:false,
        subtree:true
    });

    return observer;
};

})(window, window.OTHelpers);

/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')
// tb_require('./dom.js')

(function(window, OTHelpers, undefined) {

OTHelpers.Modal = function(title, body) {
    /*jshint multistr:true*/
    var tmpl = "\
        <header>\
            <h1><%= title %></h1>\
        </header>\
        <div class='OT_dialog-body'>\
            <%= body %>\
        </div>\
    ";

    this.el = OTHelpers.createElement("section", {
            className: "OT_root OT_dialog OT_modal"
        },
        OTHelpers.template(tmpl, {
            title: title,
            body: body
        })
    );

    // We're going to center the element in the window. We need to add the
    // element to the body before we do, otherwise we can't calculate the dialog's
    // widths and heights. This means we need to hide the element first.
    this.el.style.display = 'none';
    document.body.appendChild(this.el);
    OTHelpers.centerElement(this.el);
    OTHelpers.show(this.el);

    this.close = function() {
        OTHelpers.removeElement(this.el);
        this.el = null;
        return this;
    };
};

// Custom alert dialog
OTHelpers.tbAlert = function(title, message) {
    var modal = new OTHelpers.Modal(title, "<div>" + message + "</div>");
    OTHelpers.addClass(modal.el, "OT_tbalert");

    var closeBtn = OTHelpers.createElement("input", {
            className: "OT_closeButton",
            type: "button",
            value: "close"
    });
    modal.el.appendChild(closeBtn);

    closeBtn.onclick = function() {
        if (modal) modal.close();
        modal = null;
    };
};

})(window, window.OTHelpers);

// DOM Attribute helpers helpers

/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')
// tb_require('./dom.js')

(function(window, OTHelpers, undefined) {

OTHelpers.addClass = function(element, value) {
    // Only bother targeting Element nodes, ignore Text Nodes, CDATA, etc
    if (element.nodeType !== 1) {
        return;
    }

    var classNames = value.trim().split(/\s+/),
        i, l;

    if (OTHelpers.supportsClassList()) {
        for (i=0, l=classNames.length; i<l; ++i) {
            element.classList.add(classNames[i]);
        }

        return;
    }

    // Here's our fallback to browsers that don't support element.classList

    if (!element.className && classNames.length === 1) {
        element.className = value;
    }
    else {
        var setClass = " " + element.className + " ";

        for (i=0, l=classNames.length; i<l; ++i) {
            if ( !~setClass.indexOf( " " + classNames[i] + " ")) {
                setClass += classNames[i] + " ";
            }
        }

        element.className = setClass.trim();
    }

    return this;
};

OTHelpers.removeClass = function(element, value) {
    if (!value) return;

    // Only bother targeting Element nodes, ignore Text Nodes, CDATA, etc
    if (element.nodeType !== 1) {
        return;
    }

    var newClasses = value.trim().split(/\s+/),
        i, l;

    if (OTHelpers.supportsClassList()) {
        for (i=0, l=newClasses.length; i<l; ++i) {
            element.classList.remove(newClasses[i]);
        }

        return;
    }

    var className = (" " + element.className + " ").replace(/[\s+]/, ' ');

    for (i=0,l=newClasses.length; i<l; ++i) {
        className = className.replace(' ' + newClasses[i] + ' ', ' ');
    }

    element.className = className.trim();

    return this;
};


/**
 * Methods to calculate element widths and heights.
 */

var _width = function(element) {
        if (element.offsetWidth > 0) {
            return element.offsetWidth + 'px';
        }

        return OTHelpers.css(element, 'width');
    },

    _height = function(element) {
        if (element.offsetHeight > 0) {
            return element.offsetHeight + 'px';
        }

        return OTHelpers.css(element, 'height');
    };

OTHelpers.width = function(element, newWidth) {
    if (newWidth) {
        OTHelpers.css(element, 'width', newWidth);
        return this;
    }
    else {
        if (OTHelpers.isDisplayNone(element)) {
            // We can't get the width, probably since the element is hidden.
            return OTHelpers.makeVisibleAndYield(element, function() {
                return _width(element);
            });
        }
        else {
            return _width(element);
        }
    }
};

OTHelpers.height = function(element, newHeight) {
    if (newHeight) {
        OTHelpers.css(element, 'height', newHeight);
        return this;
    }
    else {
        if (OTHelpers.isDisplayNone(element)) {
            // We can't get the height, probably since the element is hidden.
            return OTHelpers.makeVisibleAndYield(element, function() {
                return _height(element);
            });
        }
        else {
            return _height(element);
        }
    }
};

// Centers +element+ within the window. You can pass through the width and height
// if you know it, if you don't they will be calculated for you.
OTHelpers.centerElement = function(element, width, height) {
    if (!width) width = parseInt(OTHelpers.width(element), 10);
    if (!height) height = parseInt(OTHelpers.height(element), 10);

    var marginLeft = -0.5 * width + "px";
    var marginTop = -0.5 * height + "px";
    OTHelpers.css(element, "margin", marginTop + " 0 0 " + marginLeft);
    OTHelpers.addClass(element, "OT_centered");
};

})(window, window.OTHelpers);
// CSS helpers helpers

/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')
// tb_require('./dom.js')

(function(window, OTHelpers, undefined) {

var displayStateCache = {},
    defaultDisplays = {};

var defaultDisplayValueForElement = function(element) {
    if (defaultDisplays[element.ownerDocument] && defaultDisplays[element.ownerDocument][element.nodeName]) {
        return defaultDisplays[element.ownerDocument][element.nodeName];
    }

    if (!defaultDisplays[element.ownerDocument]) defaultDisplays[element.ownerDocument] = {};

    // We need to know what display value to use for this node. The easiest way
    // is to actually create a node and read it out.
    var testNode = element.ownerDocument.createElement(element.nodeName),
        defaultDisplay;

    element.ownerDocument.body.appendChild(testNode);
    defaultDisplay = defaultDisplays[element.ownerDocument][element.nodeName] = OTHelpers.css(testNode, 'display');

    OTHelpers.removeElement(testNode);
    testNode = null;

    return defaultDisplay;
};

var isHidden = function(element) {
    var computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
    return computedStyle.getPropertyValue('display') === 'none';
};

OTHelpers.show = function(element) {
    var display = element.style.display;
        //,
        // computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null),
        // computedDisplay = computedStyle.getPropertyValue('display');

    if (display === '' || display === 'none') {
        element.style.display = displayStateCache[element] || '';
        delete displayStateCache[element];
    }

    if (isHidden(element)) {
        // It's still hidden so there's probably a stylesheet that declares this
        // element as display:none;
        displayStateCache[element] = 'none';

        element.style.display = defaultDisplayValueForElement(element);
    }

    return this;
};

OTHelpers.hide = function(element) {
    if (element.style.display === 'none') return;

    displayStateCache[element] = element.style.display;
    element.style.display = 'none';

    return this;
};

OTHelpers.css = function(element, nameOrHash, value) {
    if (typeof(nameOrHash) !== 'string') {
        var style = element.style;

        for (var cssName in nameOrHash) {
            style[cssName] = nameOrHash[cssName];
        }

        return this;
    }
    else if (value !== undefined) {
        element.style[nameOrHash] = value;
        return this;
    }
    else {
        // Normalise vendor prefixes from the form MozTranform to -moz-transform
        // except for ms extensions, which are weird...
        var name = nameOrHash.replace( /([A-Z]|^ms)/g, "-$1" ).toLowerCase(),
            computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null),
            currentValue = computedStyle.getPropertyValue(name);

        if (currentValue === '') {
            currentValue = element.style[name];
        }

        return currentValue;
    }
};


// Apply +styles+ to +element+ while executing +callback+, restoring the previous
// styles after the callback executes.
OTHelpers.applyCSS = function(element, styles, callback) {
    var oldStyles = {},
        name,
        ret;

    // Backup the old styles
    for (name in styles) {
        if (styles.hasOwnProperty(name)) {
            // We intentionally read out of style here, instead of using the css
            // helper. This is because the css helper uses querySelector and we
            // only want to pull values out of the style (domeElement.style) hash.
            oldStyles[name] = element.style[name];

            OTHelpers.css(element, name, styles[name]);
        }
    }

    ret = callback();

    // Restore the old styles
    for (name in styles) {
        if (styles.hasOwnProperty(name)) {
            OTHelpers.css(element, name, oldStyles[name] || '');
        }
    }

    return ret;
};

// Make +element+ visible while executing +callback+.
OTHelpers.makeVisibleAndYield = function(element, callback) {
    // find whether it's the element or an ancester that's display none and
    // then apply to whichever it is
    var targetElement = OTHelpers.findElementWithDisplayNone(element);
    if (!targetElement) return;

    return OTHelpers.applyCSS(targetElement, {
            display: "block",
            visibility: "hidden"
        },
        callback
    );
};

})(window, window.OTHelpers);
// AJAX helpers

/*jshint browser:true, smarttabs:true*/

// tb_require('../helpers.js')
// tb_require('./xml.js')

(function(window, OTHelpers, undefined) {

function formatPostData(data) { //, contentType
    // If it's a string, we assume it's properly encoded
    if (typeof(data) === 'string') return data;

    var queryString = [];

    for (var key in data) {
        queryString.push(
            encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
        );
    }

    return queryString.join('&').replace(/\+/g, "%20");
}

OTHelpers.getXML = function(url, options) {
    var callerSuccessCb = options && options.success,

        isValidXMLDocument = function(xmlDocument) {
            var root;

            if (!xmlDocument) {
                // Badly formed XML
                return false;
            }

            // If we got some XML back, attempt to infer if the XML is badly formed
            root = xmlDocument.documentElement;

            if (!root || !root.nodeName || root.nodeName === "parsererror") {
                // Badly formed XML
                return false;
            }

            return true;
        },

        onSuccess = function(event) {
            var response = event.target.responseXML;

            if (isValidXMLDocument(response)) {
                if (callerSuccessCb) callerSuccessCb(response, event, event.target);
            }
            else if (options && options.error) {
                options.error(event, event.target);
            }
        };

    var extendedHeaders = OTHelpers.extend(options.headers || {}, {
            'Content-Type': 'application/xml'
        });

    OTHelpers.get(url, OTHelpers.extend(options || {}, {
        success: onSuccess,
        headers: extendedHeaders
    }));
};

OTHelpers.getJSON = function(url, options) {
    var callerSuccessCb = options && options.success,
        onSuccess = function(event) {
            var response;

            try {
                response = JSON.parse(event.target.responseText);
            } catch(e) {
                // Badly formed JSON
                if (options && options.error) options.error(event, event.target);
                return;
            }

            if (callerSuccessCb) callerSuccessCb(response, event, event.target);
        };

    OTHelpers.get(url, OTHelpers.extend(options || {}, {
        success: onSuccess,
        headers: {
            'Content-Type': 'application/json'
        }
    }));
};

OTHelpers.get = function(url, options) {
    var request = new XMLHttpRequest(),
        _options = options || {};

    bindToSuccessAndErrorCallbacks(request, _options.success, _options.error);
    if (_options.process) request.addEventListener("progress", _options.progress, false);
    if (_options.cancelled) request.addEventListener("abort", _options.cancelled, false);


    request.open('GET', url, true);

    if (!_options.headers) _options.headers = {};

    for (var name in _options.headers) {
        request.setRequestHeader(name, _options.headers[name]);
    }

    request.send();
};

OTHelpers.post = function(url, options) {
    var request = new XMLHttpRequest(),
        _options = options || {};

    bindToSuccessAndErrorCallbacks(request, _options.success, _options.error);

    if (_options.process) request.addEventListener("progress", _options.progress, false);
    if (_options.cancelled) request.addEventListener("abort", _options.cancelled, false);

    request.open('POST', url, true);

    if (!_options.headers) _options.headers = {};

    for (var name in _options.headers) {
        request.setRequestHeader(name, _options.headers[name]);
    }

    request.send(formatPostData(_options.data));
};

OTHelpers.postFormData = function(url, data, options) {
    if (!data) {
        throw new Error("OTHelpers.postFormData must be passed a data options.");
    }

    var formData = new FormData();

    for (var key in data) {
        formData.append(key, data[key]);
    }

    OTHelpers.post(url, OTHelpers.extend(options || {}, {
        data: formData
    }));
};


// Make a GET request via JSONP.
//
// @example Make a request to 'http://tokbox.com:9999/session/foo' with success and error callbacks
//
//  OTHelpers.getJSONP('http://tokbox.com:9999/session/foo', {
//      success: successCallback,
//      error: errorCallback
//  });
//
OTHelpers.getJSONP = function(url, options) {
    var _loadTimeout = 30000,
        _script,
        _head = document.head || document.getElementsByTagName('head')[0],
        _waitUntilTimeout,
        _urlWithCallback = url,
        _options = OTHelpers.extend(options || {}, {
            callbackParameter: 'callback'
        }),

        _clearTimeout = function() {
            if (_waitUntilTimeout) {
                clearTimeout(_waitUntilTimeout);
                _waitUntilTimeout = null;
            }
        },

        _cleanup = function() {
            _clearTimeout();

            if (_script) {
                _script.onload = _script.onreadystatechange = null;

                OTHelpers.removeElement( _script );

                _script = undefined;
            }
        },

        _onLoad = function() {
            if (_script.readyState && !/loaded|complete/.test( _script.readyState )) {
                // Yeah, we're not ready yet...
                return;
            }

            _clearTimeout();
        },

        _onLoadTimeout = function() {
            _cleanup();

            OTHelpers.error("The JSONP request to " + _urlWithCallback + " timed out after " + _loadTimeout + "ms.");
            if (_options.error) _options.error("The JSONP request to " + url + " timed out after " + _loadTimeout + "ms.", _urlWithCallback,  _options);
        },

        _generateCallbackName = function() {
            return 'jsonp_callback_' + (+new Date());
        };


    _options.callbackName = _generateCallbackName();
    this.jsonp_callbacks[_options.callbackName] = function(response) {
        _cleanup();

        if (_options.success) _options.success(response);
    };

    // This doesn't handle URLs like "http://www.google.com?blah=1#something". The callback name
    // will be incorrectly appended after the #.
    _urlWithCallback += ((/\?/).test(_urlWithCallback) ? "&" : "?") + _options.callbackParameter + '=' + _options.callbackName;

    _script = OTHelpers.createElement('script', {
        async: 'async',
        src: _urlWithCallback,
        onload: _onLoad,
        onreadystatechange: _onLoad
    });
    _head.appendChild(_script);

    _waitUntilTimeout = setTimeout(function() { _onLoadTimeout(); }, _loadTimeout);
};

// Private helper method used (by OTHelpers.get and OTHelpers.post among others) to setup
// callbacks to correctly respond to success and error callbacks. This includes
// interpreting the responses HTTP status, which XmlHttpRequest seems to ignore
// by default.
var bindToSuccessAndErrorCallbacks = function(request, success, error) {
    request.addEventListener("load", function(event) {
        var status = event.target.status;

        // We need to detect things that XMLHttpRequest considers a success,
        // but we consider to be failures.
        if ( status >= 200 && status < 300 || status === 304 ) {
            if (success) success.apply(null, arguments);
        }
        else if (error) {
            error(event);
        }
    }, false);


    if (error) {
        request.addEventListener("error", error, false);
    }
};

})(window, window.OTHelpers);
!(function(window) {

if (!window.OT) window.OT = {};

// Bring OTHelpers in as OT.$
OT.$ = OTHelpers.noConflict();

// Allow events to be bound on OT
OT.$.eventing(OT);

// OT.$.Modal was OT.Modal before the great common-js-helpers move
OT.Modal = OT.$.Modal;

// Add logging methods
OT.$.useLogHelpers(OT);
var _debugHeaderLogged = false;
var _setLogLevel = OT.setLogLevel;

// On the first time log level is set to DEBUG (or higher) show version info.
OT.setLogLevel = function(level) {
    // Set OT.$ to the same log level
    OT.$.setLogLevel(level);
    var retVal = _setLogLevel.call(OT, level);
    if (OT.shouldLog(OT.DEBUG) && !_debugHeaderLogged) {
        OT.debug("OpenTok JavaScript library " + OT.properties.version);
        OT.debug("Release notes: " + OT.properties.websiteURL  +"/opentok/webrtc/docs/js/release-notes.html");
        OT.debug("Known issues: " + OT.properties.websiteURL + "/opentok/webrtc/docs/js/release-notes.html#knownIssues");
        _debugHeaderLogged = true;
    }
    OT.debug("TB.setLogLevel(" + retVal + ")");
    return retVal;
};

OT.setLogLevel(OT.properties.debug ? OT.DEBUG : OT.ERROR);

/**
* Sets the API log level.
* <p>
* Calling <code>TB.setLogLevel()</code> sets the log level for runtime log messages that are the OpenTok library generates.
* The default value for the log level is <code>TB.ERROR</code>.
* </p>
* <p>
* The OpenTok JavaScript library displays log messages in the debugger console (such as Firebug), if one exists.
* </p>
* <p>
* The following example logs the session ID to the console, by calling <code>TB.log()</code>. The code also logs
* an error message when it attempts to publish a stream before the Session object dispatches a
* <code>sessionConnected</code> event.
* </p>
* <pre>
* TB.setLogLevel(TB.LOG);
* session = TB.initSession(sessionId);
* TB.log(sessionId);
* publisher = TB.initPublisher(API_KEY, "publishContainer");
* session.publish(publisher);
* </pre>
*
* @param {Number} logLevel The degree of logging desired by the developer:
*
* <p>
* <ul>
*   <li>
*     <code>TB.NONE</code> &#151; API logging is disabled.
*   </li>
*   <li>
*     <code>TB.ERROR</code> &#151; Logging of errors only.
*   </li>
*   <li>
*     <code>TB.WARN</code> &#151; Logging of warnings and errors.
*   </li>
*   <li>
*     <code>TB.INFO</code> &#151; Logging of other useful information, in addition to warnings and errors.
*   </li>
*   <li>
*     <code>TB.LOG</code> &#151; Logging of <code>TB.log()</code> messages, in addition to OpenTok info, warning,
*     and error messages.
*   </li>
*   <li>
*     <code>TB.DEBUG</code> &#151; Fine-grained logging of all API actions, as well as <code>TB.log()</code> messages.
*   </li>
* </ul>
* </p>
*
* @name TB.setLogLevel
* @memberof TB
* @function
* @see <a href="#log">TB.log()</a>
*/

/**
* Sends a string to the the debugger console (such as Firebug), if one exists. However, the function
* only logs to the console if you have set the log level to <code>TB.LOG</code> or <code>TB.DEBUG</code>,
* by calling <code>TB.setLogLevel(TB.LOG)</code> or <code>TB.setLogLevel(TB.DEBUG)</code>.
*
* @param {String} message The string to log.
*
* @name TB.log
* @memberof TB
* @function
* @see <a href="#setLogLevel">TB.setLogLevel()</a>
*/

})(window);
(function(window) {

// IMPORTANT This file should be included straight after helpers.js
if (!window.OT) window.OT = {};

if (!OT.properties) {
	throw new Error("OT.properties does not exist, please ensure that you include a valid properties file.");
}

// Consumes and overwrites OT.properties. Makes it better and stronger!
OT.properties = function(properties) {
    var props = OT.$.clone(properties);

    props.debug = properties.debug === 'true' || properties.debug === true;
    props.supportSSL = properties.supportSSL === 'true' || properties.supportSSL === true;

    if (props.supportSSL && (window.location.protocol.indexOf("https") >= 0 || window.location.protocol.indexOf("chrome-extension") >= 0)) {
        props.assetURL = props.cdnURLSSL + "/webrtc/" + props.version;
        props.loggingURL = props.loggingURLSSL;
        props.apiURL = props.apiURLSSL;
    } else {
        props.assetURL = props.cdnURL + "/webrtc/" + props.version;
    }

    props.configURL = props.assetURL + "/js/dynamic_config.min.js";
    props.cssURL = props.assetURL + "/css/ot.min.css";

    return props;
}(OT.properties);

})(window);
(function(window) {

//--------------------------------------
// JS Dynamic Config
//--------------------------------------


OT.Config = (function() {
    var _loaded = false,
        _global = {},
        _partners = {},
        _script,
        _head = document.head || document.getElementsByTagName('head')[0],
        _loadTimer,

        _clearTimeout = function() {
            if (_loadTimer) {
                clearTimeout(_loadTimer);
                _loadTimer = null;
            }
        },

        _cleanup = function() {
            _clearTimeout();

            if (_script) {
                _script.onload = _script.onreadystatechange = null;

                if ( _head && _script.parentNode ) {
                    _head.removeChild( _script );
                }

                _script = undefined;
            }
        },

        _onLoad = function() {
            // Only IE and Opera actually support readyState on Script elements.
            if (_script.readyState && !/loaded|complete/.test( _script.readyState )) {
                // Yeah, we're not ready yet...
                return;
            }

            _clearTimeout();

            if (!_loaded) {
                // Our config script is loaded but there is not config (as
                // replaceWith wasn't called). Something went wrong. Possibly
                // the file we loaded wasn't actually a valid config file.
                _this._onLoadTimeout();
            }
        },

        _getModule = function(moduleName, apiKey) {
            if (apiKey && _partners[apiKey] && _partners[apiKey][moduleName]) {
                return _partners[apiKey][moduleName];
            }

            return _global[moduleName];
        },

        _this = {
            // In ms
            loadTimeout: 4000,

            load: function(configUrl) {
                if (!configUrl) throw new Error("You must pass a valid configUrl to Config.load");

                _loaded = false;

                setTimeout(function() {
                    _script = document.createElement( "script" );
                    _script.async = "async";
                    _script.src = configUrl;
                    _script.onload = _script.onreadystatechange = _onLoad.bind(this);
                    _head.appendChild(_script);
                },1);

                _loadTimer = setTimeout(function() {
                    _this._onLoadTimeout();
                }, this.loadTimeout);
            },

            _onLoadTimeout: function() {
                _cleanup();

                OT.warn("TB DynamicConfig failed to load in " + _this.loadTimeout + " ms");
                this.trigger('dynamicConfigLoadFailed');
            },

            isLoaded: function() {
                return _loaded;
            },

            reset: function() {
                _cleanup();
                _loaded = false;
                _global = {};
                _partners = {};
            },

            // This is public so that the dynamic config file can load itself.
            // Using it for other purposes is discouraged, but not forbidden.
            replaceWith: function(config) {
                _cleanup();

                if (!config) config = {};

                _global = config.global || {};
                _partners = config.partners || {};

                if (!_loaded) _loaded = true;
                this.trigger('dynamicConfigChanged');
            },

            // @example Get the value that indicates whether exceptionLogging is enabled
            //  OT.Config.get('exceptionLogging', 'enabled');
            //
            // @example Get a key for a specific partner, fallback to the default if there is
            // no key for that partner
            //  OT.Config.get('exceptionLogging', 'enabled', 'apiKey');
            //
            get: function(moduleName, key, apiKey) {
                var module = _getModule(moduleName, apiKey);
                return module ? module[key] : null;
            }
        };

    OT.$.eventing(_this);

    return _this;
})();

})(window);
(function(window) {

var defaultAspectRatio = 4.0/3.0;

// This code positions the video element so that we don't get any letterboxing.
// It will take into consideration aspect ratios other than 4/3 but only when
// the video element is first created. If the aspect ratio changes at a later point
// this calculation will become incorrect.
function fixAspectRatio(element, width, height, desiredAspectRatio, rotated) {
    if (!width) width = parseInt(OT.$.width(element.parentNode), 10);
    else width = parseInt(width, 10);

    if (!height) height = parseInt(OT.$.height(element.parentNode), 10);
    else height = parseInt(height, 10);

    if (width === 0 || height === 0) return;

    if (!desiredAspectRatio) desiredAspectRatio = defaultAspectRatio;

    var actualRatio = (width + 0.0)/height,
        props = {
            width: '100%',
            height: '100%',
            left: 0,
            top: 0
        };

    if (actualRatio > desiredAspectRatio) {
        // Width is largest so we blow up the height so we don't have letterboxing
        var newHeight = (actualRatio / desiredAspectRatio) * 100;

        props.height = newHeight + '%';
        props.top = '-' + ((newHeight - 100) / 2) + '%';
    } else if (actualRatio < desiredAspectRatio) {
        // Height is largest, blow up the width
        var newWidth = (desiredAspectRatio / actualRatio) * 100;

        props.width = newWidth + '%';
        props.left = '-' + ((newWidth - 100) / 2) + '%';
    }

    OT.$.css(element, props);

    var video = element.querySelector('video');
    if(video) {
        if(rotated) {
            var w = element.offsetWidth,
                h = element.offsetHeight,
                props = { width: h + 'px', height: w + 'px', marginTop: '', marginLeft: '' },
                diff = w - h;
                props.marginLeft = (diff / 2) + 'px';
                props.marginTop = -(diff / 2) + 'px';
                OT.$.css(video, props);
        } else {
            OT.$.css(video, { width: '', height: '', marginTop: '', marginLeft: ''});
        }
    }

}

var getOrCreateContainer = function getOrCreateContainer(elementOrDomId, insertMode) {
    var container,
        domId;

    if (elementOrDomId && elementOrDomId.nodeName) {
        // It looks like we were given a DOM element. Grab the id or generate
        // one if it doesn't have one.
        container = elementOrDomId;
        if (!container.getAttribute('id') || container.getAttribute('id').length === 0) {
            container.setAttribute('id', 'OT_' + OT.$.uuid());
        }

        domId = container.getAttribute('id');
    }
    else {
        // We may have got an id, try and get it's DOM element.
        container = OT.$(elementOrDomId);
        domId = elementOrDomId || ('OT_' + OT.$.uuid());
    }

    if (!container) {
        container = OT.$.createElement('div', {id: domId});
        container.style.backgroundColor = "#000000";
        document.body.appendChild(container);
    }
    else {
        OT.$.emptyElement(container);
    }

    if(!(insertMode == null || insertMode == 'replace')) {
      var placeholder = document.createElement('div');
      placeholder.id = ('OT_' + OT.$.uuid());
      if(insertMode == 'append') {
        container.appendChild(placeholder);
        container = placeholder;
      } else if(insertMode == 'before') {
        container.parentNode.insertBefore(placeholder, container);
        container = placeholder;
      } else if(insertMode == 'after') {
        container.parentNode.insertBefore(placeholder, container.nextSibling);
        container = placeholder;
      }
    }

    return container;
};

// Creates the standard container that the Subscriber and Publisher use to hold
// their video element and other chrome.
OT.WidgetView = function(targetElement, properties) {
    var container = getOrCreateContainer(targetElement, properties && properties.insertMode),
        videoContainer = document.createElement('div'),
        oldContainerStyles = {},
        dimensionsObserver,
        videoElement,
        videoObserver,
        posterContainer,
        loadingContainer,
        loading = true;

    if (properties) {
        width = properties.width;
        height = properties.height;

        if (width) {
            if (typeof(width) == "number") {
                width = width + "px";
            }
        }

        if (height) {
            if (typeof(height) == "number") {
                height = height + "px";
            }
        }

        container.style.width = width ? width : "264px";
        container.style.height = height ? height : "198px";
        container.style.overflow = "hidden";

        if (properties.mirror === undefined || properties.mirror) OT.$.addClass(container, 'OT_mirrored');
    }

    if (properties.classNames) OT.$.addClass(container, properties.classNames);
    OT.$.addClass(container, 'OT_loading');


    OT.$.addClass(videoContainer, 'OT_video-container');
    videoContainer.style.width = container.style.width;
    videoContainer.style.height = container.style.height;
    container.appendChild(videoContainer);
    fixAspectRatio(videoContainer, container.offsetWidth, container.offsetHeight);

    loadingContainer = document.createElement("div");
    OT.$.addClass(loadingContainer, "OT_video-loading");
    videoContainer.appendChild(loadingContainer);

    posterContainer = document.createElement("div");
    OT.$.addClass(posterContainer, "OT_video-poster");
    videoContainer.appendChild(posterContainer);

    oldContainerStyles.width = container.offsetWidth;
    oldContainerStyles.height = container.offsetHeight;

    // Observe changes to the width and height and update the aspect ratio
    dimensionsObserver = OT.$.observeStyleChanges(container, ['width', 'height'], function(changeSet) {
        var width = changeSet.width ? changeSet.width[1] : container.offsetWidth,
            height = changeSet.height ? changeSet.height[1] : container.offsetHeight;

        fixAspectRatio(videoContainer, width, height, videoElement ? videoElement.aspectRatio : null);
    });


    // @todo observe if the video container or the video element get removed, if they do we should do some cleanup
    videoObserver = OT.$.observeNodeOrChildNodeRemoval(container, function(removedNodes) {
        if (!videoElement) return;

        // This assumes a video element being removed is the main video element. This may
        // not be the case.
        var videoRemoved = removedNodes.some(function(node) { return node === videoContainer || node.nodeName === 'VIDEO'; });

        if (videoRemoved) {
            videoElement.destroy();
            videoElement = null;
        }

        if (videoContainer) {
            OT.$.removeElement(videoContainer);
            videoContainer = null;
        }

        if (dimensionsObserver) {
            dimensionsObserver.disconnect();
            dimensionsObserver = null;
        }

        if (videoObserver) {
            videoObserver.disconnect();
            videoObserver = null;
        }
    });

    this.destroy = function() {
        if (dimensionsObserver) {
            dimensionsObserver.disconnect();
            dimensionsObserver = null;
        }

        if (videoObserver) {
            videoObserver.disconnect();
            videoObserver = null;
        }

        if (videoElement) {
            videoElement.destroy();
            videoElement = null;
        }

        if (container) {
            OT.$.removeElement(container);
            container = null;
        }
    };

    Object.defineProperties(this, {

        showPoster: {
            get: function() {
                return !OT.$.isDisplayNone(posterContainer);
            },
            set: function(shown) {
                if(shown) {
                    OT.$.show(posterContainer);
                }
                else {
                    OT.$.hide(posterContainer);
                }
            }
        },

        poster: {
            get: function() {
                return OT.$.css(posterContainer, "backgroundImage");
            },
            set: function(src) {
                OT.$.css(posterContainer, "backgroundImage", "url(" + src + ")");
            }
        },

        loading: {
            get: function() { return loading; },
            set: function(l) {
                loading = l;

                if (loading) {
                    OT.$.addClass(container, 'OT_loading');
                }
                else {
                    OT.$.removeClass(container, 'OT_loading');
                }
            }
        },

        video: {
            get: function() { return videoElement; },
            set: function(video) {
                // remove the old video element if it exists
                // @todo this might not be safe, publishers/subscribers use this as well...
                if (videoElement) videoElement.destroy();

                video.appendTo(videoContainer);
                videoElement = video;

                videoElement.on({
                    orientationChanged: function(){
                        fixAspectRatio(videoContainer, container.offsetWidth, container.offsetHeight, videoElement.aspectRatio, videoElement.isRotated);
                    }
                });

                fixAspectRatio(videoContainer, container.offsetWidth, container.offsetHeight, videoElement ? videoElement.aspectRatio : null, videoElement ? videoElement.isRotated : null);
            }
        },

        domElement: {
            get: function() { return container; }
        },

        domId: {
          get: function() { return container.getAttribute('id'); }
        }
    });

    this.addError = function(errorMsg) {
        container.innerHTML = "<p>" + errorMsg + "<p>";
        OT.$.addClass(container, "OT_subscriber_error");
    };
};

})(window);
// Web OT Helpers
(function(window) {

// Handy cross-browser getUserMedia shim. Inspired by some code from Adam Barth
var getUserMedia = (function() {
    if (navigator.getUserMedia) {
        return navigator.getUserMedia.bind(navigator);
    } else if (navigator.mozGetUserMedia) {
        return navigator.mozGetUserMedia.bind(navigator);
    } else if (navigator.webkitGetUserMedia) {
        return navigator.webkitGetUserMedia.bind(navigator);
    }
})();


if (navigator.webkitGetUserMedia) {
    // Stub for getVideoTracks for Chrome < 26
    if (!webkitMediaStream.prototype.getVideoTracks) {
        webkitMediaStream.prototype.getVideoTracks = function() {
            return this.videoTracks;
        };
    }

    // Stubs for getAudioTracks for Chrome < 26
    if (!webkitMediaStream.prototype.getAudioTracks) {
        webkitMediaStream.prototype.getAudioTracks = function() {
            return this.audioTracks;
        };
    }

    if (!webkitRTCPeerConnection.prototype.getLocalStreams) {
        webkitRTCPeerConnection.prototype.getLocalStreams = function() {
          return this.localStreams;
        };
    }

    if (!webkitRTCPeerConnection.prototype.getRemoteStreams) {
        webkitRTCPeerConnection.prototype.getRemoteStreams = function() {
          return this.remoteStreams;
        };
    }
}
else if (navigator.mozGetUserMedia) {
    // Firefox < 23 doesn't support get Video/Audio tracks, we'll just stub them out for now.
    if (!MediaStream.prototype.getVideoTracks) {
        MediaStream.prototype.getVideoTracks = function() {
            return [];
        };
    }

    if (!MediaStream.prototype.getAudioTracks) {
        MediaStream.prototype.getAudioTracks = function() {
            return [];
        };
    }

    // This won't work as mozRTCPeerConnection is a weird internal Firefox
    // object (a wrapped native object I think).
    // if (!window.mozRTCPeerConnection.prototype.getLocalStreams) {
    //     window.mozRTCPeerConnection.prototype.getLocalStreams = function() {
    //         return this.localStreams;
    //     };
    // }

    // This won't work as mozRTCPeerConnection is a weird internal Firefox
    // object (a wrapped native object I think).
    // if (!window.mozRTCPeerConnection.prototype.getRemoteStreams) {
    //     window.mozRTCPeerConnection.prototype.getRemoteStreams = function() {
    //         return this.remoteStreams;
    //     };
    // }
}


// Mozilla error strings and the equivalent W3C names. NOT_SUPPORTED_ERROR does not
// exist in the spec right now, so we'll include Mozilla's error description.
var mozToW3CErrors = {
    PERMISSION_DENIED: 'PERMISSION_DENIED',
    NOT_SUPPORTED_ERROR: "A constraint specified is not supported by the browser.",
    MANDATORY_UNSATISFIED_ERROR: 'CONSTRAINT_NOT_SATISFIED'
};

// Chrome only seems to expose a single error with a code of 1 right now.
var chromeToW3CErrors = {
    1: 'PERMISSION_DENIED'
};


var gumNamesToMessages = {
    PERMISSION_DENIED: "User denied permission for scripts from this origin to access the media device.",
    CONSTRAINT_NOT_SATISFIED: "One of the mandatory constraints could not be satisfied."
};

// Map vendor error strings to names and messages
var mapVendorErrorName = function mapVendorErrorName (vendorErrorName, vendorErrors) {
    var errorName = vendorErrors[vendorErrorName],
        errorMessage = gumNamesToMessages[errorName];

    if (!errorMessage) {
        // This doesn't map to a known error from the Media Capture spec, it's
        // probably a custom vendor error message.
        errorMessage = eventName;
        errorName = vendorErrorName;
    }

    return {
        name: errorName,
        message: errorMessage
    };
};

// Parse and normalise a getUserMedia error event from Chrome or Mozilla
//
// @ref http://dev.w3.org/2011/webrtc/editor/getusermedia.html#idl-def-NavigatorUserMediaError
//
var parseErrorEvent = function parseErrorObject (event) {
    var error;

    if (OT.$.isObject(event) && event.name) {
        error = {
            name: event.name,
            message: event.message,
            constraintName: event.constraintName
        };
    }
    else if (OT.$.isObject(event)) {
        error = mapVendorErrorName(event.code, chromeToW3CErrors);

        // message and constraintName are probably missing if the
        // property is also omitted, but just in case they aren't.
        if (event.message) error.message = event.message;
        if (event.constraintName) error.constraintName = event.constraintName;
    }
    else if (event && mozToW3CErrors.hasOwnProperty(event)) {
        error = mapVendorErrorName(event, mozToW3CErrors);
    }
    else {
        error = {
            message: "Unknown Error while getting user media"
        };
    }


    return error;
};



// Validates a Hash of getUserMedia constraints. Currently we only
// check to see if there is at least one non-false constraint.
var areInvalidConstraints = function(constraints) {
    if (!constraints || !OT.$.isObject(constraints)) return true;

    for (var key in constraints) {
        if (constraints[key]) return false;
    }

    return true;
};





// Returns true if the client supports Web RTC, false otherwise.
//
// Chrome Issues:
// * The explicit prototype.addStream check is because webkitRTCPeerConnection was
// partially implemented, but not functional, in Chrome 22.
//
// Firefox Issues:
// * No real support before Firefox 19
// * Firefox 19 has issues with generating Offers.
// * Firefox 20 doesn't interoperate with Chrome.
//
OT.$.supportsWebRTC = function() {
    var _supportsWebRTC = false;

    if (navigator.webkitGetUserMedia) {
        _supportsWebRTC = typeof(webkitRTCPeerConnection) === 'function' && !!webkitRTCPeerConnection.prototype.addStream;
    }
    else if (navigator.mozGetUserMedia) {
        var firefoxVersion = window.navigator.userAgent.toLowerCase().match(/Firefox\/([0-9\.]+)/i);
        _supportsWebRTC = typeof(mozRTCPeerConnection) === 'function' && (firefoxVersion !== null && parseFloat(firefoxVersion[1], 10) > 20.0);
        if (_supportsWebRTC) {
            try {
                new mozRTCPeerConnection();
                _supportsWebRTC = true;
            } catch (err) {
                _supportsWebRTC = false;
            }
        }
    }

    OT.$.supportsWebRTC = function() {
        return _supportsWebRTC;
    };

    return _supportsWebRTC;
};

// Returns a String representing the supported WebRTC crypto scheme. The possible
// values are SDES_SRTP, DTLS_SRTP, and NONE;
//
// Broadly:
// * Firefox only supports DTLS
// * Older versions of Chrome (<= 24) only support SDES
// * Newer versions of Chrome (>= 25) support DTLS and SDES
//
OT.$.supportedCryptoScheme = function() {
    if (!OT.$.supportsWebRTC()) return 'NONE';

    var chromeVersion = window.navigator.userAgent.toLowerCase().match(/chrome\/([0-9\.]+)/i);
    return chromeVersion && parseFloat(chromeVersion[1], 10) < 25 ? 'SDES_SRTP' : 'DTLS_SRTP';
};

// Returns true if the browser supports bundle
//
// Broadly:
// * Firefox doesn't support bundle
// * Chrome support bundle
//
OT.$.supportsBundle = function() {
    return OT.$.supportsWebRTC() && OT.$.browser() === 'Chrome';
};

// Returns true if the browser supports rtcp mux
//
// Broadly:
// * Older versions of Firefox (<= 25) don't support rtcp mux
// * Older versions of Firefox (>= 26) support rtcp mux (not tested yet)
// * Chrome support bundle
//
OT.$.supportsRtcpMux = function() {
    return OT.$.supportsWebRTC() && OT.$.browser() === 'Chrome';
};

// A wrapper for the builtin navigator.getUserMedia. In addition to the usual
// getUserMedia behaviour, this helper method also accepts a accessDialogOpened
// and accessDialogClosed callback.
//
// @memberof TB.$
// @private
//
// @param {Object} constraints
//      A dictionary of constraints to pass to getUserMedia. See <a href='http://dev.w3.org/2011/webrtc/editor/getusermedia.html#idl-def-MediaStreamConstraints'>MediaStreamConstraints</a> in the Media Capture and Streams spec for more info.
//
// @param {function} success
//      Called when getUserMedia completes successfully. The callback will be passed a WebRTC Stream object.
//
// @param {function} failure
//      Called when getUserMedia fails to access a user stream. It will be passed an object with a code property representing the error that occurred.
//
// @param {function} accessDialogOpened
//      Called when the access allow/deny dialog is opened.
//
// @param {function} accessDialogClosed
//      Called when the access allow/deny dialog is closed.
//
// @param {function} accessDenied
//      Called when access is denied to the camera/mic. This will be either because
//      the user has clicked deny or because a particular origin is permanently denied.
//
OT.$.getUserMedia = function(constraints, success, failure, accessDialogOpened, accessDialogClosed, accessDenied) {
    // All constraints are false, we don't allow this. This may be valid later
    // depending on how/if we integrate data channels.
    if (areInvalidConstraints(constraints)) {
        OT.error("Couldn't get UserMedia: All constraints were false");
        // Using a ugly dummy-code for now.
        failure.call(null, {
            name: 'NO_VALID_CONSTRAINTS',
            message: "Video and Audio was disabled, you need to enabled at least one"
        });

        return;
    }

    var triggerOpenedTimer = null,
        displayedPermissionDialog = false,

        finaliseAccessDialog = function() {
            if (triggerOpenedTimer) {
                clearTimeout(triggerOpenedTimer);
            }

            if (displayedPermissionDialog && accessDialogClosed) accessDialogClosed();
        },

        triggerOpened = function() {
            triggerOpenedTimer = null;
            displayedPermissionDialog = true;

            if (accessDialogOpened) accessDialogOpened();
        },

        onStream = function(stream) {
            finaliseAccessDialog();
            success.call(null, stream);
        },

        onError = function(event) {
            finaliseAccessDialog();
            var error = parseErrorEvent(event);

            if (error.name === 'PERMISSION_DENIED' || error.name === 'PermissionDeniedError') {
                accessDenied.call(null, error);
            }
            else {
                failure.call(null, error);
            }
        };

    try {
        getUserMedia(constraints, onStream, onError);
    } catch (e) {
        OT.error("Couldn't get UserMedia: " + e.toString());
        onError();
        return;
    }

    // The "remember me" functionality of WebRTC only functions over HTTPS, if
    // we aren't on HTTPS then we should definitely be displaying the access
    // dialog.
    //
    // If we are on HTTPS, we'll wait 500ms to see if we get a stream
    // immediately. If we do then the user had clicked "remember me". Otherwise
    // we assume that the accessAllowed dialog is visible.
    //
    // @todo benchmark and see if 500ms is a reasonable number. It seems like
    // we should know a lot quicker.
    //
    if (location.protocol.indexOf('https') === -1) {
        // Execute after, this gives the client a chance to bind to the
        // accessDialogOpened event.
        triggerOpenedTimer = setTimeout(triggerOpened, 100);
    }
    else {
        // wait a second and then trigger accessDialogOpened
        triggerOpenedTimer = setTimeout(triggerOpened, 500);
    }
};

OT.$.createPeerConnection = function (config, options) {
  var NativeRTCPeerConnection = (window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
  return new NativeRTCPeerConnection(config, options);
};


})(window);
(function(window) {

OT.VideoOrientation = {
    ROTATED_NORMAL: "OTVideoOrientationRotatedNormal",
    ROTATED_LEFT: "OTVideoOrientationRotatedLeft",
    ROTATED_RIGHT: "OTVideoOrientationRotatedRight",
    ROTATED_UPSIDE_DOWN: "OTVideoOrientationRotatedUpsideDown"
};

//
//
//   var _videoElement = new OT.VideoElement({
//     fallbackText: 'blah'
//   });
//
//   _videoElement.on({
//     streamBound: function() {...},
//     loadError: function() {...},
//     error: function() {...}
//   });
//
//   _videoElement.bindToStream(webRtcStream);      // => VideoElement
//   _videoElement.appendTo(DOMElement)             // => VideoElement
//
//   _videoElement.stream                           // => Web RTC stream
//   _videoElement.domElement                       // => DomNode
//   _videoElement.parentElement                    // => DomNode
//
//   _videoElement.imgData                          // => PNG Data string
//
//   _videoElement.orientation = OT.VideoOrientation.ROTATED_LEFT;
//
//   _videoElement.unbindStream();
//   _videoElement.destroy()                        // => Completely cleans up and removes the video element
//
//
OT.VideoElement = function(options) {
    var _stream,
        _domElement,
        _parentElement,
        _streamBound = false,
        _videoElementMovedWarning = false,
        _options = OT.$.defaults(options || {}, {
            fallbackText: 'Sorry, Web RTC is not available in your browser'
        });


    OT.$.eventing(this);

    /// Private API
    var _onVideoError = function(event) {
            var reason = "There was an unexpected problem with the Video Stream: " + videoElementErrorCodeToStr(event.target.error.code);
            this.trigger('error', null, reason, this);
        }.bind(this),

        _onStreamBound = function() {
            _streamBound = true;
            _domElement.addEventListener('error', _onVideoError, false);
            this.trigger('streamBound', this);
        }.bind(this),

        _onStreamBoundError = function(reason) {
            this.trigger('loadError', OT.ExceptionCodes.P2P_CONNECTION_FAILED, reason, this);
        }.bind(this),

        // The video element pauses itself when it's reparented, this is
        // unfortunate. This function plays the video again and is triggered
        // on the pause event.
        _playVideoOnPause = function() {
            if(!_videoElementMovedWarning) {
                OT.warn("Video element paused, auto-resuming. If you intended to do this, use publishVideo(false) or subscribeToVideo(false) instead.");
                _videoElementMovedWarning = true;
            }
            _domElement.play();
        };


    _domElement = createVideoElement(_options.fallbackText, _options.attributes);

    _domElement.addEventListener('pause', _playVideoOnPause);

    /// Public Properties
    Object.defineProperties(this, {
        stream: {get: function() {return _stream; }},
        domElement: {get: function() {return _domElement; }},
        parentElement: {get: function() {return _parentElement; }},
        isBoundToStream: {get: function() { return _streamBound; }},
        poster: {
            get: function() { return _domElement.getAttribute('poster'); },
            set: function(src) { _domElement.setAttribute('poster', src); }
        }
    });


    /// Public methods

    // Append the Video DOM element to a parent node
    this.appendTo = function(parentDomElement) {
        _parentElement = parentDomElement;
        _parentElement.appendChild(_domElement);

        return this;
    };

    // Bind a stream to the video element.
    this.bindToStream = function(webRtcStream) {
        _streamBound = false;
        _stream = webRtcStream;

        bindStreamToVideoElement(_domElement, _stream, _onStreamBound, _onStreamBoundError);

        return this;
    };

    // Unbind the currently bound stream from the video element.
    this.unbindStream = function() {
        if (!_stream) return this;

        if (_domElement) {
            if (!navigator.mozGetUserMedia) {
                // The browser would have released this on unload anyway, but
                // we're being a good citizen.
                window.URL.revokeObjectURL(_domElement.src);
            }
            else {
                _domElement.mozSrcObject = null;
            }
        }

        _stream = null;

        return this;
    };

    this.setAudioVolume = function(value) {
        if (_domElement) _domElement.volume = OT.$.roundFloat(value / 100, 2);
    };

    this.getAudioVolume = function() {
        // Return the actual volume of the DOM element
        if (_domElement) return parseInt(_domElement.volume * 100, 10);
        return 50;
    };

    this.whenTimeIncrements = function(callback, context) {
        if(_domElement) {
            var lastTime, handler = function() {
                if(!lastTime || lastTime >= _domElement.currentTime) {
                    lastTime = _domElement.currentTime;
                } else {
                    _domElement.removeEventListener('timeupdate', handler, false);
                    callback.call(context, this);
                }
            }.bind(this);
            _domElement.addEventListener('timeupdate', handler, false);
        }
    };

    this.destroy = function() {
        // unbind all events so they don't fire after the object is dead
        this.off();

        this.unbindStream();

        if (_domElement) {
            // Unbind this first, otherwise it will trigger when the
            // video element is removed from the DOM.
            _domElement.removeEventListener('pause', _playVideoOnPause);

            OT.$.removeElement(_domElement);
            _domElement = null;
        }

        _parentElement = null;

        return undefined;
    };
};


// Checking for window.defineProperty for IE compatibility, just so we don't throw exceptions when the script is included
if (OT.$.canDefineProperty) {
    // Extracts a snapshot from a video element and returns it's as a PNG Data string.
    Object.defineProperties(OT.VideoElement.prototype, {
        imgData: {
            get: function() {
                var canvas = OT.$.createElement('canvas', {
                        width: this.domElement.videoWidth,
                        height: this.domElement.videoHeight,
                        style: {
                            display: 'none'
                        }
                    });

                document.body.appendChild(canvas);
                try {
                    canvas.getContext('2d').drawImage(this.domElement, 0, 0, canvas.width, canvas.height);
                } catch(err) {
                    OT.warn("Cannot get image data yet");
                    return null;
                }
                var imgData = canvas.toDataURL('image/png');

                OT.$.removeElement(canvas);

                return imgData.replace("data:image/png;base64,", "").trim();
            }
        },

        videoWidth: {
            get: function() {
                if(this._orientation && this._orientation.width) {
                    return this._orientation.width;
                }
                return this.domElement['video' + (this.isRotated ? 'Height' : 'Width')];
            }
        },

        videoHeight: {
            get: function() {
                if(this._orientation && this._orientation.height) {
                    return this._orientation.height;
                }
                return this.domElement['video' + (this.isRotated ? 'Width' : 'Height')];
            }
        },

        aspectRatio: {
            get: function() {
                return (this.videoWidth + 0.0) / this.videoHeight;
            }
        },

        isRotated: {
            get: function() {
                return this._orientation && (this._orientation.videoOrientation == 'OTVideoOrientationRotatedLeft' || this._orientation.videoOrientation == 'OTVideoOrientationRotatedRight');
            }
        }
    });
}


var VideoOrientationTransforms = {
    OTVideoOrientationRotatedNormal: "rotate(0deg)",
    OTVideoOrientationRotatedLeft: "rotate(90deg)",
    OTVideoOrientationRotatedRight: "rotate(-90deg)",
    OTVideoOrientationRotatedUpsideDown: "rotate(180deg)"
};

// Checking for window.defineProperty for IE compatibility, just so we don't throw exceptions when the script is included
if (OT.$.canDefineProperty) {
    Object.defineProperty(OT.VideoElement.prototype,'orientation', {
        get: function() {
            return this._orientation;
        },
        set: function(orientation) {
            this._orientation = orientation;

            var transform = VideoOrientationTransforms[orientation.videoOrientation] || VideoOrientationTransforms.ROTATED_NORMAL;

            switch(OT.$.browser()) {
                case 'Chrome':
                case 'Safari':
                    this.domElement.style.webkitTransform = transform;
                    break;

                case 'IE':
                    this.domElement.style.msTransform = transform;
                    break;

                default:
                    // The standard version, just Firefox, Opera, and IE > 9
                    this.domElement.style.transform = transform;
            }

            this.trigger('orientationChanged');
        }
    });
}



/// Private Helper functions

function createVideoElement(fallbackText, attributes) {
    var videoElement = document.createElement('video');
    videoElement.setAttribute('autoplay', '');
    videoElement.innerHTML = fallbackText;

    if (attributes) {
        if (attributes.muted === true) {
            delete attributes.muted;
            videoElement.muted = 'true';
        }

        for (var key in attributes) {
            videoElement.setAttribute(key, attributes[key]);
        }
    }

    return videoElement;
}


// See http://www.w3.org/TR/2010/WD-html5-20101019/video.html#error-codes
var _videoErrorCodes = {};
// Checking for window.MediaError for IE compatibility, just so we don't throw exceptions when the script is included
if (window.MediaError) {
    _videoErrorCodes[window.MediaError.MEDIA_ERR_ABORTED] = "The fetching process for the media resource was aborted by the user agent at the user's request.";
    _videoErrorCodes[window.MediaError.MEDIA_ERR_NETWORK] = "A network error of some description caused the user agent to stop fetching the media resource, after the resource was established to be usable.";
    _videoErrorCodes[window.MediaError.MEDIA_ERR_DECODE] = "An error of some description occurred while decoding the media resource, after the resource was established to be usable.";
    _videoErrorCodes[window.MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED] = "The media resource indicated by the src attribute was not suitable. ";
}

function videoElementErrorCodeToStr(errorCode) {
    return _videoErrorCodes[parseInt(errorCode, 10)] || "An unknown error occurred.";
}


function bindStreamToVideoElement(videoElement, webRTCStream, onStreamBound, onStreamBoundError) {
    // Note: onloadedmetadata doesn't fire in Chrome for audio only crbug.com/110938
    if (navigator.mozGetUserMedia || (webRTCStream.getVideoTracks().length > 0 && webRTCStream.getVideoTracks()[0].enabled)) {

        var cleanup = function cleanup () {
                clearTimeout(timeout);
                videoElement.removeEventListener('loadedmetadata', onLoad, false);
                videoElement.removeEventListener('error', onError, false);
            },

            onLoad = function onLoad (event) {
                cleanup();
                onStreamBound();
            },

            onError = function onError (event) {
                cleanup();
                onStreamBoundError("There was an unexpected problem with the Video Stream: " + videoElementErrorCodeToStr(event.target.error.code));
            },

            onStoppedLoading = function onStoppedLoading () {
                // The stream ended before we fully bound it. Maybe the other end called
                // stop on it or something else went wrong.
                cleanup();
                onStreamBoundError("Stream ended while trying to bind it to a video element.");
            },

            // Timeout if it takes too long
            timeout = setTimeout(function() {
                if (videoElement.currentTime === 0) {
                    onStreamBoundError("The video stream failed to connect. Please notify the site owner if this continues to happen.");
                } else {
                    // This should never happen
                    OT.warn("Never got the loadedmetadata event but currentTime > 0");
                    onStreamBound();
                }
            }.bind(this), 30000);


        videoElement.addEventListener('loadedmetadata', onLoad, false);
        videoElement.addEventListener('error', onError, false);
        webRTCStream.onended = onStoppedLoading;
    } else {
        onStreamBound();
    }

    // The official spec way is 'srcObject', we are slowly converging there.
    if (videoElement.srcObject !== void 0) {
        videoElement.srcObject = webRTCStream;
    }
    else if (videoElement.mozSrcObject !== void 0) {
        videoElement.mozSrcObject = webRTCStream;
    }
    else {
        videoElement.src = window.URL.createObjectURL(webRTCStream);
    }

    videoElement.play();
}


})(window);
(function(window) {

// Singleton interval
var logQueue = [],
    queueRunning = false;


OT.Analytics = function() {

    var endPoint = OT.properties.loggingURL + "/logging/ClientEvent",
        endPointQos = OT.properties.loggingURL + "/logging/ClientQos",

        reportedErrors = {},

        // Map of camel-cased keys to underscored
        camelCasedKeys = {
            payloadType: 'payload_type',
            partnerId: 'partner_id',
            streamId: 'stream_id',
            sessionId: 'session_id',
            connectionId: 'connection_id',
            widgetType: 'widget_type',
            widgetId: 'widget_id',
            avgAudioBitrate: 'avg_audio_bitrate',
            avgVideoBitrate: 'avg_video_bitrate',
            localCandidateType: 'local_candidate_type',
            remoteCandidateType: 'remote_candidate_type',
            transportType: 'transport_type'
        },

        send = function(data, isQos, onSuccess, onError) {
            OT.$.post(isQos ? endPointQos : endPoint, {
                success: onSuccess,
                error: onError,
                data: data,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        },

        throttledPost = function() {
            // Throttle logs so that they only happen 1 at a time
            if (!queueRunning && logQueue.length > 0) {
                queueRunning = true;
                var curr = logQueue[0];

                // Remove the current item and send the next log
                var processNextItem = function() {
                    logQueue.shift();
                    queueRunning = false;
                    throttledPost();
                };

                if (curr) {
                    send(curr.data, curr.isQos, function() {
                        curr.onComplete();
                        setTimeout(processNextItem, 50);
                    }, function() {
                        OT.debug("Failed to send ClientEvent, moving on to the next item.");

                        // There was an error, move onto the next item
                        setTimeout(processNextItem, 50);
                    });
                }
            }
        },

        post = function(data, onComplete, isQos) {
            logQueue.push({
                data: data,
                onComplete: onComplete,
                isQos: isQos
            });

            throttledPost();
        },

        shouldThrottleError = function(code, type, partnerId) {
            if (!partnerId) return false;

            var errKey = [partnerId, type, code].join('_'),
                //msgLimit = DynamicConfig.get('exceptionLogging', 'messageLimitPerPartner', partnerId);
                msgLimit = 100;
            if (msgLimit === null || msgLimit === undefined) return false;

            return (reportedErrors[errKey] || 0) <= msgLimit;
        };

        // Log an error via ClientEvents.
        //
        // @param [String] code
        // @param [String] type
        // @param [String] message
        // @param [Hash] details additional error details
        //
        // @param [Hash] options the options to log the client event with.
        // @option options [String] action The name of the Event that we are logging. E.g. "TokShowLoaded". Required.
        // @option options [String] variation Usually used for Split A/B testing, when you have multiple variations of the +_action+.
        // @option options [String] payloadType A text description of the payload. Required.
        // @option options [String] payload The payload. Required.
        // @option options [String] sessionId The active OpenTok session, if there is one
        // @option options [String] connectionId The active OpenTok connectionId, if there is one
        // @option options [String] partnerId
        // @option options [String] guid ...
        // @option options [String] widgetId ...
        // @option options [String] streamId ...
        // @option options [String] section ...
        // @option options [String] build ...
        //
        // Reports will be throttled to X reports (see exceptionLogging.messageLimitPerPartner
        // from the dynamic config for X) of each error type for each partner. Reports can be
        // disabled/enabled globally or on a per partner basis (per partner settings
        // take precedence) using exceptionLogging.enabled.
        //
        this.logError = function(code, type, message, details, options) {
            if (!options) options = {};
            var partnerId = options.partnerId;

            if (OT.Config.get('exceptionLogging', 'enabled', partnerId) !== true) {
                return;
            }

            if (shouldThrottleError(code, type, partnerId)) {
                //OT.log("ClientEvents.error has throttled an error of type " + type + "." + code + " for partner " + (partnerId || 'No Partner Id'));
                return;
            }

            var errKey = [partnerId, type, code].join('_'),

                payload = this.escapePayload(OT.$.extend(details || {}, {
                    message: payload,
                    userAgent: navigator.userAgent
                }));


            reportedErrors[errKey] = typeof(reportedErrors[errKey]) !== 'undefined' ?
                                            reportedErrors[errKey] + 1 :
                                            1;

            return this.logEvent(OT.$.extend(options, {
                action: type + '.' + code,
                payloadType: payload[0],
                payload: payload[1]
            }));
        };

        // Log a client event to the analytics backend.
        //
        // @example Logs a client event called 'foo'
        //  OT.ClientEvents.log({
        //      action: 'foo',
        //      payload_type: "foo's payload",
        //      payload: 'bar',
        //      session_id: sessionId,
        //      connection_id: connectionId
        //  })
        //
        // @param [Hash] options the options to log the client event with.
        // @option options [String] action The name of the Event that we are logging. E.g. "TokShowLoaded". Required.
        // @option options [String] variation Usually used for Split A/B testing, when you have multiple variations of the +_action+.
        // @option options [String] payloadType A text description of the payload. Required.
        // @option options [String] payload The payload. Required.
        // @option options [String] session_id The active OpenTok session, if there is one
        // @option options [String] connection_id The active OpenTok connectionId, if there is one
        // @option options [String] partner_id
        // @option options [String] guid ...
        // @option options [String] widget_id ...
        // @option options [String] stream_id ...
        // @option options [String] section ...
        // @option options [String] build ...
        //
        this.logEvent = function(options) {
            var partnerId = options.partnerId;

            if (!options) options = {};

            // Set a bunch of defaults
            var data = OT.$.extend({
                    "variation" : "",
                    'guid' : this.getClientGuid(),
                    'widget_id' : "",
                    'session_id': '',
                    'connection_id': '',
                    'stream_id' : "",
                    'partner_id' : partnerId,
                    'source' : window.location.href,
                    'section' : "",
                    'build' : ""
                }, options),

                onComplete = function(){
                //  OT.log("logged: " + "{action: " + data["action"] + ", variation: " + data["variation"] + ", payload_type: " + data["payload_type"] + ", payload: " + data["payload"] + "}");
                };

            // We camel-case our names, but the ClientEvents backend wants them
            // underscored...
            for (var key in camelCasedKeys) {
                if (camelCasedKeys.hasOwnProperty(key) && data[key]) {
                    data[camelCasedKeys[key]] = data[key];
                    delete data[key];
                }
            }

            post(data, onComplete, false);
        };

        // Log a client QOS to the analytics backend.
        //
        this.logQOS = function(options) {
            var partnerId = options.partnerId;

            if (!options) options = {};

            // Set a bunch of defaults
            var data = OT.$.extend({
                    'guid' : this.getClientGuid(),
                    'widget_id' : "",
                    'session_id': '',
                    'connection_id': '',
                    'stream_id' : "",
                    'partner_id' : partnerId,
                    'source' : window.location.href,
                    'build' : "",
                    'duration' : 0 //in milliseconds
                }, options),

                onComplete = function(){
                    //OT.log("logged: " + "{action: " + data["action"] + ", variation: " + data["variation"] + ", payload_type: " + data["payload_type"] + ", payload: " + data["payload"] + "}");
                };

            // We camel-case our names, but the ClientEvents backend wants them
            // underscored...
            for (var key in camelCasedKeys) {
                if (camelCasedKeys.hasOwnProperty(key) && data[key]) {
                    data[camelCasedKeys[key]] = data[key];
                    delete data[key];
                }
            }

            post(data, onComplete, true);
        };

        // Converts +payload+ to two pipe seperated strings. Doesn't currently handle
        // edgecases, e.g. escaping "\\|" will break stuff.
        //
        // *Note:* It strip any keys that have null values.
        this.escapePayload = function(payload) {
            var escapedPayload = [],
                escapedPayloadDesc = [];

            for (var key in payload) {
                if (payload.hasOwnProperty(key) && payload[key] !== null && payload[key] !== undefined) {
                    escapedPayload.push( payload[key] ? payload[key].toString().replace('|', '\\|') : '' );
                    escapedPayloadDesc.push( key.toString().replace('|', '\\|') );
                }
            }

            return [
                escapedPayloadDesc.join('|'),
                escapedPayload.join('|')
            ];
        };
        // Uses HTML5 local storage to save a client ID.
        this.getClientGuid = function() {
            var  guid = OT.$.getCookie("opentok_client_id");
            if (!guid) {
                guid = OT.$.uuid();
                OT.$.setCookie("opentok_client_id", guid);
            }
            return guid;
        };
}

})(window);
(function(window) {

// This is not obvious, so to prevent end-user frustration we'll let them know
// explicitly rather than failing with a bunch of permission errors. We don't
// handle this using an OT Exception as it's really only a development thing.
if (location.protocol === 'file:') {
  alert("You cannot test a page using WebRTC through the file system due to browser permissions. You must run it over a web server.");
}

if (!window.OT) window.OT = {};

if (!window.URL && window.webkitURL) {
    window.URL = window.webkitURL;
}

var _publisherCount = 0,

    // Global parameters used by upgradeSystemRequirements
    _intervalId,
    _lastHash = document.location.hash,

    // Cached DeviceManager
    _deviceManager;


/**
* The first step in using the OpenTok API is to call the <code>TB.initSession()</code> method. Other methods of the TB object
* check for system requirements and set up error logging.
*
* @class TB
*/

/**
* <p class="mSummary">
* Initializes and returns the local session object for a specified session ID.
* </p>
* <p>
* You connect to an OpenTok session using the <code>connect()</code> method
* of the Session object returned by the <code>TB.initSession()</code> method.
* Note that calling <code>TB.initSession()</code> does not initiate communications
* with the cloud. It simply initializes the Session object that you can use to
* connect (and to perform other operations once connected).
* </p>
*
*  <p>
*    For an example, see <a href="Session.html#connect">Session.connect()</a>.
*  </p>
*
* @method TB.initSession
* @memberof TB
* @param {String} sessionId The session ID identifying the OpenTok session. For more information, see
* <a href="/opentok/tutorials/create-session/">Session creation</a>.
* @returns {Session} The session object through which all further interactions with the session will occur.
*/
OT.initSession = function(sessionId) {
    var session = OT.sessions.get(sessionId);

    if (!session) {
        session = new OT.Session(sessionId);
        OT.sessions.add(session);
    }

    return session;
};

/**
* <p class="mSummary">
*   Initializes and returns a Publisher object. You can then pass this Publisher
*   object to <code>Session.publish()</code> to publish a stream to a session.
* </p>
* <p>
*   <i>Note:</i> If you intend to reuse a Publisher object created using <code>TB.initPublisher()</code>
*   to publish to different sessions sequentially, call either <code>Session.disconnect()</code> or
*   <code>Session.unpublish()</code>. Do not call both. Then call the <code>preventDefault()</code> method
*   of the <code>streamDestroyed</code> or <code>sessionDisconnected</code> event object to prevent the
*   Publisher object from being removed from the page.
* </p>
* @param {String} apiKey The API key that TokBox provided you when you
* <a href="https://dashboard.tokbox.com/users/sign_in">signed up</a> for an OpenTok account.
* @param {String} targetElement The
* <code>id</code> attribute of the existing DOM element that the Publisher video replaces.
* If you do not specify a <code>targetElement</code>, the application
* appends a new DOM element to the HTML <code>body</code>.
*
* <p>
*       The application throws an error if an element with an ID set to the <code>targetElement</code>
*       value does not exist in the HTML DOM.
* </p>
*
* @param {Object} properties This is
* an <em>optional</em> object that contains the following properties (each of which are optional):
* </p>
* <ul>
* <li>
*   <strong>height</strong> (Number) &#151; The desired height, in pixels, of the
*   displayed Publisher video stream (default: 198). <i>Note:</i> Use the
*   <code>height</code> and <code>width</code> properties to set the dimensions
*   of the publisher video; do not set the height and width of the DOM element
*   (using CSS).
* </li>
* <li>
*   <strong>mirror</strong> (Boolean) &#151; Whether the publisher's video image
*   is mirrored in the publisher's page<. The default value is <code>true</code>
*   (the video image is mirrored). This property does not affect the display
*   on other subscribers' web pages.
* </li>
* <li>
*   <strong>name</strong> (String) &#151; The name for this stream. The name appears at the bottom of
*   Subscriber videos. The default value is "" (an empty string). Setting this to a string longer than
*   1000 characters results in an runtime exception.
* </li>
* <li>
*   <strong>publishAudio</strong> (Boolean) &#151; Whether to initially publish audio
*   for the stream (default: <code>true</code>). This setting applies when you pass
*   the Publisher object in a call to the <code>Session.publish()</code> method.
* </li>
* <li>
*   <strong>publishVideo</strong> (Boolean) &#151; Whether to initially publish video
*   for the stream (default: <code>true</code>). This setting applies when you pass
*   the Publisher object in a call to the <code>Session.publish()</code> method.
* </li>
* <li>
*   <strong>style</strong> (Object) &#151; An object containing properties that define the initial
*   appearance of user interface controls of the Publisher. Currently, the <code>style</code> object
*   includes one property: <code>nameDisplayMode</code>. Possible values for the <code>style.nameDisplayMode</code>
*   property are: <code>"auto"</code> (the name is displayed when the stream is first displayed
*   and when the user mouses over the display), <code>"off"</code> (the name is not displayed),
*   and <code>"on"</code> (the name is displayed).</li>
* </li>
* <li>
*   <strong>width</strong> (Number) &#151; The desired width, in pixels, of the
*   displayed Publisher video stream (default: 264). <i>Note:</i> Use the
*   <code>height</code> and <code>width</code> properties to set the dimensions
*   of the publisher video; do not set the height and width of the DOM element
*   (using CSS).
* </li>
* </ul>
*
* @returns {Publisher} The Publisher object.
* @see Session#publish
* @method TB.initPublisher
* @memberof TB
*/
OT.initPublisher = function(apiKey, targetElement, properties, completionHandler) {
    OT.debug("TB.initPublisher("+targetElement+")");

    var publisher = new OT.Publisher();;
    OT.publishers.add(publisher);

    if (completionHandler && OT.$.isFunction(completionHandler)) {
        var removeHandlersAndCallComplete = function removeHandlersAndCallComplete (error) {
            publisher.off('initSuccess', removeHandlersAndCallComplete);
            publisher.off('publishComplete', removeHandlersAndCallComplete);

            completionHandler.apply(null, arguments);
        };

        publisher.once('initSuccess', removeHandlersAndCallComplete);
        publisher.once('publishComplete', removeHandlersAndCallComplete);
    }

    publisher.publish(targetElement, properties);

    return publisher;
};



/**
* Checks if the system supports OpenTok for WebRTC.
* @return {Number} Whether the system supports OpenTok for WebRTC (1) or not (0).
* @see <a href="#upgradeSystemRequirements">TB.upgradeSystemRequirements()</a>
* @method TB.checkSystemRequirements
* @memberof TB
*/
OT.checkSystemRequirements = function() {
    OT.debug("TB.checkSystemRequirements()");

    var systemRequirementsMet = OT.$.supportsWebSockets() && OT.$.supportsWebRTC() ? this.HAS_REQUIREMENTS : this.NOT_HAS_REQUIREMENTS;

    OT.checkSystemRequirements = function() {
      OT.debug("TB.checkSystemRequirements()");
      return systemRequirementsMet;
    };

    return systemRequirementsMet;
};


/**
* Displays information about system requirments for OpenTok for WebRTC. This information is displayed
* in an iframe element that fills the browser window.
* <p>
* <i>Note:</i> this information is displayed automatically when you call the <code>TB.initSession()</code>
* or the <code>TB.initPublisher()</code> method if the client does not support OpenTok for WebRTC.
* </p>
* @see <a href="#checkSystemRequirements">TB.checkSystemRequirements()</a>
* @method TB.upgradeSystemRequirements
* @memberof TB
*/
OT.upgradeSystemRequirements = function(){
    // trigger after the TB environment has loaded
    OT.onLoad( function() {
        var id = '_upgradeFlash';

         // Load the iframe over the whole page.
         document.body.appendChild((function(){
             var d = document.createElement('iframe');
             d.id = id;
             d.style.position = 'absolute';
             d.style.position = 'fixed';
             d.style.height = '100%';
             d.style.width = '100%';
             d.style.top = '0px';
             d.style.left = '0px';
             d.style.right = '0px';
             d.style.bottom = '0px';
             d.style.zIndex = 1000;
             try {
                 d.style.backgroundColor = "rgba(0,0,0,0.2)";
             } catch (err) {
                 // Old IE browsers don't support rgba and we still want to show the upgrade message
                 // but we just make the background of the iframe completely transparent.
                 d.style.backgroundColor = "transparent";
                 d.setAttribute("allowTransparency", "true");
             }
             d.setAttribute("frameBorder", "0");
             d.frameBorder = "0";
             d.scrolling = "no";
             d.setAttribute("scrolling", "no");
             d.src = OT.properties.assetURL + "/html/upgradeFlash.html#"+encodeURIComponent(document.location.href);
             return d;
         })());

         // Now we need to listen to the event handler if the user closes this dialog.
         // Since this is from an IFRAME within another domain we are going to listen to hash changes.
         // The best cross browser solution is to poll for a change in the hashtag.
         if (_intervalId) clearInterval(_intervalId);
         _intervalId = setInterval(function(){
             var hash = document.location.hash,
                 re = /^#?\d+&/;
             if (hash !== _lastHash && re.test(hash)) {
                 _lastHash = hash;
                 if( hash.replace(re, '') === 'close_window'){
                     document.body.removeChild(document.getElementById(id));
                     document.location.hash = '';
                 }
             }
         }, 100);
    });
};


OT.reportIssue = function(){
    OT.warn("ToDo: haven't yet implemented TB.reportIssue");
};

OT.components = {};
OT.sessions = {};

// namespaces
OT.rtc = {};

// Define the APIKEY this is a global parameter which should not change
OT.APIKEY = (function(){
    // Script embed
    var script_src = (function(){
        var s = document.getElementsByTagName('script');
        s = s[s.length - 1];
        s = s.getAttribute('src') || s.src;
        return s;
    })();

    var m = script_src.match(/[\?\&]apikey=([^&]+)/i);
    return m ? m[1] : '';
})();

OT.HAS_REQUIREMENTS = 1;
OT.NOT_HAS_REQUIREMENTS = 0;

/**
* Registers a method as an event listener for a specific event. Note that this is a static method of the TB class.
*
* <p>
* The TB object dispatches one type of event &#151; an <code>exception</code> event. The following code adds an event
* listener for the <code>exception</code> event:
* </p>
*
* <pre>
* TB.addEventListener("exception", exceptionHandler);
*
* function exceptionHandler(event) {
*    alert("exception event. \n  code == " + event.code + "\n  message == " + event.message);
* }
* </pre>
*
* <p>
* 	If a handler is not registered for an event, the event is ignored locally. If the event listener function does not exist,
* 	the event is ignored locally.
* </p>
* <p>
* 	Throws an exception if the <code>listener</code> name is invalid.
* </p>
*
* @param {String} type The string identifying the type of event.
*
* @param {Function} listener The function to be invoked when the TB object dispatches the event.
* @memberOf TB
* @method addEventListener
*/

/**
* Removes an event listener for a specific event. Note that this is a static method of the TB class.
*
* <p>
* 	Throws an exception if the <code>listener</code> name is invalid.
* </p>
*
* @param {String} type The string identifying the type of event.
*
* @param {Function} listener The event listener function to remove.
*
* @memberOf TB
* @method removeEventListener
*/

/**
 * Dispatched by the TB class when the app encounters an exception.
 * Note that you set up an event handler for the <code>exception</code> event by calling the
 * <code>TB.addEventListener()</code> method, which is a <i>static</i> method.
 *
 * @name exception
 * @event
 * @borrows ExceptionEvent#message as this.message
 * @memberof TB
 * @see ExceptionEvent
 */

if (!window.OT) window.OT = OT;
if (!window.TB) window.TB = OT;

})(window);
(function(global) {

OT.Collection = function(idField) {
  var _models = [],
      _byId = {},
      _idField = idField || 'id';

  OT.$.eventing(this, true);

  var onModelUpdate = function onModelUpdate (event) {
        this.trigger('update', event);
        this.trigger('update:'+event.target.id, event);
      }.bind(this),

      onModelIdUpdate = function onModelIdUpdate (oldId, newId) {
        if (_byId[oldId] === void 0) return;

        // Match their old index to their new id and remove any
        // reference to the old one.
        var index = _byId[oldId];
        delete _byId[oldId];
        _byId[newId] = index;
      }.bind(this),

      onModelDestroy = function onModelDestroyed (event) {
        this.remove(event.target, event.reason);
      }.bind(this);


  this.reset = function() {
    // Stop listening on the models, they are no longer our problem
    _models.forEach(function(model) {
      model.off('updated', onModelUpdate, this);
      model.off('destroyed', onModelDestroy, this)
      model.off('idUpdated', onModelIdUpdate, this);
    }, this);

    _models = [];
    _byId = {};
  };

  this.destroy = function() {
    _models.forEach(function(model) {
      model.destroy(void 0, true);
    });

    this.reset();
    this.off();
  };

  this.get = function(id) { return id && _byId[id] !== void 0 ? _models[_byId[id]] : void 0; };
  this.has = function(id) { return id && _byId[id] !== void 0; };

  this.toString = function() { return _models.toString(); };

  // Return only models filtered by either a dict of properties
  // or a filter function.
  //
  // @example Return all publishers with a streamId of 1
  //   OT.publishers.where({streamId: 1})
  //
  // @example The same thing but filtering using a filter function
  //   OT.publishers.where(function(publisher) {
  //     return publisher.stream.id === 4;
  //   });
  //
  // @example The same thing but filtering using a filter function
  //          executed with a specific this
  //   OT.publishers.where(function(publisher) {
  //     return publisher.stream.id === 4;
  //   }, self);
  //
  this.where = function(attrsOrFilterFn, context) {
    if (OT.$.isFunction(attrsOrFilterFn)) return _models.filter(attrsOrFilterFn, context);

    return _models.filter(function(model) {
      for (var key in attrsOrFilterFn) {
        if (model[key] !== attrsOrFilterFn[key]) return false;
      }

      return true;
    });
  };

  // Similar to where in behaviour, except that it only returns
  // the first match.
  this.find = function(attrsOrFilterFn, context) {
    var filterFn;

    if (OT.$.isFunction(attrsOrFilterFn)) {
      filterFn = attrsOrFilterFn;
    }
    else {
      filterFn = function(model) {
        for (var key in attrsOrFilterFn) {
          if (model[key] !== attrsOrFilterFn[key]) return false;
        }

        return true;
      };
    }

    filterFn = filterFn.bind(context);

    for (var i=0; i<_models.length; ++i) {
      if (filterFn(_models[i]) === true) return _models[i];
    }

    return null;
  };

  this.add = function(model) {
    var id = model[_idField];

    if (this.has(id)) {
      OT.warn("Model " + id + ' is already in the collection', _models);
      return this;
    }

    _byId[id] = _models.push(model) - 1;

    model.on('updated', onModelUpdate, this);
    model.on('destroyed', onModelDestroy, this)
    model.on('idUpdated', onModelIdUpdate, this);

    this.trigger('add', model);
    this.trigger('add:'+id, model);

    return this;
  };

  this.remove = function(model, reason) {
    var id = model[_idField];

    _models.splice(_byId[id], 1);

    // Shuffle everyone down one
    for (var i=_byId[id]; i<_models.length; ++i) {
      _byId[_models[i][_idField]] = i
    }

    delete _byId[id];

    model.off('updated', onModelUpdate, this);
    model.off('destroyed', onModelDestroy, this)
    model.off('idUpdated', onModelIdUpdate, this);

    this.trigger('remove', model, reason);
    this.trigger('remove:'+id, model, reason);

    return this;
  };

  OT.$.defineGetters(this, {
    length: function() { return _models.length; }
  });
};

}(this));
(function(window) {

/**
 * The Event object defines the basic OpenTok event object that is passed to
 * event listeners. Other OpenTok event classes implement the properties and methods of
 * the Event object.</p>
 *
 * <p>For example, the Stream object dispatches a <code>streamPropertyChanged</code> event when
 * the stream's properties are updated. You register an event listener using the <code>addEventListener()</code>
 * method of the Stream object:</p>
 *
 * <pre>
 * stream.addEventListener("streamPropertyChanged", streamPropertyChangedHandler);
 *
 * function streamPropertyChangedHandler(event) {
 *     alert("Properties changed for stream " + event.target.streamId);
 * }</pre>
 *
 * @class Event
 * @property {Boolean} cancelable Whether the event has a default behavior that is cancelable (<code>true</code>)
 * or not (<code>false</code>). You can cancel the default behavior by calling the <code>preventDefault()</code> method
 * of the Event object in the event listener function. (See <a href="#preventDefault">preventDefault()</a>.)
 *
 * @property {Object} target The object that dispatched the event.
 *
 * @property {String} type  The type of event.
 */
OT.Event = OT.$.eventing.Event();
/**
* Prevents the default behavior associated with the event from taking place.
*
* <p>To see whether an event has a default behavior, check the <code>cancelable</code> property of the event object. </p>
*
* <p>Call the <code>preventDefault()</code> method in the event listener function for the event.</p>
*
* <p>The following events have default behaviors:</p>
*
* <ul>
*
*   <li><code>sessionDisconnect</code> &#151; See <a href="SessionDisconnectEvent.html#preventDefault">
*   SessionDisconnectEvent.preventDefault()</a>.</li>
*
*   <li><code>streamDestroyed</code> &#151; See <a href="StreamEvent.html#preventDefault">
*   StreamEvent.preventDefault()</a>.</li>
*
* </ul>
*
* @method #preventDefault
* @memberof Event
*/
/**
* Whether the default event behavior has been prevented via a call to <code>preventDefault()</code> (<code>true</code>)
* or not (<code>false</code>). See <a href="#preventDefault">preventDefault()</a>.
* @method #isDefaultPrevented
* @return {Boolean}
* @memberof Event
*/

// Event names lookup
OT.Event.names = {
    // Activity Status for cams/mics
    ACTIVE: "active",
    INACTIVE: "inactive",
    UNKNOWN: "unknown",

    // Archive types
    PER_SESSION: "perSession",
    PER_STREAM: "perStream",

    // TB Events
    EXCEPTION: "exception",
    ISSUE_REPORTED: "issueReported",

    // Session Events
    SESSION_CONNECTED: "sessionConnected",
    SESSION_DISCONNECTED: "sessionDisconnected",
    STREAM_CREATED: "streamCreated",
    STREAM_DESTROYED: "streamDestroyed",
    CONNECTION_CREATED: "connectionCreated",
    CONNECTION_DESTROYED: "connectionDestroyed",
    SIGNAL: "signal",
    STREAM_PROPERTY_CHANGED: "streamPropertyChanged",
    MICROPHONE_LEVEL_CHANGED: "microphoneLevelChanged",


    // Publisher Events
    RESIZE: "resize",
    SETTINGS_BUTTON_CLICK: "settingsButtonClick",
    DEVICE_INACTIVE: "deviceInactive",
    INVALID_DEVICE_NAME: "invalidDeviceName",
    ACCESS_ALLOWED: "accessAllowed",
    ACCESS_DENIED: "accessDenied",
    ACCESS_DIALOG_OPENED: 'accessDialogOpened',
    ACCESS_DIALOG_CLOSED: 'accessDialogClosed',
    ECHO_CANCELLATION_MODE_CHANGED: "echoCancellationModeChanged",
    PUBLISHER_DESTROYED: 'destroyed',

    // Subscriber Events
    SUBSCRIBER_DESTROYED: 'destroyed',

    // DeviceManager Events
    DEVICES_DETECTED: "devicesDetected",

    // DevicePanel Events
    DEVICES_SELECTED: "devicesSelected",
    CLOSE_BUTTON_CLICK: "closeButtonClick",

    MICLEVEL : 'microphoneActivityLevel',
    MICGAINCHANGED : 'microphoneGainChanged',

    // Environment Loader
    ENV_LOADED: 'envLoaded'
};

OT.ValueEvent = function (type,value){
    OT.Event.call(this, type);
    this.value = value;

};

OT.ExceptionCodes = {
  JS_EXCEPTION: 2000,
  AUTHENTICATION_ERROR: 1004,
  INVALID_SESSION_ID: 1005,
  CONNECT_FAILED: 1006,
  CONNECT_REJECTED: 1007,
  CONNECTION_TIMEOUT: 1008,
  NOT_CONNECTED: 1010,
  P2P_CONNECTION_FAILED: 1013,
  API_RESPONSE_FAILURE: 1014,
  UNABLE_TO_PUBLISH: 1500,
  UNABLE_TO_SIGNAL: 1510,
  UNABLE_TO_FORCE_DISCONNECT: 1520,
  UNABLE_TO_FORCE_UNPUBLISH: 1530
};

/**
* The {@link TB} class dispatches <code>exception</code> events when the OpenTok API encounters
* an exception (error). The ExceptionEvent object defines the properties of the event
* object that is dispatched.
*
* <p>Note that you set up an event handler for the <code>exception</code> event by calling the
* <code>TB.addEventListener()</code> method, which is a <i>static</i> method.</p>
*
* @class ExceptionEvent
* @property {Number} code The error code. The following is a list of error codes:</p>
*
* <table class="docs_table">
*  <tbody><tr>
*   <td>
*   <b>code</b>
*
*   </td>
*   <td>
*   <b>title</b>
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1000
*
*   </td>
*   <td>
*   Failed To Load
*   </td>
*  </tr>
*
*  <tr>
*   <td>
*   1004
*
*   </td>
*   <td>
*   Authentication error
*   </td>
*  </tr>
*
*  <tr>
*   <td>
*   1005
*
*   </td>
*   <td>
*   Invalid Session ID
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1006
*
*   </td>
*   <td>
*   Connect Failed
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1007
*
*   </td>
*   <td>
*   Connect Rejected
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1008
*
*   </td>
*   <td>
*   Connect Time-out
*   </td>
*  </tr>
*  <tr>
*   <td>
*   1009
*
*   </td>
*   <td>
*   Security Error
*   </td>
*  </tr>
*   <tr>
*    <td>
*    1010
*
*    </td>
*    <td>
*    Not Connected
*    </td>
*   </tr>
*   <tr>
*    <td>
*    1011
*
*    </td>
*    <td>
*    Invalid Parameter
*    </td>
*   </tr>
*   <tr>
*    <td>
*    1013
*    </td>
*    <td>
*    Connection Failed
*    </td>
*   </tr>
*   <tr>
*    <td>
*    1014
*    </td>
*    <td>
*    API Response Failure
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1500
*    </td>
*    <td>
*    Unable to Publish
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1510
*    </td>
*    <td>
*    Unable to Signal
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1520
*    </td>
*    <td>
*    Unable to Force Disconnect
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    1530
*    </td>
*    <td>
*    Unable to Force Unpublish
*    </td>
*   </tr>
*  <tr>
*    <td>
*    1535
*    </td>
*    <td>
*    Force Unpublish on Invalid Stream
*    </td>
*   </tr>
*
*  <tr>
*    <td>
*    2000
*
*    </td>
*    <td>
*    Internal Error
*    </td>
*  </tr>
*
*  <tr>
*    <td>
*    2010
*
*    </td>
*    <td>
*    Report Issue Failure
*    </td>
*  </tr>
*
*
*  </tbody></table>
*
*  <p>Check the <code>message</code> property for more details about the error.</p>
*
* @property {String} message The error message.
* @property {String} title The error title.
* @augments Event
*/
OT.ExceptionEvent = function (type, message, title, code, component, target) {
    OT.Event.call(this, type);

    this.message = message;
    this.title = title;
    this.code = code;
    this.component = component;
    this.target = target;
};


OT.IssueReportedEvent = function (type, issueId) {
    OT.Event.call(this, type);

    this.issueId = issueId;
};

// Triggered when the JS dynamic config and the DOM have loaded.
OT.EnvLoadedEvent = function (type) {
    OT.Event.call(this, type);
};


/**
 * The Session object dispatches a ConnectionEvent object when a connection is created or destroyed.
 *
 * <h5><a href="example"></a>Example</h5>
 *
 * <p>The following code keeps a running total of the number of connections to a session
 * by monitoring the <code>connections</code> property of the <code>sessionConnect</code>,
 * <code>connectionCreated</code> and <code>connectionDestroyed</code> events:</p>
 *
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 * var sessionID = ""; // Replace with your own session ID.
 *                     // See https://dashboard.tokbox.com/projects
 * var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                 // See https://dashboard.tokbox.com/projects
 * var connectionCount = 0;
 *
 * var session = TB.initSession(sessionID);
 * session.addEventListener("sessionConnected", sessionConnectedHandler);
 * session.addEventListener("connectionCreated", connectionCreatedHandler);
 * session.addEventListener("connectionDestroyed", connectionDestroyedHandler);
 * session.connect(apiKey, token);
 *
 * function sessionConnectedHandler(event) {
 *    connectionCount = event.connections.length;
 *    displayConnectionCount();
 * }
 *
 * function connectionCreatedHandler(event) {
 *    connectionCount += event.connections.length;
 *    displayConnectionCount();
 * }
 *
 * function connectionDestroyedHandler(event) {
 *    connectionCount -= event.connections.length;
 *    displayConnectionCount();
 * }
 *
 * function displayConnectionCount() {
 *     document.getElementById("connectionCountField").value = connectionCount.toString();
 * }</pre>
 *
 * <p>This example assumes that there is an input text field in the HTML DOM
 * with the <code>id</code> set to <code>"connectionCountField"</code>:</p>
 *
 * <pre>&lt;input type="text" id="connectionCountField" value="0"&gt;&lt;/input&gt;</pre>
 *
 *
 * @property {Array} connections An array of Connection objects for the connections that were created or deleted.
 * You can compare the <code>connectionId</code> property to that of the <code>connection</code> property of the
 * Session object to see if a connection refers to the local web page.
 *
 * @property {String} reason For a <code>connectionDestroyed</code> event,
 *  a description of why the connection ended. This property can have two values:
 * </p>
 * <ul>
 *  <li><code>"clientDisconnected"</code> &#151; A client disconnected from the session by calling
 *     the <code>disconnect()</code> method of the Session object or by closing the browser.
 *     (See <a href="Session.html#disconnect">Session.disconnect()</a>.)</li>
 *
 *  <li><code>"forceDisconnected"</code> &#151; A moderator has disconnected the publisher from the session,
 *      by calling the <code>forceDisconnect()</code> method of the Session object.
 *      (See <a href="Session.html#forceDisconnect">Session.forceDisconnect()</a>.)</li>
 *
 *  <li><code>"networkDisconnected"</code> &#151; The network connection terminated abruptly (for example,
 *      the client lost their internet connection).</li>
 * </ul>
 *
 * <p>Depending on the context, this description may allow the developer to refine
 * the course of action they take in response to an event.</p>
 *
 * <p>For a <code>connectionCreated</code> event, this string is undefined.</p>
 *
 * @class ConnectionEvent
 * @augments Event
 */
OT.ConnectionEvent = function (type, connections, reason) {
    OT.Event.call(this, type);

    this.connections = connections;
    this.reason = reason;
};

/**
 * StreamEvent is an event that can have type "streamCreated" or "streamDestroyed". These events are dispatched when a client
 * starts or stops publishing to a {@link Session}. This includes remote clients publishing on the session as well as the local
 * client publishing to the session.
 *
 * <h4><a href="example_streamCreated"></a>Example &#151; streamCreated event</h4>
 *  <p>The following code initializes a session and sets up an event listener for when
 *    a stream is created:</p>
 *
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 * var sessionID = ""; // Replace with your own session ID.
 *                     // See https://dashboard.tokbox.com/projects
 * var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                 // See https://dashboard.tokbox.com/projects
 *
 * var session = TB.initSession(sessionID);
 * session.addEventListener("streamCreated", streamCreatedHandler);
 * session.connect(apiKey, token);
 *
 * function streamCreatedHandler(event) {
 *     for (var i = 0; i &lt; event.streams.length; i++) {
 *         // Only display others' streams, not those that the client publishes.
 *         if (event.streams[i].connection.connectionId != event.target.connection.connectionId) {
 *                displayStream(stream);
 *         }
 *     }
 * }
 *
 * function displayStream(stream) {
 *     var div = document.createElement('div');
 *     div.setAttribute('id', 'stream' + stream.streamId);
 *
 *     var streamsContainer = document.getElementById('streamsContainer');
 *     streamsContainer.appendChild(div);
 *
 *     subscriber = session.subscribe(stream, 'stream' + stream.streamId);
 * }</pre>
 *
 *  <p>For this example, in addition to the event handler for the <code>streamCreated</code>
 *  event, you would probably want to create an event handler for the <code>sessionConnected</code>
 *  event. This event handler can display the streams that are present when the session first
 *  connects. See {@link SessionConnectEvent}.</p>
 *
 *  <h4><a href="example_streamDestroyed"></a>Example &#151; streamDestroyed event</h4>
 *
 *    <p>The following code initializes a session and sets up an event listener for when a
 *       stream ends:</p>
 *
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 * var sessionID = ""; // Replace with your own session ID.
 *                     // See https://dashboard.tokbox.com/projects
 * var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                 // See https://dashboard.tokbox.com/projects
 *
 * var session = TB.initSession(sessionID);
 * session.addEventListener("streamDestroyed", streamDestroyedHandler);
 * session.connect(apiKey, token);
 *
 * function streamDestroyedHandler(event) {
 *     for (var i = 0; i &lt; event.streams.length; i++) {
 *         var stream = event.streams[i];
 *         alert("Stream " + stream.name + " ended. " + event.reason);
 *     }
 * }</pre>
 *
 * @class StreamEvent
 * @property {Array} streams An array of Stream objects
 * corresponding to the streams to which this event refers. This is usually an array containing only
 * one Stream object, corresponding to the stream that was added (in the case of a <code>streamCreated</code>
 * event) or deleted (in the case of a <code>streamDestroyed</code> event). However, the array may contain
 * multiple Stream objects if multiple streams were added or deleted. A stream may be published by the local client
 * or another client connected to the session.
 *
 * @property {String} reason For a <code>streamDestroyed</code> event,
 *  a description of why the session disconnected. This property can have one of the following values:
 * </p>
 * <ul>
 *  <li><code>"clientDisconnected"</code> &#151; A client disconnected from the session by calling
 *     the <code>disconnect()</code> method of the Session object or by closing the browser.
 *     (See <a href="Session.html#disconnect">Session.disconnect()</a>.)</li>
 *
 *  <li><code>"forceDisconnected"</code> &#151; A moderator has disconnected the publisher of the
 *   	stream from the session, by calling the <code>forceDisconnect()</code> method of the Session object.
 *      (See <a href="Session.html#forceDisconnect">Session.forceDisconnect()</a>.)</li>
 *
 *  <li><code>"forceUnpublished"</code> &#151; A moderator has forced the publisher of the stream to stop
 *   	publishing the stream, by calling the <code>forceUnpublish()</code> method of the Session object.
 *      (See <a href="Session.html#forceUnpublish">Session.forceUnpublish()</a>.)</li>
 *
 *  <li><code>"networkDisconnected"</code> &#151; The network connection terminated abruptly (for example,
 *      the client lost their internet connection).</li>
 *
 * </ul>
 *
 * <p>Depending on the context, this description may allow the developer to refine
 * the course of action they take in response to an event.</p>
 *
 * <p>For a <code>streamCreated</code> event, this string is undefined.</p>
 *
 *
 * @property {Boolean} cancelable 	Whether the event has a default behavior that is cancelable (<code>true</code>) or not (<code>false</code>).
 *  You can cancel the default behavior by calling the <code>preventDefault()</code> method of
 *  the StreamEvent object in the event listener function. The <code>streamDestroyed</code>
 *  event is cancelable. (See <a href="#preventDefault">preventDefault()</a>.)
 * @augments Event
 */
OT.StreamEvent = function (type, streams, reason, cancelable) {
    OT.Event.call(this, type, cancelable);

    this.streams = streams;
    this.reason = reason;
};

/**
* Prevents the default behavior associated with the event from taking place.
*
* <p>For the <code>streamDestroyed</code> event, if the <code>reason</code> is set to <code>"forceDisconnected"</code>
* or <code>networkDisconnected</code>, the default behavior is that all Subscriber objects that are
* subscribed to the stream are unsubscribed (and removed from the HTML DOM). If you call the <code>preventDefault()</code>
* method in the event listener for the <code>streamDestroyed</code> event, the default behavior is prevented and
* you can, optionally, clean up Subscriber objects using your own code. See
* <a href="Session.html#getSubscribersForStream">Session.getSubscribersForStream()</a>.</p>
*
* <p>If the <code>reason</code> property is set to <code>"forceUnpublished"</code>, the default behavior
* is that the associated Subscriber or Publisher objects corresponding with the stream are unsubscribed
* or unpublished (and removed from the HTML DOM). If you call the <code>preventDefault()</code> method in the
* event listener for the <code>streamDestroyed</code> event, the default behavior is prevented and
* you can, optionally, clean up Subscriber or Publisher objects using your own code. See
* <a href="Session.html#getPublisherForStream">Session.getPublisherForStream()</a> and
* <a href="Session.html#getSubscribersForStream">Session.getSubscribersForStream()</a>.</p>
*
* <p>To see whether an event has a default behavior, check the <code>cancelable</code> property of the event object. </p>
*
* <p>Call the <code>preventDefault()</code> method in the event listener function for the event.</p>
*
* @method #preventDefault
* @memberof StreamEvent
*/


/**
 * The Session object dispatches SessionConnectEvent object when a session has successfully connected in response to a call to
 * the <code>connect()</code> method of the Session object.
 *
 *  <p>
 *  For an example, see <a href="Session.html#connect">Session.connect()</a>.
 *  </p>
 *
 * @class SessionConnectEvent
 * @property {Array} connections An array of Connection objects, representing connections to the session.
 * (Note that each connection can publish multiple streams.)
 * @property {Array} streams An array of Stream objects corresponding to the streams currently available in the session that has connected.
 * @augments Event
 */
OT.SessionConnectEvent = function (type, connections, streams, archives) {
    OT.Event.call(this, type);

    this.connections = connections;
    this.streams = streams;
    this.archives = archives;
    this.groups = []; // Deprecated in OpenTok v0.91.48
};

/**
 * The Session object dispatches SessionDisconnectEvent object when a session has disconnected. This event may be dispatched asynchronously in
 * response to a successful call to the <code>disconnect()</code> method of the session object.
 *
 *  <h4>
 *  	<a href="example"></a>Example
 *  </h4>
 *  <p>
 *  	The following code initializes a session and sets up an event listener for when a session is disconnected.
 *  </p>
 * <pre>var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 *  var sessionID = ""; // Replace with your own session ID.
 *                      // See https://dashboard.tokbox.com/projects
 *  var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                  // See https://dashboard.tokbox.com/projects
 *
 *  var session = TB.initSession(sessionID);
 *  session.addEventListener("sessionDisconnected", sessionDisconnectedHandler);
 *  session.connect(apiKey, token);
 *
 *  function sessionDisConnectedHandler(event) {
 *      alert("The session disconnected. " + event.reason);
 *  }
 *  </pre>
 *
 * @property {String} reason A description of why the session disconnected.
 *   This property can have two values:
 *  </p>
 *  <ul>
 *  	<li><code>"clientDisconnected"</code> &#151; A client disconnected from the session by calling
 *  	 the <code>disconnect()</code> method of the Session object or by closing the browser.
 *      ( See <a href="Session.html#disconnect">Session.disconnect()</a>.)</li>
 *  	<li><code>"forceDisconnected"</code> &#151; A moderator has disconnected you from the session
 *   	 by calling the <code>forceDisconnect()</code> method of the Session object. (See
 *       <a href="Session.html#forceDisconnect">Session.forceDisconnect()</a>.)</li>
 *  	<li><code>"networkDisconnected"</code> &#151; The network connection terminated abruptly (for example,
 *       the client lost their internet connection).</li>
 *  </ul>
 *
 * @class SessionDisconnectEvent
 * @augments Event
 */
OT.SessionDisconnectEvent = function (type, reason, cancelable) {
    OT.Event.call(this, type, cancelable);

    this.reason = reason;
};

/**
* Prevents the default behavior associated with the event from taking place.
*
* <p>For the <code>sessionDisconnectEvent</code>, the default behavior is: all Subscriber objects are unsubscribed,
* and Publisher objects are destroyed. If you call the <code>preventDefault()</code> method in the
* event listener for the <code>sessionDisconnect</code> event, the default behavior is prevented (and
* you can, optionally, clean up Subscriber and Publisher objects using your own code).
*
* <p>To see whether an event has a default behavior, check the <code>cancelable</code> property of the event object. </p>
*
* <p>Call the <code>preventDefault()</code> method in the event listener function for the event.</p>
*
* @method #preventDefault
* @memberof SessionDisconnectEvent
*/

OT.VolumeEvent = function (type, streamId, volume) {
    OT.Event.call(this, type);

    this.streamId = streamId;
    this.volume = volume;
};


OT.DeviceEvent = function (type, camera, microphone) {
    OT.Event.call(this, type);

    this.camera = camera;
    this.microphone = microphone;
};

OT.DeviceStatusEvent = function (type, cameras, microphones, selectedCamera, selectedMicrophone) {
    OT.Event.call(this, type);

    this.cameras = cameras;
    this.microphones = microphones;
    this.selectedCamera = selectedCamera;
    this.selectedMicrophone = selectedMicrophone;
};

OT.ResizeEvent = function (type, widthFrom, widthTo, heightFrom, heightTo) {
    OT.Event.call(this, type);

    this.widthFrom = widthFrom;
    this.widthTo = widthTo;
    this.heightFrom = heightFrom;
    this.heightTo = heightTo;
};

/**
 * The Session object dispatches a <code>streamPropertyChanged</code> event in the following circumstances:
 *
 * <ul>
 *
 * 	<li>When a publisher starts or stops publishing audio or video. This change causes the <code>hasAudio</code>
 * 	or <code>hasVideo</code> property of the Stream object to change. This change results from a call to the
 * 	<code>publishAudio()</code> or <code>publishVideo()</code> methods of the Publish object.</li>
 *
 * 	<li>When the <code>videoDimensions</code> property of a stream changes. For more information,
 * 	see <a href="Stream.html#properties">Stream.videoDimensions</a>.</li>
 *
 * </ul>
 *
 * @class StreamPropertyChangedEvent
 * @property {String} changedProperty The property of the stream that changed. This value is either <code>"hasAudio"</code>,
 * <code>"hasVideo"</code>, or <code>"videoDimensions"</code>.
 * @property {Stream} stream The Stream object for which a property has changed.
 * @property {Object} newValue The new value of the property (after the change).
 * @property {Object} oldValue The old value of the property (before the change).
 *
 * @see <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a></p>
 * @see <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a></p>
 * @see <a href="Stream.html#properties">Stream.videoDimensions</a></p>
 * @augments Event
 */
OT.StreamPropertyChangedEvent = function (type, stream, changedProperty, oldValue, newValue) {
    OT.Event.call(this, type);

    this.type = type;
    this.stream = stream;
    this.changedProperty = changedProperty;
    this.oldValue = oldValue;
    this.newValue = newValue;
};

OT.ArchiveEvent = function (type, archives) {
    OT.Event.call(this, type);

    this.archives = archives;
};

OT.ArchiveStreamEvent = function (type, archive, streams) {
    OT.Event.call(this, type);

    this.archive = archive;
    this.streams = streams;
};

OT.StateChangedEvent = function (type, changedValues) {
    OT.Event.call(this, type);

    this.changedValues = changedValues;
};

OT.ChangeFailedEvent = function (type, reasonCode, reason, failedValues) {
    OT.Event.call(this, type);

    this.reasonCode = reasonCode;
    this.reason = reason;
    this.failedValues = failedValues;
};

/**
 * The Session object dispatches a signal event when the client receives a signal from the session.
 *
 * @class SignalEvent
 * @property {String} type The type assigned to the signal (if there is one). Use the type to filter signals
 * received (by adding an event handler for signal:type1 or signal:type2, etc.)
 * @property {Object} data The data payload sent with the signal (if there is one).
 * @property {Connection} from The Connection corresponding to the client that sent with the signal.
 *
 * @see <a href="Session.html#signal">Session.signal()</a></p>
 * @see <a href="Session.html#events">Session events (signal and signal:type)</a></p>
 * @augments Event
 */
OT.SignalEvent = function(type, data, from) {
    OT.Event.call(this, type ? "signal:" + type : OT.Event.names.SIGNAL, false);

    this.data = data;
    this.from = from;
};


OT.StreamUpdatedEvent = function (stream, key, oldValue, newValue) {
    OT.Event.call(this, 'updated');

    this.target = stream;
    this.changedProperty = key;
    this.oldValue = oldValue;
    this.newValue = newValue;
};

OT.DestroyedEvent = function(type, target, reason) {
    OT.Event.call(this, type, false);

    this.target = target;
    this.reason = reason;
};


})(window);
// https://code.google.com/p/stringencoding/
// An implementation of http://encoding.spec.whatwg.org/#api
//
(function(global) {
  'use strict';

  if ( (global.TextEncoder !== void 0) && (global.TextDecoder !== void 0))  {
    // defer to the native ones
    // @todo is this a good idea?
    return;
  }

  //
  // Utilities
  //

  /**
   * @param {number} a The number to test.
   * @param {number} min The minimum value in the range, inclusive.
   * @param {number} max The maximum value in the range, inclusive.
   * @return {boolean} True if a >= min and a <= max.
   */
  function inRange(a, min, max) {
    return min <= a && a <= max;
  }

  /**
   * @param {number} n The numerator.
   * @param {number} d The denominator.
   * @return {number} The result of the integer division of n by d.
   */
  function div(n, d) {
    return Math.floor(n / d);
  }


  //
  // Implementation of Encoding specification
  // http://dvcs.w3.org/hg/encoding/raw-file/tip/Overview.html
  //

  //
  // 3. Terminology
  //

  //
  // 4. Encodings
  //

  /** @const */ var EOF_byte = -1;
  /** @const */ var EOF_code_point = -1;

  /**
   * @constructor
   * @param {Uint8Array} bytes Array of bytes that provide the stream.
   */
  function ByteInputStream(bytes) {
    /** @type {number} */
    var pos = 0;

    /** @return {number} Get the next byte from the stream. */
    this.get = function() {
      return (pos >= bytes.length) ? EOF_byte : Number(bytes[pos]);
    };

    /** @param {number} n Number (positive or negative) by which to
     *      offset the byte pointer. */
    this.offset = function(n) {
      pos += n;
      if (pos < 0) {
        throw new Error('Seeking past start of the buffer');
      }
      if (pos > bytes.length) {
        throw new Error('Seeking past EOF');
      }
    };

    /**
     * @param {Array.<number>} test Array of bytes to compare against.
     * @return {boolean} True if the start of the stream matches the test
     *     bytes.
     */
    this.match = function(test) {
      if (test.length > pos + bytes.length) {
        return false;
      }
      var i;
      for (i = 0; i < test.length; i += 1) {
        if (Number(bytes[pos + i]) !== test[i]) {
          return false;
        }
      }
      return true;
    };
  }

  /**
   * @constructor
   * @param {Array.<number>} bytes The array to write bytes into.
   */
  function ByteOutputStream(bytes) {
    /** @type {number} */
    var pos = 0;

    /**
     * @param {...number} var_args The byte or bytes to emit into the stream.
     * @return {number} The last byte emitted.
     */
    this.emit = function(var_args) {
      /** @type {number} */
      var last = EOF_byte;
      var i;
      for (i = 0; i < arguments.length; ++i) {
        last = Number(arguments[i]);
        bytes[pos++] = last;
      }
      return last;
    };
  }

  /**
   * @constructor
   * @param {string} string The source of code units for the stream.
   */
  function CodePointInputStream(string) {
    /**
     * @param {string} string Input string of UTF-16 code units.
     * @return {Array.<number>} Code points.
     */
    function stringToCodePoints(string) {
      /** @type {Array.<number>} */
      var cps = [];
      // Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
      var i = 0, n = string.length;
      while (i < string.length) {
        var c = string.charCodeAt(i);
        if (!inRange(c, 0xD800, 0xDFFF)) {
          cps.push(c);
        } else if (inRange(c, 0xDC00, 0xDFFF)) {
          cps.push(0xFFFD);
        } else { // (inRange(cu, 0xD800, 0xDBFF))
          if (i === n - 1) {
            cps.push(0xFFFD);
          } else {
            var d = string.charCodeAt(i + 1);
            if (inRange(d, 0xDC00, 0xDFFF)) {
              var a = c & 0x3FF;
              var b = d & 0x3FF;
              i += 1;
              cps.push(0x10000 + (a << 10) + b);
            } else {
              cps.push(0xFFFD);
            }
          }
        }
        i += 1;
      }
      return cps;
    }

    /** @type {number} */
    var pos = 0;
    /** @type {Array.<number>} */
    var cps = stringToCodePoints(string);

    /** @param {number} n The number of bytes (positive or negative)
     *      to advance the code point pointer by.*/
    this.offset = function(n) {
      pos += n;
      if (pos < 0) {
        throw new Error('Seeking past start of the buffer');
      }
      if (pos > cps.length) {
        throw new Error('Seeking past EOF');
      }
    };


    /** @return {number} Get the next code point from the stream. */
    this.get = function() {
      if (pos >= cps.length) {
        return EOF_code_point;
      }
      return cps[pos];
    };
  }

  /**
   * @constructor
   */
  function CodePointOutputStream() {
    /** @type {string} */
    var string = '';

    /** @return {string} The accumulated string. */
    this.string = function() {
      return string;
    };

    /** @param {number} c The code point to encode into the stream. */
    this.emit = function(c) {
      if (c <= 0xFFFF) {
        string += String.fromCharCode(c);
      } else {
        c -= 0x10000;
        string += String.fromCharCode(0xD800 + ((c >> 10) & 0x3ff));
        string += String.fromCharCode(0xDC00 + (c & 0x3ff));
      }
    };
  }

  /**
   * @constructor
   * @param {string} message Description of the error.
   */
  function EncodingError(message) {
    this.name = 'EncodingError';
    this.message = message;
    this.code = 0;
  }
  EncodingError.prototype = Error.prototype;

  /**
   * @param {boolean} fatal If true, decoding errors raise an exception.
   * @param {number=} opt_code_point Override the standard fallback code point.
   * @return {number} The code point to insert on a decoding error.
   */
  function decoderError(fatal, opt_code_point) {
    if (fatal) {
      throw new EncodingError('Decoder error');
    }
    return opt_code_point || 0xFFFD;
  }

  /**
   * @param {number} code_point The code point that could not be encoded.
   */
  function encoderError(code_point) {
    throw new EncodingError('The code point ' + code_point +
                            ' could not be encoded.');
  }

  /**
   * @param {string} label The encoding label.
   * @return {?{name:string,labels:Array.<string>}}
   */
  function getEncoding(label) {
    label = String(label).trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(label_to_encoding, label)) {
      return label_to_encoding[label];
    }
    return null;
  }

  /** @type {Array.<{encodings: Array.<{name:string,labels:Array.<string>}>,
   *      heading: string}>} */
  var encodings = [
    {
      'encodings': [
        {
          'labels': [
            'unicode-1-1-utf-8',
            'utf-8',
            'utf8'
          ],
          'name': 'utf-8'
        }
      ],
      'heading': 'The Encoding'
    },
    {
      'encodings': [
        {
          'labels': [
            'cp864',
            'ibm864'
          ],
          'name': 'ibm864'
        },
        {
          'labels': [
            'cp866',
            'ibm866'
          ],
          'name': 'ibm866'
        },
        {
          'labels': [
            'csisolatin2',
            'iso-8859-2',
            'iso-ir-101',
            'iso8859-2',
            'iso_8859-2',
            'l2',
            'latin2'
          ],
          'name': 'iso-8859-2'
        },
        {
          'labels': [
            'csisolatin3',
            'iso-8859-3',
            'iso_8859-3',
            'iso-ir-109',
            'l3',
            'latin3'
          ],
          'name': 'iso-8859-3'
        },
        {
          'labels': [
            'csisolatin4',
            'iso-8859-4',
            'iso_8859-4',
            'iso-ir-110',
            'l4',
            'latin4'
          ],
          'name': 'iso-8859-4'
        },
        {
          'labels': [
            'csisolatincyrillic',
            'cyrillic',
            'iso-8859-5',
            'iso_8859-5',
            'iso-ir-144'
          ],
          'name': 'iso-8859-5'
        },
        {
          'labels': [
            'arabic',
            'csisolatinarabic',
            'ecma-114',
            'iso-8859-6',
            'iso_8859-6',
            'iso-ir-127'
          ],
          'name': 'iso-8859-6'
        },
        {
          'labels': [
            'csisolatingreek',
            'ecma-118',
            'elot_928',
            'greek',
            'greek8',
            'iso-8859-7',
            'iso_8859-7',
            'iso-ir-126'
          ],
          'name': 'iso-8859-7'
        },
        {
          'labels': [
            'csisolatinhebrew',
            'hebrew',
            'iso-8859-8',
            'iso-8859-8-i',
            'iso-ir-138',
            'iso_8859-8',
            'visual'
          ],
          'name': 'iso-8859-8'
        },
        {
          'labels': [
            'csisolatin6',
            'iso-8859-10',
            'iso-ir-157',
            'iso8859-10',
            'l6',
            'latin6'
          ],
          'name': 'iso-8859-10'
        },
        {
          'labels': [
            'iso-8859-13'
          ],
          'name': 'iso-8859-13'
        },
        {
          'labels': [
            'iso-8859-14',
            'iso8859-14'
          ],
          'name': 'iso-8859-14'
        },
        {
          'labels': [
            'iso-8859-15',
            'iso_8859-15'
          ],
          'name': 'iso-8859-15'
        },
        {
          'labels': [
            'iso-8859-16'
          ],
          'name': 'iso-8859-16'
        },
        {
          'labels': [
            'koi8-r',
            'koi8_r'
          ],
          'name': 'koi8-r'
        },
        {
          'labels': [
            'koi8-u'
          ],
          'name': 'koi8-u'
        },
        {
          'labels': [
            'csmacintosh',
            'mac',
            'macintosh',
            'x-mac-roman'
          ],
          'name': 'macintosh'
        },
        {
          'labels': [
            'iso-8859-11',
            'tis-620',
            'windows-874'
          ],
          'name': 'windows-874'
        },
        {
          'labels': [
            'windows-1250',
            'x-cp1250'
          ],
          'name': 'windows-1250'
        },
        {
          'labels': [
            'windows-1251',
            'x-cp1251'
          ],
          'name': 'windows-1251'
        },
        {
          'labels': [
            'ascii',
            'ansi_x3.4-1968',
            'csisolatin1',
            'iso-8859-1',
            'iso8859-1',
            'iso_8859-1',
            'l1',
            'latin1',
            'us-ascii',
            'windows-1252'
          ],
          'name': 'windows-1252'
        },
        {
          'labels': [
            'cp1253',
            'windows-1253'
          ],
          'name': 'windows-1253'
        },
        {
          'labels': [
            'csisolatin5',
            'iso-8859-9',
            'iso-ir-148',
            'l5',
            'latin5',
            'windows-1254'
          ],
          'name': 'windows-1254'
        },
        {
          'labels': [
            'cp1255',
            'windows-1255'
          ],
          'name': 'windows-1255'
        },
        {
          'labels': [
            'cp1256',
            'windows-1256'
          ],
          'name': 'windows-1256'
        },
        {
          'labels': [
            'windows-1257'
          ],
          'name': 'windows-1257'
        },
        {
          'labels': [
            'cp1258',
            'windows-1258'
          ],
          'name': 'windows-1258'
        },
        {
          'labels': [
            'x-mac-cyrillic',
            'x-mac-ukrainian'
          ],
          'name': 'x-mac-cyrillic'
        }
      ],
      'heading': 'Legacy single-byte encodings'
    },
    {
      'encodings': [
        {
          'labels': [
            'chinese',
            'csgb2312',
            'csiso58gb231280',
            'gb2312',
            'gbk',
            'gb_2312',
            'gb_2312-80',
            'iso-ir-58',
            'x-gbk'
          ],
          'name': 'gbk'
        },
        {
          'labels': [
            'gb18030'
          ],
          'name': 'gb18030'
        },
        {
          'labels': [
            'hz-gb-2312'
          ],
          'name': 'hz-gb-2312'
        }
      ],
      'heading': 'Legacy multi-byte Chinese (simplified) encodings'
    },
    {
      'encodings': [
        {
          'labels': [
            'big5',
            'big5-hkscs',
            'cn-big5',
            'csbig5',
            'x-x-big5'
          ],
          'name': 'big5'
        }
      ],
      'heading': 'Legacy multi-byte Chinese (traditional) encodings'
    },
    {
      'encodings': [
        {
          'labels': [
            'cseucpkdfmtjapanese',
            'euc-jp',
            'x-euc-jp'
          ],
          'name': 'euc-jp'
        },
        {
          'labels': [
            'csiso2022jp',
            'iso-2022-jp'
          ],
          'name': 'iso-2022-jp'
        },
        {
          'labels': [
            'csshiftjis',
            'ms_kanji',
            'shift-jis',
            'shift_jis',
            'sjis',
            'windows-31j',
            'x-sjis'
          ],
          'name': 'shift_jis'
        }
      ],
      'heading': 'Legacy multi-byte Japanese encodings'
    },
    {
      'encodings': [
        {
          'labels': [
            'cseuckr',
            'csksc56011987',
            'euc-kr',
            'iso-ir-149',
            'korean',
            'ks_c_5601-1987',
            'ks_c_5601-1989',
            'ksc5601',
            'ksc_5601',
            'windows-949'
          ],
          'name': 'euc-kr'
        },
        {
          'labels': [
            'csiso2022kr',
            'iso-2022-kr'
          ],
          'name': 'iso-2022-kr'
        }
      ],
      'heading': 'Legacy multi-byte Korean encodings'
    },
    {
      'encodings': [
        {
          'labels': [
            'utf-16',
            'utf-16le'
          ],
          'name': 'utf-16'
        },
        {
          'labels': [
            'utf-16be'
          ],
          'name': 'utf-16be'
        }
      ],
      'heading': 'Legacy utf-16 encodings'
    }
  ];

  var name_to_encoding = {};
  var label_to_encoding = {};
  encodings.forEach(function(category) {
    category.encodings.forEach(function(encoding) {
      name_to_encoding[encoding.name] = encoding;
      encoding.labels.forEach(function(label) {
        label_to_encoding[label] = encoding;
      });
    });
  });

  //
  // 5. Indexes
  //

  /**
   * @param {number} pointer The |pointer| to search for.
   * @param {Array.<?number>} index The |index| to search within.
   * @return {?number} The code point corresponding to |pointer| in |index|,
   *     or null if |code point| is not in |index|.
   */
  function indexCodePointFor(pointer, index) {
    return (index || [])[pointer] || null;
  }

  /**
   * @param {number} code_point The |code point| to search for.
   * @param {Array.<?number>} index The |index| to search within.
   * @return {?number} The first pointer corresponding to |code point| in
   *     |index|, or null if |code point| is not in |index|.
   */
  function indexPointerFor(code_point, index) {
    var pointer = index.indexOf(code_point);
    return pointer === -1 ? null : pointer;
  }

  /** @type {Object.<string, (Array.<number>|Array.<Array.<number>>)>} */
  var indexes = global['encoding-indexes'] || {};

  /**
   * @param {number} pointer The |pointer| to search for in the gb18030 index.
   * @return {?number} The code point corresponding to |pointer| in |index|,
   *     or null if |code point| is not in the gb18030 index.
   */
  function indexGB18030CodePointFor(pointer) {
    if ((pointer > 39419 && pointer < 189000) || (pointer > 1237575)) {
      return null;
    }
    var /** @type {number} */ offset = 0,
        /** @type {number} */ code_point_offset = 0,
        /** @type {Array.<Array.<number>>} */ index = indexes['gb18030'];
    var i;
    for (i = 0; i < index.length; ++i) {
      var entry = index[i];
      if (entry[0] <= pointer) {
        offset = entry[0];
        code_point_offset = entry[1];
      } else {
        break;
      }
    }
    return code_point_offset + pointer - offset;
  }

  /**
   * @param {number} code_point The |code point| to locate in the gb18030 index.
   * @return {number} The first pointer corresponding to |code point| in the
   *     gb18030 index.
   */
  function indexGB18030PointerFor(code_point) {
    var /** @type {number} */ offset = 0,
        /** @type {number} */ pointer_offset = 0,
        /** @type {Array.<Array.<number>>} */ index = indexes['gb18030'];
    var i;
    for (i = 0; i < index.length; ++i) {
      var entry = index[i];
      if (entry[1] <= code_point) {
        offset = entry[1];
        pointer_offset = entry[0];
      } else {
        break;
      }
    }
    return pointer_offset + code_point - offset;
  }

  //
  // 7. The encoding
  //

  // 7.1 utf-8

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function UTF8Decoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ utf8_code_point = 0,
        /** @type {number} */ utf8_bytes_needed = 0,
        /** @type {number} */ utf8_bytes_seen = 0,
        /** @type {number} */ utf8_lower_boundary = 0;

    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte) {
        if (utf8_bytes_needed !== 0) {
          return decoderError(fatal);
        }
        return EOF_code_point;
      }
      byte_pointer.offset(1);

      if (utf8_bytes_needed === 0) {
        if (inRange(bite, 0x00, 0x7F)) {
          return bite;
        }
        if (inRange(bite, 0xC2, 0xDF)) {
          utf8_bytes_needed = 1;
          utf8_lower_boundary = 0x80;
          utf8_code_point = bite - 0xC0;
        } else if (inRange(bite, 0xE0, 0xEF)) {
          utf8_bytes_needed = 2;
          utf8_lower_boundary = 0x800;
          utf8_code_point = bite - 0xE0;
        } else if (inRange(bite, 0xF0, 0xF4)) {
          utf8_bytes_needed = 3;
          utf8_lower_boundary = 0x10000;
          utf8_code_point = bite - 0xF0;
        } else {
          return decoderError(fatal);
        }
        utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
        return null;
      }
      if (!inRange(bite, 0x80, 0xBF)) {
        utf8_code_point = 0;
        utf8_bytes_needed = 0;
        utf8_bytes_seen = 0;
        utf8_lower_boundary = 0;
        byte_pointer.offset(-1);
        return decoderError(fatal);
      }
      utf8_bytes_seen += 1;
      utf8_code_point = utf8_code_point + (bite - 0x80) *
          Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);
      if (utf8_bytes_seen !== utf8_bytes_needed) {
        return null;
      }
      var code_point = utf8_code_point;
      var lower_boundary = utf8_lower_boundary;
      utf8_code_point = 0;
      utf8_bytes_needed = 0;
      utf8_bytes_seen = 0;
      utf8_lower_boundary = 0;
      if (inRange(code_point, lower_boundary, 0x10FFFF) &&
          !inRange(code_point, 0xD800, 0xDFFF)) {
        return code_point;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function UTF8Encoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0xD800, 0xDFFF)) {
        return encoderError(code_point);
      }
      if (inRange(code_point, 0x0000, 0x007f)) {
        return output_byte_stream.emit(code_point);
      }
      var count, offset;
      if (inRange(code_point, 0x0080, 0x07FF)) {
        count = 1;
        offset = 0xC0;
      } else if (inRange(code_point, 0x0800, 0xFFFF)) {
        count = 2;
        offset = 0xE0;
      } else if (inRange(code_point, 0x10000, 0x10FFFF)) {
        count = 3;
        offset = 0xF0;
      }
      var result = output_byte_stream.emit(
          div(code_point, Math.pow(64, count)) + offset);
      while (count > 0) {
        var temp = div(code_point, Math.pow(64, count - 1));
        result = output_byte_stream.emit(0x80 + (temp % 64));
        count -= 1;
      }
      return result;
    };
  }

  name_to_encoding['utf-8'].getEncoder = function(options) {
    return new UTF8Encoder(options);
  };
  name_to_encoding['utf-8'].getDecoder = function(options) {
    return new UTF8Decoder(options);
  };

  //
  // 8. Legacy single-byte encodings
  //

  /**
   * @constructor
   * @param {Array.<number>} index The encoding index.
   * @param {{fatal: boolean}} options
   */
  function SingleByteDecoder(index, options) {
    var fatal = options.fatal;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte) {
        return EOF_code_point;
      }
      byte_pointer.offset(1);
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      var code_point = index[bite - 0x80];
      if (code_point === null) {
        return decoderError(fatal);
      }
      return code_point;
    };
  }

  /**
   * @constructor
   * @param {Array.<?number>} index The encoding index.
   * @param {{fatal: boolean}} options
   */
  function SingleByteEncoder(index, options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, index);
      if (pointer === null) {
        encoderError(code_point);
      }
      return output_byte_stream.emit(pointer + 0x80);
    };
  }

  (function() {
    ['ibm864', 'ibm866', 'iso-8859-2', 'iso-8859-3', 'iso-8859-4',
     'iso-8859-5', 'iso-8859-6', 'iso-8859-7', 'iso-8859-8', 'iso-8859-10',
     'iso-8859-13', 'iso-8859-14', 'iso-8859-15', 'iso-8859-16', 'koi8-r',
     'koi8-u', 'macintosh', 'windows-874', 'windows-1250', 'windows-1251',
     'windows-1252', 'windows-1253', 'windows-1254', 'windows-1255',
     'windows-1256', 'windows-1257', 'windows-1258', 'x-mac-cyrillic'
    ].forEach(function(name) {
      var encoding = name_to_encoding[name];
      var index = indexes[name];
      encoding.getDecoder = function(options) {
        return new SingleByteDecoder(index, options);
      };
      encoding.getEncoder = function(options) {
        return new SingleByteEncoder(index, options);
      };
    });
  }());

  //
  // 9. Legacy multi-byte Chinese (simplified) encodings
  //

  // 9.1 gbk

  /**
   * @constructor
   * @param {boolean} gb18030 True if decoding gb18030, false otherwise.
   * @param {{fatal: boolean}} options
   */
  function GBKDecoder(gb18030, options) {
    var fatal = options.fatal;
    var /** @type {number} */ gbk_first = 0x00,
        /** @type {number} */ gbk_second = 0x00,
        /** @type {number} */ gbk_third = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && gbk_first === 0x00 &&
          gbk_second === 0x00 && gbk_third === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte &&
          (gbk_first !== 0x00 || gbk_second !== 0x00 || gbk_third !== 0x00)) {
        gbk_first = 0x00;
        gbk_second = 0x00;
        gbk_third = 0x00;
        decoderError(fatal);
      }
      byte_pointer.offset(1);
      var code_point;
      if (gbk_third !== 0x00) {
        code_point = null;
        if (inRange(bite, 0x30, 0x39)) {
          code_point = indexGB18030CodePointFor(
              (((gbk_first - 0x81) * 10 + (gbk_second - 0x30)) * 126 +
               (gbk_third - 0x81)) * 10 + bite - 0x30);
        }
        gbk_first = 0x00;
        gbk_second = 0x00;
        gbk_third = 0x00;
        if (code_point === null) {
          byte_pointer.offset(-3);
          return decoderError(fatal);
        }
        return code_point;
      }
      if (gbk_second !== 0x00) {
        if (inRange(bite, 0x81, 0xFE)) {
          gbk_third = bite;
          return null;
        }
        byte_pointer.offset(-2);
        gbk_first = 0x00;
        gbk_second = 0x00;
        return decoderError(fatal);
      }
      if (gbk_first !== 0x00) {
        if (inRange(bite, 0x30, 0x39) && gb18030) {
          gbk_second = bite;
          return null;
        }
        var lead = gbk_first;
        var pointer = null;
        gbk_first = 0x00;
        var offset = bite < 0x7F ? 0x40 : 0x41;
        if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFE)) {
          pointer = (lead - 0x81) * 190 + (bite - offset);
        }
        code_point = pointer === null ? null :
            indexCodePointFor(pointer, indexes['gbk']);
        if (pointer === null) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      if (bite === 0x80) {
        return 0x20AC;
      }
      if (inRange(bite, 0x81, 0xFE)) {
        gbk_first = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {boolean} gb18030 True if decoding gb18030, false otherwise.
   * @param {{fatal: boolean}} options
   */
  function GBKEncoder(gb18030, options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, indexes['gbk']);
      if (pointer !== null) {
        var lead = div(pointer, 190) + 0x81;
        var trail = pointer % 190;
        var offset = trail < 0x3F ? 0x40 : 0x41;
        return output_byte_stream.emit(lead, trail + offset);
      }
      if (pointer === null && !gb18030) {
        return encoderError(code_point);
      }
      pointer = indexGB18030PointerFor(code_point);
      var byte1 = div(div(div(pointer, 10), 126), 10);
      pointer = pointer - byte1 * 10 * 126 * 10;
      var byte2 = div(div(pointer, 10), 126);
      pointer = pointer - byte2 * 10 * 126;
      var byte3 = div(pointer, 10);
      var byte4 = pointer - byte3 * 10;
      return output_byte_stream.emit(byte1 + 0x81,
                                     byte2 + 0x30,
                                     byte3 + 0x81,
                                     byte4 + 0x30);
    };
  }

  name_to_encoding['gbk'].getEncoder = function(options) {
    return new GBKEncoder(false, options);
  };
  name_to_encoding['gbk'].getDecoder = function(options) {
    return new GBKDecoder(false, options);
  };

  // 9.2 gb18030
  name_to_encoding['gb18030'].getEncoder = function(options) {
    return new GBKEncoder(true, options);
  };
  name_to_encoding['gb18030'].getDecoder = function(options) {
    return new GBKDecoder(true, options);
  };

  // 9.3 hz-gb-2312

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function HZGB2312Decoder(options) {
    var fatal = options.fatal;
    var /** @type {boolean} */ hzgb2312 = false,
        /** @type {number} */ hzgb2312_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && hzgb2312_lead === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && hzgb2312_lead !== 0x00) {
        hzgb2312_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (hzgb2312_lead === 0x7E) {
        hzgb2312_lead = 0x00;
        if (bite === 0x7B) {
          hzgb2312 = true;
          return null;
        }
        if (bite === 0x7D) {
          hzgb2312 = false;
          return null;
        }
        if (bite === 0x7E) {
          return 0x007E;
        }
        if (bite === 0x0A) {
          return null;
        }
        byte_pointer.offset(-1);
        return decoderError(fatal);
      }
      if (hzgb2312_lead !== 0x00) {
        var lead = hzgb2312_lead;
        hzgb2312_lead = 0x00;
        var code_point = null;
        if (inRange(bite, 0x21, 0x7E)) {
          code_point = indexCodePointFor((lead - 1) * 190 +
                                         (bite + 0x3F), indexes['gbk']);
        }
        if (bite === 0x0A) {
          hzgb2312 = false;
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (bite === 0x7E) {
        hzgb2312_lead = 0x7E;
        return null;
      }
      if (hzgb2312) {
        if (inRange(bite, 0x20, 0x7F)) {
          hzgb2312_lead = bite;
          return null;
        }
        if (bite === 0x0A) {
          hzgb2312 = false;
        }
        return decoderError(fatal);
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function HZGB2312Encoder(options) {
    var fatal = options.fatal;
    var hzgb2312 = false;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F) && hzgb2312) {
        code_point_pointer.offset(-1);
        hzgb2312 = false;
        return output_byte_stream.emit(0x7E, 0x7D);
      }
      if (code_point === 0x007E) {
        return output_byte_stream.emit(0x7E, 0x7E);
      }
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (!hzgb2312) {
        code_point_pointer.offset(-1);
        hzgb2312 = true;
        return output_byte_stream.emit(0x7E, 0x7B);
      }
      var pointer = indexPointerFor(code_point, indexes['gbk']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 190) + 1;
      var trail = pointer % 190 - 0x3F;
      if (!inRange(lead, 0x21, 0x7E) || !inRange(trail, 0x21, 0x7E)) {
        return encoderError(code_point);
      }
      return output_byte_stream.emit(lead, trail);
    };
  }

  name_to_encoding['hz-gb-2312'].getEncoder = function(options) {
    return new HZGB2312Encoder(options);
  };
  name_to_encoding['hz-gb-2312'].getDecoder = function(options) {
    return new HZGB2312Decoder(options);
  };

  //
  // 10. Legacy multi-byte Chinese (traditional) encodings
  //

  // 10.1 big5

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function Big5Decoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ big5_lead = 0x00,
        /** @type {?number} */ big5_pending = null;

    /**
     * @param {ByteInputStream} byte_pointer The byte steram to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      // NOTE: Hack to support emitting two code points
      if (big5_pending !== null) {
        var pending = big5_pending;
        big5_pending = null;
        return pending;
      }
      var bite = byte_pointer.get();
      if (bite === EOF_byte && big5_lead === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && big5_lead !== 0x00) {
        big5_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (big5_lead !== 0x00) {
        var lead = big5_lead;
        var pointer = null;
        big5_lead = 0x00;
        var offset = bite < 0x7F ? 0x40 : 0x62;
        if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0xA1, 0xFE)) {
          pointer = (lead - 0x81) * 157 + (bite - offset);
        }
        if (pointer === 1133) {
          big5_pending = 0x0304;
          return 0x00CA;
        }
        if (pointer === 1135) {
          big5_pending = 0x030C;
          return 0x00CA;
        }
        if (pointer === 1164) {
          big5_pending = 0x0304;
          return 0x00EA;
        }
        if (pointer === 1166) {
          big5_pending = 0x030C;
          return 0x00EA;
        }
        var code_point = (pointer === null) ? null :
            indexCodePointFor(pointer, indexes['big5']);
        if (pointer === null) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      if (inRange(bite, 0x81, 0xFE)) {
        big5_lead = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function Big5Encoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, indexes['big5']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 157) + 0x81;
      //if (lead < 0xA1) {
      //  return encoderError(code_point);
      //}
      var trail = pointer % 157;
      var offset = trail < 0x3F ? 0x40 : 0x62;
      return output_byte_stream.emit(lead, trail + offset);
    };
  }

  name_to_encoding['big5'].getEncoder = function(options) {
    return new Big5Encoder(options);
  };
  name_to_encoding['big5'].getDecoder = function(options) {
    return new Big5Decoder(options);
  };


  //
  // 11. Legacy multi-byte Japanese encodings
  //

  // 11.1 euc.jp

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCJPDecoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ eucjp_first = 0x00,
        /** @type {number} */ eucjp_second = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte) {
        if (eucjp_first === 0x00 && eucjp_second === 0x00) {
          return EOF_code_point;
        }
        eucjp_first = 0x00;
        eucjp_second = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);

      var lead, code_point;
      if (eucjp_second !== 0x00) {
        lead = eucjp_second;
        eucjp_second = 0x00;
        code_point = null;
        if (inRange(lead, 0xA1, 0xFE) && inRange(bite, 0xA1, 0xFE)) {
          code_point = indexCodePointFor((lead - 0xA1) * 94 + bite - 0xA1,
                                         indexes['jis0212']);
        }
        if (!inRange(bite, 0xA1, 0xFE)) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (eucjp_first === 0x8E && inRange(bite, 0xA1, 0xDF)) {
        eucjp_first = 0x00;
        return 0xFF61 + bite - 0xA1;
      }
      if (eucjp_first === 0x8F && inRange(bite, 0xA1, 0xFE)) {
        eucjp_first = 0x00;
        eucjp_second = bite;
        return null;
      }
      if (eucjp_first !== 0x00) {
        lead = eucjp_first;
        eucjp_first = 0x00;
        code_point = null;
        if (inRange(lead, 0xA1, 0xFE) && inRange(bite, 0xA1, 0xFE)) {
          code_point = indexCodePointFor((lead - 0xA1) * 94 + bite - 0xA1,
                                         indexes['jis0208']);
        }
        if (!inRange(bite, 0xA1, 0xFE)) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }
      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }
      if (bite === 0x8E || bite === 0x8F || (inRange(bite, 0xA1, 0xFE))) {
        eucjp_first = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCJPEncoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (code_point === 0x00A5) {
        return output_byte_stream.emit(0x5C);
      }
      if (code_point === 0x203E) {
        return output_byte_stream.emit(0x7E);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F)) {
        return output_byte_stream.emit(0x8E, code_point - 0xFF61 + 0xA1);
      }

      var pointer = indexPointerFor(code_point, indexes['jis0208']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 94) + 0xA1;
      var trail = pointer % 94 + 0xA1;
      return output_byte_stream.emit(lead, trail);
    };
  }

  name_to_encoding['euc-jp'].getEncoder = function(options) {
    return new EUCJPEncoder(options);
  };
  name_to_encoding['euc-jp'].getDecoder = function(options) {
    return new EUCJPDecoder(options);
  };

  // 11.2 iso-2022-jp

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022JPDecoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      escape_start: 1,
      escape_middle: 2,
      escape_final: 3,
      lead: 4,
      trail: 5,
      Katakana: 6
    };
    var /** @type {number} */ iso2022jp_state = state.ASCII,
        /** @type {boolean} */ iso2022jp_jis0212 = false,
        /** @type {number} */ iso2022jp_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite !== EOF_byte) {
        byte_pointer.offset(1);
      }
      switch (iso2022jp_state) {
        default:
        case state.ASCII:
          if (bite === 0x1B) {
            iso2022jp_state = state.escape_start;
            return null;
          }
          if (inRange(bite, 0x00, 0x7F)) {
            return bite;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          return decoderError(fatal);

        case state.escape_start:
          if (bite === 0x24 || bite === 0x28) {
            iso2022jp_lead = bite;
            iso2022jp_state = state.escape_middle;
            return null;
          }
          if (bite !== EOF_byte) {
            byte_pointer.offset(-1);
          }
          iso2022jp_state = state.ASCII;
          return decoderError(fatal);

        case state.escape_middle:
          var lead = iso2022jp_lead;
          iso2022jp_lead = 0x00;
          if (lead === 0x24 && (bite === 0x40 || bite === 0x42)) {
            iso2022jp_jis0212 = false;
            iso2022jp_state = state.lead;
            return null;
          }
          if (lead === 0x24 && bite === 0x28) {
            iso2022jp_state = state.escape_final;
            return null;
          }
          if (lead === 0x28 && (bite === 0x42 || bite === 0x4A)) {
            iso2022jp_state = state.ASCII;
            return null;
          }
          if (lead === 0x28 && bite === 0x49) {
            iso2022jp_state = state.Katakana;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-1);
          } else {
            byte_pointer.offset(-2);
          }
          iso2022jp_state = state.ASCII;
          return decoderError(fatal);

        case state.escape_final:
          if (bite === 0x44) {
            iso2022jp_jis0212 = true;
            iso2022jp_state = state.lead;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-2);
          } else {
            byte_pointer.offset(-3);
          }
          iso2022jp_state = state.ASCII;
          return decoderError(fatal);

        case state.lead:
          if (bite === 0x0A) {
            iso2022jp_state = state.ASCII;
            return decoderError(fatal, 0x000A);
          }
          if (bite === 0x1B) {
            iso2022jp_state = state.escape_start;
            return null;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          iso2022jp_lead = bite;
          iso2022jp_state = state.trail;
          return null;

        case state.trail:
          iso2022jp_state = state.lead;
          if (bite === EOF_byte) {
            return decoderError(fatal);
          }
          var code_point = null;
          var pointer = (iso2022jp_lead - 0x21) * 94 + bite - 0x21;
          if (inRange(iso2022jp_lead, 0x21, 0x7E) &&
              inRange(bite, 0x21, 0x7E)) {
            code_point = (iso2022jp_jis0212 === false) ?
                indexCodePointFor(pointer, indexes['jis0208']) :
                indexCodePointFor(pointer, indexes['jis0212']);
          }
          if (code_point === null) {
            return decoderError(fatal);
          }
          return code_point;

        case state.Katakana:
          if (bite === 0x1B) {
            iso2022jp_state = state.escape_start;
            return null;
          }
          if (inRange(bite, 0x21, 0x5F)) {
            return 0xFF61 + bite - 0x21;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          return decoderError(fatal);
      }
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022JPEncoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      lead: 1,
      Katakana: 2
    };
    var /** @type {number} */ iso2022jp_state = state.ASCII;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if ((inRange(code_point, 0x0000, 0x007F) ||
           code_point === 0x00A5 || code_point === 0x203E) &&
          iso2022jp_state !== state.ASCII) {
        code_point_pointer.offset(-1);
        iso2022jp_state = state.ASCII;
        return output_byte_stream.emit(0x1B, 0x28, 0x42);
      }
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (code_point === 0x00A5) {
        return output_byte_stream.emit(0x5C);
      }
      if (code_point === 0x203E) {
        return output_byte_stream.emit(0x7E);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F) &&
          iso2022jp_state !== state.Katakana) {
        code_point_pointer.offset(-1);
        iso2022jp_state = state.Katakana;
        return output_byte_stream.emit(0x1B, 0x28, 0x49);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F)) {
        return output_byte_stream.emit(code_point - 0xFF61 - 0x21);
      }
      if (iso2022jp_state !== state.lead) {
        code_point_pointer.offset(-1);
        iso2022jp_state = state.lead;
        return output_byte_stream.emit(0x1B, 0x24, 0x42);
      }
      var pointer = indexPointerFor(code_point, indexes['jis0208']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 94) + 0x21;
      var trail = pointer % 94 + 0x21;
      return output_byte_stream.emit(lead, trail);
    };
  }

  name_to_encoding['iso-2022-jp'].getEncoder = function(options) {
    return new ISO2022JPEncoder(options);
  };
  name_to_encoding['iso-2022-jp'].getDecoder = function(options) {
    return new ISO2022JPDecoder(options);
  };

  // 11.3 shift_jis

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ShiftJISDecoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ shiftjis_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && shiftjis_lead === 0x00) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && shiftjis_lead !== 0x00) {
        shiftjis_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (shiftjis_lead !== 0x00) {
        var lead = shiftjis_lead;
        shiftjis_lead = 0x00;
        if (inRange(bite, 0x40, 0x7E) || inRange(bite, 0x80, 0xFC)) {
          var offset = (bite < 0x7F) ? 0x40 : 0x41;
          var lead_offset = (lead < 0xA0) ? 0x81 : 0xC1;
          var code_point = indexCodePointFor((lead - lead_offset) * 188 +
                                             bite - offset, indexes['jis0208']);
          if (code_point === null) {
            return decoderError(fatal);
          }
          return code_point;
        }
        byte_pointer.offset(-1);
        return decoderError(fatal);
      }
      if (inRange(bite, 0x00, 0x80)) {
        return bite;
      }
      if (inRange(bite, 0xA1, 0xDF)) {
        return 0xFF61 + bite - 0xA1;
      }
      if (inRange(bite, 0x81, 0x9F) || inRange(bite, 0xE0, 0xFC)) {
        shiftjis_lead = bite;
        return null;
      }
      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ShiftJISEncoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x0080)) {
        return output_byte_stream.emit(code_point);
      }
      if (code_point === 0x00A5) {
        return output_byte_stream.emit(0x5C);
      }
      if (code_point === 0x203E) {
        return output_byte_stream.emit(0x7E);
      }
      if (inRange(code_point, 0xFF61, 0xFF9F)) {
        return output_byte_stream.emit(code_point - 0xFF61 + 0xA1);
      }
      var pointer = indexPointerFor(code_point, indexes['jis0208']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead = div(pointer, 188);
      var lead_offset = lead < 0x1F ? 0x81 : 0xC1;
      var trail = pointer % 188;
      var offset = trail < 0x3F ? 0x40 : 0x41;
      return output_byte_stream.emit(lead + lead_offset, trail + offset);
    };
  }

  name_to_encoding['shift_jis'].getEncoder = function(options) {
    return new ShiftJISEncoder(options);
  };
  name_to_encoding['shift_jis'].getDecoder = function(options) {
    return new ShiftJISDecoder(options);
  };

  //
  // 12. Legacy multi-byte Korean encodings
  //

  // 12.1 euc-kr

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCKRDecoder(options) {
    var fatal = options.fatal;
    var /** @type {number} */ euckr_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && euckr_lead === 0) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && euckr_lead !== 0) {
        euckr_lead = 0x00;
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (euckr_lead !== 0x00) {
        var lead = euckr_lead;
        var pointer = null;
        euckr_lead = 0x00;

        if (inRange(lead, 0x81, 0xC6)) {
          var temp = (26 + 26 + 126) * (lead - 0x81);
          if (inRange(bite, 0x41, 0x5A)) {
            pointer = temp + bite - 0x41;
          } else if (inRange(bite, 0x61, 0x7A)) {
            pointer = temp + 26 + bite - 0x61;
          } else if (inRange(bite, 0x81, 0xFE)) {
            pointer = temp + 26 + 26 + bite - 0x81;
          }
        }

        if (inRange(lead, 0xC7, 0xFD) && inRange(bite, 0xA1, 0xFE)) {
          pointer = (26 + 26 + 126) * (0xC7 - 0x81) + (lead - 0xC7) * 94 +
              (bite - 0xA1);
        }

        var code_point = (pointer === null) ? null :
            indexCodePointFor(pointer, indexes['euc-kr']);
        if (pointer === null) {
          byte_pointer.offset(-1);
        }
        if (code_point === null) {
          return decoderError(fatal);
        }
        return code_point;
      }

      if (inRange(bite, 0x00, 0x7F)) {
        return bite;
      }

      if (inRange(bite, 0x81, 0xFD)) {
        euckr_lead = bite;
        return null;
      }

      return decoderError(fatal);
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function EUCKREncoder(options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      var pointer = indexPointerFor(code_point, indexes['euc-kr']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead, trail;
      if (pointer < ((26 + 26 + 126) * (0xC7 - 0x81))) {
        lead = div(pointer, (26 + 26 + 126)) + 0x81;
        trail = pointer % (26 + 26 + 126);
        var offset = trail < 26 ? 0x41 : trail < 26 + 26 ? 0x47 : 0x4D;
        return output_byte_stream.emit(lead, trail + offset);
      }
      pointer = pointer - (26 + 26 + 126) * (0xC7 - 0x81);
      lead = div(pointer, 94) + 0xC7;
      trail = pointer % 94 + 0xA1;
      return output_byte_stream.emit(lead, trail);
    };
  }

  name_to_encoding['euc-kr'].getEncoder = function(options) {
    return new EUCKREncoder(options);
  };
  name_to_encoding['euc-kr'].getDecoder = function(options) {
    return new EUCKRDecoder(options);
  };

  // 12.2 iso-2022-kr

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022KRDecoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      escape_start: 1,
      escape_middle: 2,
      escape_end: 3,
      lead: 4,
      trail: 5
    };
    var /** @type {number} */ iso2022kr_state = state.ASCII,
        /** @type {number} */ iso2022kr_lead = 0x00;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite !== EOF_byte) {
        byte_pointer.offset(1);
      }
      switch (iso2022kr_state) {
        default:
        case state.ASCII:
          if (bite === 0x0E) {
            iso2022kr_state = state.lead;
            return null;
          }
          if (bite === 0x0F) {
            return null;
          }
          if (bite === 0x1B) {
            iso2022kr_state = state.escape_start;
            return null;
          }
          if (inRange(bite, 0x00, 0x7F)) {
            return bite;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          return decoderError(fatal);
        case state.escape_start:
          if (bite === 0x24) {
            iso2022kr_state = state.escape_middle;
            return null;
          }
          if (bite !== EOF_byte) {
            byte_pointer.offset(-1);
          }
          iso2022kr_state = state.ASCII;
          return decoderError(fatal);
        case state.escape_middle:
          if (bite === 0x29) {
            iso2022kr_state = state.escape_end;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-1);
          } else {
            byte_pointer.offset(-2);
          }
          iso2022kr_state = state.ASCII;
          return decoderError(fatal);
        case state.escape_end:
          if (bite === 0x43) {
            iso2022kr_state = state.ASCII;
            return null;
          }
          if (bite === EOF_byte) {
            byte_pointer.offset(-2);
          } else {
            byte_pointer.offset(-3);
          }
          iso2022kr_state = state.ASCII;
          return decoderError(fatal);
        case state.lead:
          if (bite === 0x0A) {
            iso2022kr_state = state.ASCII;
            return decoderError(fatal, 0x000A);
          }
          if (bite === 0x0E) {
            return null;
          }
          if (bite === 0x0F) {
            iso2022kr_state = state.ASCII;
            return null;
          }
          if (bite === EOF_byte) {
            return EOF_code_point;
          }
          iso2022kr_lead = bite;
          iso2022kr_state = state.trail;
          return null;
        case state.trail:
          iso2022kr_state = state.lead;
          if (bite === EOF_byte) {
            return decoderError(fatal);
          }
          var code_point = null;
          if (inRange(iso2022kr_lead, 0x21, 0x46) &&
              inRange(bite, 0x21, 0x7E)) {
            code_point = indexCodePointFor((26 + 26 + 126) *
                (iso2022kr_lead - 1) +
                26 + 26 + bite - 1,
                indexes['euc-kr']);
          } else if (inRange(iso2022kr_lead, 0x47, 0x7E) &&
              inRange(bite, 0x21, 0x7E)) {
            code_point = indexCodePointFor((26 + 26 + 126) * (0xC7 - 0x81) +
                (iso2022kr_lead - 0x47) * 94 +
                (bite - 0x21),
                indexes['euc-kr']);
          }
          if (code_point !== null) {
            return code_point;
          }
          return decoderError(fatal);
      }
    };
  }

  /**
   * @constructor
   * @param {{fatal: boolean}} options
   */
  function ISO2022KREncoder(options) {
    var fatal = options.fatal;
    /** @enum */
    var state = {
      ASCII: 0,
      lead: 1
    };
    var /** @type {boolean} */ iso2022kr_initialization = false,
        /** @type {number} */ iso2022kr_state = state.ASCII;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      if (!iso2022kr_initialization) {
        iso2022kr_initialization = true;
        output_byte_stream.emit(0x1B, 0x24, 0x29, 0x43);
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0x0000, 0x007F) &&
          iso2022kr_state !== state.ASCII) {
        code_point_pointer.offset(-1);
        iso2022kr_state = state.ASCII;
        return output_byte_stream.emit(0x0F);
      }
      if (inRange(code_point, 0x0000, 0x007F)) {
        return output_byte_stream.emit(code_point);
      }
      if (iso2022kr_state !== state.lead) {
        code_point_pointer.offset(-1);
        iso2022kr_state = state.lead;
        return output_byte_stream.emit(0x0E);
      }
      var pointer = indexPointerFor(code_point, indexes['euc-kr']);
      if (pointer === null) {
        return encoderError(code_point);
      }
      var lead, trail;
      if (pointer < (26 + 26 + 126) * (0xC7 - 0x81)) {
        lead = div(pointer, (26 + 26 + 126)) + 1;
        trail = pointer % (26 + 26 + 126) - 26 - 26 + 1;
        if (!inRange(lead, 0x21, 0x46) || !inRange(trail, 0x21, 0x7E)) {
          return encoderError(code_point);
        }
        return output_byte_stream.emit(lead, trail);
      }
      pointer = pointer - (26 + 26 + 126) * (0xC7 - 0x81);
      lead = div(pointer, 94) + 0x47;
      trail = pointer % 94 + 0x21;
      if (!inRange(lead, 0x47, 0x7E) || !inRange(trail, 0x21, 0x7E)) {
        return encoderError(code_point);
      }
      return output_byte_stream.emit(lead, trail);
    };
  }

  name_to_encoding['iso-2022-kr'].getEncoder = function(options) {
    return new ISO2022KREncoder(options);
  };
  name_to_encoding['iso-2022-kr'].getDecoder = function(options) {
    return new ISO2022KRDecoder(options);
  };


  //
  // 13. Legacy utf-16 encodings
  //

  // 13.1 utf-16

  /**
   * @constructor
   * @param {boolean} utf16_be True if big-endian, false if little-endian.
   * @param {{fatal: boolean}} options
   */
  function UTF16Decoder(utf16_be, options) {
    var fatal = options.fatal;
    var /** @type {?number} */ utf16_lead_byte = null,
        /** @type {?number} */ utf16_lead_surrogate = null;
    /**
     * @param {ByteInputStream} byte_pointer The byte stream to decode.
     * @return {?number} The next code point decoded, or null if not enough
     *     data exists in the input stream to decode a complete code point.
     */
    this.decode = function(byte_pointer) {
      var bite = byte_pointer.get();
      if (bite === EOF_byte && utf16_lead_byte === null &&
          utf16_lead_surrogate === null) {
        return EOF_code_point;
      }
      if (bite === EOF_byte && (utf16_lead_byte !== null ||
                                utf16_lead_surrogate !== null)) {
        return decoderError(fatal);
      }
      byte_pointer.offset(1);
      if (utf16_lead_byte === null) {
        utf16_lead_byte = bite;
        return null;
      }
      var code_point;
      if (utf16_be) {
        code_point = (utf16_lead_byte << 8) + bite;
      } else {
        code_point = (bite << 8) + utf16_lead_byte;
      }
      utf16_lead_byte = null;
      if (utf16_lead_surrogate !== null) {
        var lead_surrogate = utf16_lead_surrogate;
        utf16_lead_surrogate = null;
        if (inRange(code_point, 0xDC00, 0xDFFF)) {
          return 0x10000 + (lead_surrogate - 0xD800) * 0x400 +
              (code_point - 0xDC00);
        }
        byte_pointer.offset(-2);
        return decoderError(fatal);
      }
      if (inRange(code_point, 0xD800, 0xDBFF)) {
        utf16_lead_surrogate = code_point;
        return null;
      }
      if (inRange(code_point, 0xDC00, 0xDFFF)) {
        return decoderError(fatal);
      }
      return code_point;
    };
  }

  /**
   * @constructor
   * @param {boolean} utf16_be True if big-endian, false if little-endian.
   * @param {{fatal: boolean}} options
   */
  function UTF16Encoder(utf16_be, options) {
    var fatal = options.fatal;
    /**
     * @param {ByteOutputStream} output_byte_stream Output byte stream.
     * @param {CodePointInputStream} code_point_pointer Input stream.
     * @return {number} The last byte emitted.
     */
    this.encode = function(output_byte_stream, code_point_pointer) {
      function convert_to_bytes(code_unit) {
        var byte1 = code_unit >> 8;
        var byte2 = code_unit & 0x00FF;
        if (utf16_be) {
          return output_byte_stream.emit(byte1, byte2);
        }
        return output_byte_stream.emit(byte2, byte1);
      }
      var code_point = code_point_pointer.get();
      if (code_point === EOF_code_point) {
        return EOF_byte;
      }
      code_point_pointer.offset(1);
      if (inRange(code_point, 0xD800, 0xDFFF)) {
        encoderError(code_point);
      }
      if (code_point <= 0xFFFF) {
        return convert_to_bytes(code_point);
      }
      var lead = div((code_point - 0x10000), 0x400) + 0xD800;
      var trail = ((code_point - 0x10000) % 0x400) + 0xDC00;
      convert_to_bytes(lead);
      return convert_to_bytes(trail);
    };
  }

  name_to_encoding['utf-16'].getEncoder = function(options) {
    return new UTF16Encoder(false, options);
  };
  name_to_encoding['utf-16'].getDecoder = function(options) {
    return new UTF16Decoder(false, options);
  };

  // 13.2 utf-16be
  name_to_encoding['utf-16be'].getEncoder = function(options) {
    return new UTF16Encoder(true, options);
  };
  name_to_encoding['utf-16be'].getDecoder = function(options) {
    return new UTF16Decoder(true, options);
  };


  // NOTE: currently unused
  /**
   * @param {string} label The encoding label.
   * @param {ByteInputStream} input_stream The byte stream to test.
   */
  function detectEncoding(label, input_stream) {
    if (input_stream.match([0xFF, 0xFE])) {
      input_stream.offset(2);
      return 'utf-16';
    }
    if (input_stream.match([0xFE, 0xFF])) {
      input_stream.offset(2);
      return 'utf-16be';
    }
    if (input_stream.match([0xEF, 0xBB, 0xBF])) {
      input_stream.offset(3);
      return 'utf-8';
    }
    return label;
  }

  /**
   * @param {string} label The encoding label.
   * @param {ByteInputStream} input_stream The byte stream to test.
   */
  function consumeBOM(label, input_stream) {
    if (input_stream.match([0xFF, 0xFE]) && label === 'utf-16') {
      input_stream.offset(2);
      return;
    }
    if (input_stream.match([0xFE, 0xFF]) && label == 'utf-16be') {
      input_stream.offset(2);
      return;
    }
    if (input_stream.match([0xEF, 0xBB, 0xBF]) && label == 'utf-8') {
      input_stream.offset(3);
      return;
    }
  }

  //
  // Implementation of Text Encoding Web API
  //

  /** @const */ var DEFAULT_ENCODING = 'utf-8';

  /**
   * @constructor
   * @param {string=} opt_encoding The label of the encoding;
   *     defaults to 'utf-8'.
   * @param {{fatal: boolean}=} options
   */
  function TextEncoder(opt_encoding, options) {
    if (!this || this === global) {
      return new TextEncoder(opt_encoding, options);
    }
    opt_encoding = opt_encoding ? String(opt_encoding) : DEFAULT_ENCODING;
    options = Object(options);
    /** @private */
    this._encoding = getEncoding(opt_encoding);
    if (this._encoding === null || (this._encoding.name !== 'utf-8' &&
                                    this._encoding.name !== 'utf-16' &&
                                    this._encoding.name !== 'utf-16be'))
      throw new TypeError('Unknown encoding: ' + opt_encoding);
    /* @private @type {boolean} */
    this._streaming = false;
    /** @private */
    this._encoder = null;
    /* @private @type {{fatal: boolean}=} */
    this._options = { fatal: Boolean(options.fatal) };

    if (Object.defineProperty) {
      Object.defineProperty(
          this, 'encoding',
          { get: function() { return this._encoding.name; } });
    } else {
      this.encoding = this._encoding.name;
    }

    return this;
  }

  TextEncoder.prototype = {
    /**
     * @param {string=} opt_string The string to encode.
     * @param {{stream: boolean}=} options
     */
    encode: function encode(opt_string, options) {
      opt_string = opt_string ? String(opt_string) : '';
      options = Object(options);
      // TODO: any options?
      if (!this._streaming) {
        this._encoder = this._encoding.getEncoder(this._options);
      }
      this._streaming = Boolean(options.stream);

      var bytes = [];
      var output_stream = new ByteOutputStream(bytes);
      var input_stream = new CodePointInputStream(opt_string);
      while (input_stream.get() !== EOF_code_point) {
        this._encoder.encode(output_stream, input_stream);
      }
      if (!this._streaming) {
        var last_byte;
        do {
          last_byte = this._encoder.encode(output_stream, input_stream);
        } while (last_byte !== EOF_byte);
        this._encoder = null;
      }
      return new Uint8Array(bytes);
    }
  };


  /**
   * @constructor
   * @param {string=} opt_encoding The label of the encoding;
   *     defaults to 'utf-8'.
   * @param {{fatal: boolean}=} options
   */
  function TextDecoder(opt_encoding, options) {
    if (!this || this === global) {
      return new TextDecoder(opt_encoding, options);
    }
    opt_encoding = opt_encoding ? String(opt_encoding) : DEFAULT_ENCODING;
    options = Object(options);
    /** @private */
    this._encoding = getEncoding(opt_encoding);
    if (this._encoding === null)
      throw new TypeError('Unknown encoding: ' + opt_encoding);

    /* @private @type {boolean} */
    this._streaming = false;
    /** @private */
    this._decoder = null;
    /* @private @type {{fatal: boolean}=} */
    this._options = { fatal: Boolean(options.fatal) };

    if (Object.defineProperty) {
      Object.defineProperty(
          this, 'encoding',
          { get: function() { return this._encoding.name; } });
    } else {
      this.encoding = this._encoding.name;
    }

    return this;
  }

  // TODO: Issue if input byte stream is offset by decoder
  // TODO: BOM detection will not work if stream header spans multiple calls
  // (last N bytes of previous stream may need to be retained?)
  TextDecoder.prototype = {
    /**
     * @param {ArrayBufferView=} opt_view The buffer of bytes to decode.
     * @param {{stream: boolean}=} options
     */
    decode: function decode(opt_view, options) {
      if (opt_view && !('buffer' in opt_view && 'byteOffset' in opt_view &&
                        'byteLength' in opt_view)) {
        throw new TypeError('Expected ArrayBufferView');
      } else if (!opt_view) {
        opt_view = new Uint8Array(0);
      }
      options = Object(options);

      if (!this._streaming) {
        this._decoder = this._encoding.getDecoder(this._options);
      }
      this._streaming = Boolean(options.stream);

      var bytes = new Uint8Array(opt_view.buffer,
                                 opt_view.byteOffset,
                                 opt_view.byteLength);
      var input_stream = new ByteInputStream(bytes);

      if (!this._BOMseen) {
        // TODO: Don't do this until sufficient bytes are present
        this._BOMseen = true;
        consumeBOM(this._encoding.name, input_stream);
      }

      var output_stream = new CodePointOutputStream(), code_point;
      while (input_stream.get() !== EOF_byte) {
        code_point = this._decoder.decode(input_stream);
        if (code_point !== null && code_point !== EOF_code_point) {
          output_stream.emit(code_point);
        }
      }
      if (!this._streaming) {
        do {
          code_point = this._decoder.decode(input_stream);
          if (code_point !== null && code_point !== EOF_code_point) {
            output_stream.emit(code_point);
          }
        } while (code_point !== EOF_code_point &&
                 input_stream.get() != EOF_byte);
        this._decoder = null;
      }
      return output_stream.string();
    }
  };

  global['TextEncoder'] = global['TextEncoder'] || TextEncoder;
  global['TextDecoder'] = global['TextDecoder'] || TextDecoder;
}(this));
(function(global) {

// Rumor Messaging for JS
//
// https://tbwiki.tokbox.com/index.php/Rumor_:_Messaging_FrameWork
//
// @todo Rumor {
//     Add error codes for all the error cases
//     Add Dependability commands
// }

OT.Rumor = {
  MessageType: {
    // This is used to subscribe to address/addresses. The address/addresses the
    // client specifies here is registered on the server. Once any message is sent to
    // that address/addresses, the client receives that message.
    SUBSCRIBE: 0,

    // This is used to unsubscribe to address / addresses. Once the client unsubscribe
    // to an address, it will stop getting messages sent to that address.
    UNSUBSCRIBE: 1,

    // This is used to send messages to arbitrary address/ addresses. Messages can be
    // anything and Rumor will not care about what is included.
    MESSAGE: 2,

    // This will be the first message that the client sends to the server. It includes
    // the uniqueId for that client connection and a disconnect_notify address that will
    // be notified once the client disconnects.
    CONNECT: 3,

    // This will be the message used by the server to notify an address that a client disconnected.
    DISCONNECT: 4,

    //Enhancements to support Keepalives
    PING: 7,
    PONG: 8,
    STATUS: 9
  }
};

}(this));
(function(global) {

var BUFFER_DRAIN_INTERVAL = 100,        // The interval between polling the websocket's send buffer
    BUFFER_DRAIN_MAX_RETRIES = 10,      // The total number of times to retest the websocket's send buffer
    WEB_SOCKET_KEEP_ALIVE_INTERVAL = 9000,

    // Magic Connectivity Timeout Constant: We wait 3*the keep alive interval,
    // on the third keep alive we trigger the timeout if we haven't received the
    // server pong.
    WEB_SOCKET_CONNECTIVITY_TIMEOUT = 5*WEB_SOCKET_KEEP_ALIVE_INTERVAL - 100



// https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Close_codes
// http://docs.oracle.com/javaee/7/api/javax/websocket/CloseReason.CloseCodes.html
var wsCloseErrorCodes = {
  1002:  "The endpoint is terminating the connection due to a protocol error. (CLOSE_PROTOCOL_ERROR)",
  1003:  "The connection is being terminated because the endpoint received data of a type it cannot accept (for example, a text-only endpoint received binary data). (CLOSE_UNSUPPORTED)",
  1004:  "The endpoint is terminating the connection because a data frame was received that is too large. (CLOSE_TOO_LARGE)",
  1005:  "Indicates that no status code was provided even though one was expected. (CLOSE_NO_STATUS)",
  1006:  "Used to indicate that a connection was closed abnormally (that is, with no close frame being sent) when a status code is expected. (CLOSE_ABNORMAL)",
  1007: "Indicates that an endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [RFC3629] data within a text message)",
  1008: "Indicates that an endpoint is terminating the connection because it has received a message that violates its policy.  This is a generic status code that can be returned when there is no other more suitable status code (e.g., 1003 or 1009) or if there is a need to hide specific details about the policy",
  1009: "Indicates that an endpoint is terminating the connection because it has received a message that is too big for it to process",
  1011: "Indicates that a server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request",

  // .... codes in the 4000-4999 range are available for use by applications.
  4001:   "Connectivity loss was detected as it was too long since the socket received the last PONG message"
};

OT.Rumor.SocketError = function(code, message) {
  this.code = code;
  this.message = message;
};

// The NativeSocket bit is purely to make testing simpler, it defaults to WebSocket
// so in normal operation you would omit it.
OT.Rumor.Socket = function(messagingServer, notifyDisconnectAddress, NativeSocket) {
  var server = messagingServer,
      webSocket,
      id,
      onOpen,
      onError,
      onClose,
      onMessage,
      connectCallback,
      bufferDrainTimeout,           // Timer to poll whether th send buffer has been drained
      connectTimeout,
      lastMessageTimestamp,         // The timestamp of the last message received
      keepAliveTimer;               // Timer for the connectivity checks


  //// Private API
  var stateChanged = function(newState) {
        switch (newState) {
          case 'disconnected':
          case 'error':
            webSocket = null;
            if (onClose) {
              var error;
              if(hasLostConnectivity()) {
                error = new Error(wsCloseErrorCodes[4001]);
                error.code = 4001;
              }
              onClose(error);
            }
            break;
        }
      },

      setState = OT.$.statable(this, ['disconnected',  'error', 'connected', 'connecting', 'disconnecting'], 'disconnected', stateChanged),

      validateCallback = function validateCallback (name, callback) {
        if (callback === null || !OT.$.isFunction(callback) ) {
          throw new Error("The Rumor.Socket " + name + " callback must be a valid function or null");
        }
      },

      error = function error (errorMessage) {
        OT.error("Rumor.Socket: " + errorMessage);

        var error = new OT.Rumor.SocketError(null, errorMessage || "Unknown Socket Error");

        if (connectTimeout) clearTimeout(connectTimeout);

        setState('error');

        if (this.previousState === 'connecting' && connectCallback) {
          connectCallback(error, null);
          connectCallback = null;
        }

        if (onError) onError(error);
      }.bind(this),

      // Immediately close the socket, only used by disconnectWhenSendBufferIsDrained
      close = function close() {
        setState('disconnecting');

        if (bufferDrainTimeout) {
          clearTimeout(bufferDrainTimeout);
          bufferDrainTimeout = null;
        }
        console.info("CALLED CLOSE ON WEBSOCKET");
        webSocket.close();
      },

      // Ensure that the WebSocket send buffer is fully drained before disconnecting
      // the socket. If the buffer doesn't drain after a certain length of time
      // we give up and close it anyway.
      disconnectWhenSendBufferIsDrained = function disconnectWhenSendBufferIsDrained (bufferDrainRetries) {
        if (!webSocket) return;

        if (bufferDrainRetries === void 0) bufferDrainRetries = 0;
        if (bufferDrainTimeout) clearTimeout(bufferDrainTimeout);

        if (webSocket.bufferedAmount > 0 && (bufferDrainRetries + 1) <= BUFFER_DRAIN_MAX_RETRIES) {
          bufferDrainTimeout = setTimeout(disconnectWhenSendBufferIsDrained, BUFFER_DRAIN_INTERVAL, bufferDrainRetries+1);
        }
        else {
          close();
        }
      },

      hasLostConnectivity = function hasLostConnectivity () {
        if (!lastMessageTimestamp) return false;

        return (OT.$.now() - lastMessageTimestamp) >= WEB_SOCKET_CONNECTIVITY_TIMEOUT;
      },

      sendKeepAlive = function sendKeepAlive () {
        if (!this.is('connected')) return;

        if ( hasLostConnectivity() ) {
          webSocketDisconnected({code: 4001});
        }
        else  {
          webSocket.send(OT.Rumor.Message.Ping().serialize());
          keepAliveTimer = setTimeout(sendKeepAlive.bind(this), WEB_SOCKET_KEEP_ALIVE_INTERVAL);
        }
      }.bind(this);


  //// Private Event Handlers
  var webSocketConnected = function webSocketConnected () {
        if (connectTimeout) clearTimeout(connectTimeout);

        // Connect to Rumor by registering our connection id and the
        // app server address to notify if we disconnect.
        //
        // We don't need to wait for a reply to this message.
        webSocket.send(OT.Rumor.Message.Connect(id, notifyDisconnectAddress).serialize());

        setState('connected');
        if (connectCallback) {
          connectCallback(null, id);
          connectCallback = null;
        }

        if (onOpen) onOpen(id);

        setTimeout(function() {
          lastMessageTimestamp = OT.$.now();
          sendKeepAlive();
        }, WEB_SOCKET_KEEP_ALIVE_INTERVAL);
      },

      webSocketConnectTimedOut = function webSocketConnectTimedOut () {
        error("Timed out while waiting for the Rumor socket to connect.");
      },

      webSocketError = function webSocketError (errorEvent) {
        var errorMessage = "Unknown Socket Error";      // @fixme We MUST be able to do better than this!

        // All errors seem to result in disconnecting the socket, the close event
        // has a close reason and code which gives some error context. This,
        // combined with the fact that the errorEvent argument contains no
        // error info at all, means we'll delay triggering the error handlers
        // until the socket is closed.
        // error(errorMessage);
      },

      webSocketDisconnected = function webSocketDisconnected (closeEvent) {
        if (connectTimeout) clearTimeout(connectTimeout);
        if (keepAliveTimer) clearTimeout(keepAliveTimer);

        if (closeEvent.code !== 1000 && closeEvent.code !== 1001) {
          var reason = closeEvent.reason || closeEvent.message;
          if (!reason && wsCloseErrorCodes.hasOwnProperty(closeEvent.code)) reason = wsCloseErrorCodes[closeEvent.code];

          error("Rumor Socket Disconnected: " + reason);
        }

        if (this.isNot('error')) setState('disconnected');
      }.bind(this),

      webSocketReceivedMessage = function webSocketReceivedMessage (message) {
        lastMessageTimestamp = OT.$.now();

        if (onMessage) {
          var msg = OT.Rumor.Message.deserialize(message.data);

          if (msg.type !== OT.Rumor.MessageType.PONG) {
            onMessage(msg.toAddress, msg.data);
          }
        }
      };


  //// Public API

  this.publish = function (topics, message) {
    webSocket.send(OT.Rumor.Message.Publish(topics, message).serialize());
  };

  this.subscribe = function(topics) {
    webSocket.send(OT.Rumor.Message.Subscribe(topics).serialize());
  };

  this.unsubscribe = function(topics) {
    webSocket.send(OT.Rumor.Message.Unsubscribe(topics).serialize());
  };

  this.connect = function (connectionId, complete) {
    if (this.is('connecting', 'connected')) {
      complete(new OT.Rumor.SocketError(null, "Rumor.Socket cannot connect when it is already connecting or connected."));
      return;
    }

    id = connectionId;
    connectCallback = complete;

    try {
      setState('connecting');

      webSocket = new (NativeSocket || WebSocket)(server);
      webSocket.binaryType = 'arraybuffer';

      webSocket.onopen = webSocketConnected;
      webSocket.onclose = webSocketDisconnected;
      webSocket.onerror = webSocketError;
      webSocket.onmessage = webSocketReceivedMessage;

      connectTimeout = setTimeout(webSocketConnectTimedOut, OT.Rumor.Socket.CONNECT_TIMEOUT);
    }
    catch(e) {
      OT.error(e);

      // @todo add an actual error message
      error("Could not connect to the Rumor socket, possibly because of a blocked port.")
    }
  };

  this.disconnect = function() {
    if (connectTimeout) clearTimeout(connectTimeout);
    if (keepAliveTimer) clearTimeout(keepAliveTimer);

    if (!webSocket) {
      if (this.isNot('error')) setState('disconnected');
      return;
    }

    if (webSocket.readyState === 3/* CLOSED */) {
      if (this.isNot('error')) setState('disconnected');
    }
    else {
      if (this.is('connected')) {
        // Look! We are nice to the rumor server ;-)
        webSocket.send(OT.Rumor.Message.Disconnect().serialize());
      }

      // Wait until the socket is ready to close
      disconnectWhenSendBufferIsDrained();
    }
  };



  Object.defineProperties(this, {
    id: {
      get: function() { return id; }
    },

    onOpen: {
      set: function(callback) {
        validateCallback('onOpen', callback);
        onOpen = callback;
      },

      get: function() { return onOpen; }
    },

    onError: {
      set: function(callback) {
        validateCallback('onError', callback);
        onError = callback;
      },

      get: function() { return onError; }
    },

    onClose: {
      set: function(callback) {
        validateCallback('onClose', callback);
        onClose = callback;
      },

      get: function() { return onClose; }
    },

    onMessage: {
      set: function(callback) {
        validateCallback('onMessage', callback);
        onMessage = callback;
      },

      get: function() { return onMessage; }
    }
  });
};

// The number of ms to wait for the websocket to connect
OT.Rumor.Socket.CONNECT_TIMEOUT = 15000;

}(this));
(function(global) {

//
//
// @references
// * https://tbwiki.tokbox.com/index.php/Rumor_Message_Packet
// * https://tbwiki.tokbox.com/index.php/Rumor_Protocol
//
OT.Rumor.Message = function (type, toAddress, headers, data) {
  this.type = type;
  this.toAddress = toAddress;
  this.headers = headers;
  this.data = data;
};


OT.Rumor.Message.prototype.serialize = function () {
  var bitStream = '',
      str = "",
      offset = 8,
      cBuf = 7,
      address = new Array(this.toAddress.length),
      headerKey = new Array(this.headers.length),
      headerVal = new Array(this.headers.length),
      dataView;

  // The number of addresses
  cBuf++;

  // Write out the address.
  for (var i = 0; i < this.toAddress.length; i++) {
    address[i] = new TextEncoder('utf-8').encode(this.toAddress[i]);
    cBuf += 2;
    cBuf += address[i].length;
  }

  // The number of parameters
  cBuf++;

  // Write out the params
  for (var i = 0; i < this.headers.length; i++) {
    headerKey[i] = new TextEncoder('utf-8').encode(this.headers[i].key);
    headerVal[i] = new TextEncoder('utf-8').encode(this.headers[i].val);
    cBuf += 4;
    cBuf += headerKey[i].length;
    cBuf += headerVal[i].length;
  }

  dataView = new TextEncoder('utf-8').encode(this.data);
  cBuf += dataView.length;

  // Let's allocate a binary blob of this size
  var buffer = new ArrayBuffer(cBuf);
  var uint8View = new Uint8Array(buffer, 0, cBuf);

  // We don't include the header in the lenght.
  cBuf -= 4;

  // Write out size (in network order)
  uint8View[0] = (cBuf & 0xFF000000) >>> 24;
  uint8View[1] = (cBuf & 0x00FF0000) >>> 16;
  uint8View[2] = (cBuf & 0x0000FF00) >>>  8;
  uint8View[3] = (cBuf & 0x000000FF) >>>  0;

  // Write out reserved bytes
  uint8View[4] = 0;
  uint8View[5] = 0;

  // Write out message type
  uint8View[6] = this.type;
  uint8View[7] = this.toAddress.length;

  // Now just copy over the encoded values..
  for (var i = 0; i < address.length; i++) {
    strArray = address[i];
    uint8View[offset++] = strArray.length >> 8 & 0xFF;
    uint8View[offset++] = strArray.length >> 0 & 0xFF;
    for (var j = 0; j < strArray.length; j++) {
      uint8View[offset++] = strArray[j];
    }
  }

  uint8View[offset++] = headerKey.length;

  // Write out the params
  for (var i = 0; i < headerKey.length; i++) {
    strArray = headerKey[i];
    uint8View[offset++] = strArray.length >> 8 & 0xFF;
    uint8View[offset++] = strArray.length >> 0 & 0xFF;
    for (var j = 0; j < strArray.length; j++) {
      uint8View[offset++] = strArray[j];
    }

    strArray = headerVal[i];
    uint8View[offset++] = strArray.length >> 8 & 0xFF;
    uint8View[offset++] = strArray.length >> 0 & 0xFF;
    for (var j = 0; j < strArray.length; j++) {
      uint8View[offset++] = strArray[j];
    }
  }

  // And finally the data
  for (var i = 0; i < dataView.length; i++) {
    uint8View[offset++] = dataView[i];
  }

  return buffer;
};

OT.Rumor.Message.deserialize = function (buffer) {
  var cBuf = 0;
  var type;
  var offset = 8;
  var uint8View = new Uint8Array(buffer);

  // Write out size (in network order)
  cBuf += uint8View[0] << 24;
  cBuf += uint8View[1] << 16;
  cBuf += uint8View[2] <<  8;
  cBuf += uint8View[3] <<  0;

  type = uint8View[6];
  var address = [];

  for (var i = 0; i < uint8View[7]; i++) {
    length = uint8View[offset++] << 8;
    length += uint8View[offset++];
    var strView = new Uint8Array(buffer, offset, length);
    address[i] = new TextDecoder('utf-8').decode(strView);
    offset += length;
  }

  var headerlen = uint8View[offset++];
  var headers = [];

  for (var i = 0; i < headerlen; i++) {
    length = uint8View[offset++] << 8;
    length += uint8View[offset++];
    var strView = new Uint8Array(buffer, offset, length);
    var keyStr = new TextDecoder('utf-8').decode(strView);
    offset += length;

    length = uint8View[offset++] << 8;
    length += uint8View[offset++];
    strView = new Uint8Array(buffer, offset, length);
    var valStr = new TextDecoder('utf-8').decode(strView);
    headers[i] =  { key : keyStr, val : valStr };
    offset += length;
  }

  var dataView = new Uint8Array(buffer, offset);
  var data = new TextDecoder('utf-8').decode(dataView);

 return new OT.Rumor.Message(type, address, headers, data);
};


OT.Rumor.Message.Connect = function (uniqueId, notifyDisconnectAddress) {
  var headers = [
    {key: 'uniqueId', val: uniqueId},
    {key: 'notifyDisconnectAddress', val: notifyDisconnectAddress}
  ];

  return new OT.Rumor.Message(OT.Rumor.MessageType.CONNECT, [], headers, "");
};

OT.Rumor.Message.Disconnect = function () {
  return new OT.Rumor.Message(OT.Rumor.MessageType.DISCONNECT, [], [], "");
};

OT.Rumor.Message.Subscribe = function(topics) {
  return new OT.Rumor.Message(OT.Rumor.MessageType.SUBSCRIBE, topics, [], "");
};

OT.Rumor.Message.Unsubscribe = function(topics) {
  return new OT.Rumor.Message(OT.Rumor.MessageType.UNSUBSCRIBE, topics, [], "");
};

OT.Rumor.Message.Publish = function(topics, message, headers) {
  return new OT.Rumor.Message(OT.Rumor.MessageType.MESSAGE, topics, [], message);
};

// This message is used to implement keepalives on the persistent
// socket connection between the client and server. Every time the
// client sends a PING to the server, the server will respond with
// a PONG.
OT.Rumor.Message.Ping = function() {
  return new OT.Rumor.Message(OT.Rumor.MessageType.PING, [], [], "");
};

}(this));
(function(global) {

// Rumor Messaging for JS
//
// https://tbwiki.tokbox.com/index.php/Raptor_Messages_(Sent_as_a_RumorMessage_payload_in_JSON)
//
// @todo Raptor {
//     Look at disconnection cleanup: i.e. subscriber + publisher cleanup
//     Add error codes for all the error cases
//     Write unit tests for SessionInfo
//     Write unit tests for Session
//     Make use of the new DestroyedEvent
//     Move Analytics out of Raptor into Session
//     Remove dependency on OT.properties
//     OT.Capabilities must be part of the Raptor namespace
//     Add Dependability commands
//     Think about noConflict, or whether we should just use the OT namespace
//     Think about how to expose OT.publishers, OT.subscribers, and OT.sessions if messaging was
//        being included as a component
//     Another solution to the problem of having publishers/subscribers/etc would be to make
//        Raptor Socket a separate component from Dispatch (dispatch being more business logic)
//     Look at the coupling of OT.sessions to OT.Raptor.Socket
// }
//
// @todo Raptor Docs {
//   Document payload formats for incoming messages (what are the payloads for STREAM CREATED/MODIFIED for example)
//   Document how keepalives work
//   Document all the Raptor actions and types
//   Document the session connect flow (including error cases)
// }


OT.Raptor = {
  Actions: {
    //General
    CONNECT: 100,
    CREATE: 101,
    UPDATE: 102,
    DELETE: 103,
    STATE: 104,

    //Moderation
    FORCE_DISCONNECT: 105,
    FORCE_UNPUBLISH: 106,
    SIGNAL: 107,

    //Archives
    CREATE_ARCHIVE: 108,
    CLOSE_ARCHIVE: 109,
    START_RECORDING_SESSION: 110,
    STOP_RECORDING_SESSION: 111,
    START_RECORDING_STREAM: 112,
    STOP_RECORDING_STREAM: 113,
    LOAD_ARCHIVE: 114,
    START_PLAYBACK: 115,
    STOP_PLAYBACK: 116,

    //AppState
    APPSTATE_PUT: 117,
    APPSTATE_DELETE: 118,

    // JSEP
    OFFER: 119,
    ANSWER: 120,
    PRANSWER: 121,
    CANDIDATE: 122,
    SUBSCRIBE: 123,
    UNSUBSCRIBE: 124,
    QUERY: 125,
    SDP_ANSWER: 126,

    //KeepAlive
    PONG: 127,
    REGISTER: 128, //Used for registering streams.

    QUALITY_CHANGED: 129
  },

  Types: {
      //RPC
      RPC_REQUEST: 100,
      RPC_RESPONSE: 101,

      //EVENT
      STREAM: 102,
      ARCHIVE: 103,
      CONNECTION: 104,
      APPSTATE: 105,
      CONNECTIONCOUNT: 106,
      MODERATION: 107,
      SIGNAL: 108,
      SUBSCRIBER: 110,

      //JSEP Protocol
      JSEP: 109
  }
};


}(this));
(function(global) {

//// Some helper functions that are used for debugging and logging

var typeToName = {},
    actionToName = {};

// Create a lookup table of Raptor message types (integer) to a human readable strings
var messageTypes = OT.Raptor.Types;
for (var name in messageTypes) {
  typeToName[messageTypes[name]] = name;
}

// Create a lookup table of  Raptor message actions (integer) to a human readable strings
var messageActions = OT.Raptor.Actions;
for (var name in messageActions) {
  actionToName[messageActions[name]] = name;
}


OT.Raptor.serializeMessage = function (message) {
    return JSON.stringify(message);
};


// Deserialising a Raptor message mainly means doing a JSON.parse on it.
// We do decorate the final message with a few extra helper properies though.
//
// These include:
// * typeName: A human readable version of the Raptor type. E.g. STREAM instead of 102
// * actionName: A human readable version of the Raptor action. E.g. CREATE instead of 101
// * signature: typeName and actionName combined. This is mainly for debugging. E.g. A type
//    of 102 and an action of 101 would result in a signature of "STREAM:CREATE"
//
OT.Raptor.deserializeMessage = function (msg) {
  var message = JSON.parse(msg);

  if (message.type) {
    message.type = parseInt(message.type, 10);
    message.typeName = typeToName[message.type] || null;
  }

  if (message.action) {
    message.action = parseInt(message.action, 10);
    message.actionName = actionToName[message.action] || null;
  }

  message.signature = message.typeName + ':' + message.actionName;

  return message;
};


OT.Raptor.Message = {};
OT.Raptor.Message.connect = function (widgetId, connectionId, sessionId, apiKey, token, p2pEnabled) {
  var payload = {
        credentials: {
          connectionId: connectionId,
          soAccessState: 2,
          supportsWebRTC: true,
          p2pEnabled: p2pEnabled,
          GUID: widgetId,
          widgetId: widgetId,
          partnerId: apiKey
        },
        sessionId: sessionId,
        params: {
            tokenPermissions: {
                apiKey: apiKey
            },
            token: token
        },
        uniqueId: connectionId
      };

  return OT.Raptor.serializeMessage({
    id: OT.$.uuid(),
    type: OT.Raptor.Types.RPC_REQUEST,
    action: OT.Raptor.Actions.CONNECT,
    payload: payload,
    replyTo: connectionId
  });
};


OT.Raptor.Message.getSessionState = function (connectionId, sessionId, connectionsRequired) {
  return OT.Raptor.serializeMessage({
    id: OT.$.uuid(),
    type: OT.Raptor.Types.RPC_REQUEST,
    action: OT.Raptor.Actions.STATE,
    payload: {
      sessionId: sessionId,
      connectionsRequired: connectionsRequired || true
    },
    replyTo: connectionId
  });
};


OT.Raptor.Message.forceDisconnect = function (fromConnectionId, connectionIdToDisconnect, sessionId) {
  return OT.Raptor.serializeMessage({
    id: fromConnectionId,
    type: OT.Raptor.Types.RPC_REQUEST,
    action: OT.Raptor.Actions.FORCE_DISCONNECT,
    payload: {
      connectionId: connectionIdToDisconnect,
      sessionId: sessionId
    },
    replyTo: fromConnectionId
  });
};



OT.Raptor.Message.streamCreate = function (connectionId, sessionId, publisherId, name, videoOrientation, videoWidth, videoHeight, hasAudio, hasVideo, p2pEnabled) {
  var payload = {
    key: sessionId,
    value: {
      p2pEnabled: p2pEnabled || false,
      publisherId: publisherId,
      connection: {
          connectionId: connectionId
      },
      type: "WebRTC",
      name: name || '',
      creationTime: Date.now(),   // Unix timestamp, time in milliseconds since 1970 UTC
      orientation: {
          width: videoWidth,
          height: videoHeight,
          videoOrientation: videoOrientation || "OTVideoOrientationRotatedNormal"
      },
      hasAudio: hasAudio !== void 0 ? hasAudio : true,
      hasVideo: hasVideo !== void 0 ? hasVideo : true
    }
  };

  return OT.Raptor.serializeMessage({
    id: connectionId, // HACK until buf fixed in symphony
    type: OT.Raptor.Types.STREAM,
    action: OT.Raptor.Actions.CREATE,
    payload: payload,
    replyTo: ''
  });
};


OT.Raptor.Message.streamDestroy = function (connectionId, sessionId, streamId) {
  return OT.Raptor.serializeMessage({
    id: connectionId,
    type: OT.Raptor.Types.STREAM,
    action: OT.Raptor.Actions.DELETE,
    payload: {
      key: sessionId + "/STREAMS/" + streamId
    },
    replyTo: connectionId
  });
};


OT.Raptor.Message.streamModify = function (connectionId, sessionId, streamId, key, value) {
  return OT.Raptor.serializeMessage({
    id: connectionId,
    type: OT.Raptor.Types.STREAM,
    action: OT.Raptor.Actions.UPDATE,
    payload: {
      key: [sessionId, 'STREAMS', streamId, key].join('/'),
      value: value
    },
    replyTo: connectionId
  });
};

OT.Raptor.Message.forceUnpublish = function (fromConnectionId, sessionId, streamIdToUnpublish) {
  return OT.Raptor.serializeMessage({
    id: fromConnectionId,
    type: OT.Raptor.Types.RPC_REQUEST,
    action: OT.Raptor.Actions.FORCE_UNPUBLISH,
    payload: {
      sessionId: sessionId,
      connectionId: fromConnectionId,
      streamId: streamIdToUnpublish,
      webRTCStream: true
    },
    replyTo: fromConnectionId
  });
};


OT.Raptor.Message.jsepOffer = function (fromConnectionId, toConnectionId, streamId, sdp) {
  return OT.Raptor.serializeMessage({
    id: fromConnectionId,
    type: OT.Raptor.Types.JSEP,
    action: OT.Raptor.Actions.OFFER,
    payload: {
      fromAddress: fromConnectionId,
      toAddresses: toConnectionId,
      sdp: sdp,
      streamId: streamId
    },
    replyTo: fromConnectionId
  });
};


OT.Raptor.Message.jsepAnswer = function (fromConnectionId, toConnectionId, streamId, sdp) {
  return OT.Raptor.serializeMessage({
    id: fromConnectionId,
    type: OT.Raptor.Types.JSEP,
    action: OT.Raptor.Actions.ANSWER,
    payload: {
      fromAddress: fromConnectionId,
      toAddresses: toConnectionId,
      sdp: sdp,
      streamId: streamId
    },
    replyTo: fromConnectionId
  });
};

OT.Raptor.Message.jsepSubscribe = function (fromConnectionId, toConnectionId, streamId, subscribeToVideo, subscribeToAudio) {
  return OT.Raptor.serializeMessage({
    id: fromConnectionId,
    type: OT.Raptor.Types.JSEP,
    action: OT.Raptor.Actions.SUBSCRIBE,
    payload: {
      keyManagemenMethod: OT.$.supportedCryptoScheme(),
      bundleSupport: OT.$.supportsBundle(),
      rtcpMuxSupport: OT.$.supportsRtcpMux(),
      fromAddress: fromConnectionId,
      toAddresses: toConnectionId,
      streamId: streamId,
      hasVideo: subscribeToVideo,
      hasAudio: subscribeToAudio
    },
    replyTo: fromConnectionId
  });
};



OT.Raptor.Message.jsepUnsubscribe = function (fromConnectionId, toConnectionId, streamId) {
  return OT.Raptor.serializeMessage({
    id: fromConnectionId,
    type: OT.Raptor.Types.JSEP,
    action: OT.Raptor.Actions.UNSUBSCRIBE,
    payload: {
      fromAddress: fromConnectionId,
      toAddresses: toConnectionId,
      streamId: streamId
    },
    replyTo: fromConnectionId
  });
};

OT.Raptor.Message.jsepCandidate = function (fromConnectionId, toConnectionId, streamId, candidate) {
  return OT.Raptor.serializeMessage({
    id: fromConnectionId,
    type: OT.Raptor.Types.JSEP,
    action: OT.Raptor.Actions.CANDIDATE,
    payload: {
      fromAddress: fromConnectionId,
      toAddresses: toConnectionId,
      candidate: candidate,
      streamId: streamId
    },
    replyTo: fromConnectionId
  });
};

OT.Raptor.Message.subscriberModify = function (connectionId, sessionId, streamId, subscriberId, key, value) {
  return OT.Raptor.serializeMessage({
    id: OT.$.uuid(),
    type: OT.Raptor.Types.SUBSCRIBER,
    action: OT.Raptor.Actions.UPDATE,
    payload: {
      key: [sessionId, 'SUBSCRIBER', streamId, connectionId, key].join('/'),
      value: value
    },
    replyTo: connectionId
  });
};


OT.Raptor.Message.signal = function(connectionId, sessionId, type, to, data) {
  var payload = {
    id: OT.$.uuid(),
    fromAddress: connectionId
  };

  // Massage the to field into an array and default it to the session id
  // if we're sending to no one
  if (to && !Array.isArray(to)) {
    payload.toAddresses = [to];
  }
  else if (!to || to.length === 0) {
    // if it was omitted then we'll send the signal to the entire session.
    payload.toAddresses = [sessionId];
  }
  else {
    payload.toAddresses = to;
  }

  if (type !== void 0) payload.type = type;
  if (data !== void 0) payload.data = data;

  return OT.Raptor.serializeMessage({
    id: connectionId,
    type: OT.Raptor.Types.SIGNAL,
    action: OT.Raptor.Actions.SIGNAL,
    payload: payload,
    replyTo: connectionId
  });
};

}(this));
(function(global) {

var MAX_SIGNAL_DATA_LENGTH = 8192;
var MAX_SIGNAL_TYPE_LENGTH = 128;

//
// Error Codes:
// 413 - Type too long
// 400 - Type is invalid
// 413 - Data too long
// 400 - Data is invalid (can't be parsed as JSON)
// 429 - Rate limit exceeded
// 500 - Websocket connection is down
// 404 - To connection does not exist
// 400 - To is invalid
//
OT.Signal = function(sessionId, fromConnectionId, options) {
  var isInvalidType = function(type) {
      // Our format matches the unreserved characters from the URI RFC: http://www.ietf.org/rfc/rfc3986
      return !/^[a-zA-Z0-9\-\._~]+$/.exec(type);
    },

    validateTo = function(toAddress) {
      if (!toAddress) {
        return {code: 400, reason: "The signal type was null or an empty String. Either set it to a non-empty String value or omit it"};
      }
      else if ( !Array.isArray(toAddress) ) {
        return {code: 400, reason: "The To field was invalid"};
      }

      for (var i=0; i<toAddress.length; i++) {
        if ( !(toAddress[i] instanceof OT.Connection || toAddress[i] instanceof OT.Session) ) {
          return {code: 400, reason: "The To field was invalid"};
        }
      }

      return null;
    },

    validateType = function(type) {
      var error = null;

      if (type === null || type === void 0) {
        error = {code: 400, reason: "The signal type was null or undefined. Either set it to a String value or omit it"};
      }
      else if (type.length > MAX_SIGNAL_TYPE_LENGTH) {
        error = {code: 413, reason: "The signal type was too long, the maximum length of it is " + MAX_SIGNAL_TYPE_LENGTH + " characters"};
      }
      else if ( isInvalidType(type) ) {
        error = {code: 400, reason: "The signal type was invalid, it can only contain letters, numbers, '-', '_', and '~'."};
      }

      return error;
    },

    validateData = function(data) {
      var error = null;
      if (data === null || data === void 0) {
        error = {code: 400, reason: "The signal data was null or undefined. Either set it to a String value or omit it"};
      }
      else {
        try {
          if (JSON.stringify(data).length > MAX_SIGNAL_DATA_LENGTH) {
            error = {code: 413, reason: "The data field was too long, the maximum size of it is " + MAX_SIGNAL_DATA_LENGTH + " characters"};
          }
        }
        catch(e) {
          error = {code: 400, reason: "The data field was not valid JSON"};
        }
      }

      return error;
    };


  this.toRaptorMessage = function() {
    var to;

    if (this.to) {
      to = this.to.map(function(thing) {
        return typeof(thing) === 'string' ? thing : thing.id;
      });
    }

    return OT.Raptor.Message.signal(fromConnectionId, sessionId, this.type, to, this.data);
  };

  this.toHash = function() {
    var h = OT.$.clone(options);
    if (h.to === void 0) h.to = null;
    if (h.data === void 0) h.data = null;

    return h;
  };


  this.error = null;

  if (options) {
    if (options.hasOwnProperty('data')) {
      this.data = OT.$.clone(options.data);
      this.error = validateData(this.data);
    }

    if (options.hasOwnProperty('to')) {
      if (!Array.isArray(options.to)) {
        this.to = [options.to];
      }
      else {
        this.to = OT.$.clone(options.to);
      }

      if (!this.error) this.error = validateTo(this.to)
    }

    if (options.hasOwnProperty('type')) {
      if (!this.error) this.error = validateType(options.type)
      this.type = options.type;
    }
  }

  this.valid = this.error === null;
};

}(this));
(function(global) {


function SignalError(code, reason, signal) {
    this.code = code;
    this.reason = reason;
    this.signal = signal;
}

// The Dispatcher bit is purely to make testing simpler, it defaults to OT.Raptor.Dispatcher
// so in normal operation you would omit it. Note: it takes a constructor, not an instance.
OT.Raptor.Socket = function(widgetId, messagingServer, Dispatcher) {
  var _socketUrl = OT.properties.messagingProtocol + "://" + messagingServer + ":" + OT.properties.messagingPort + "/rumorwebsocketsv2",
      _symphony = "symphony." + messagingServer,
      _sessionId,
      _rumor,
      _dispatcher,
      _completion,
      _capabilities = new OT.Capabilities([]),
      _analytics = new OT.Analytics();


  //// Private API
  var setState = OT.$.statable(this, ['disconnected', 'connecting', 'connected', 'error', 'disconnecting'], 'disconnected'),

      logAnalyticsEvent = function logAnalyticsEvent (variation, payloadType, payload, options) {
        var event = {
          action: 'Connect',
          variation: variation,
          payload_type: payloadType,
          payload: payload,
          session_id: _sessionId,
          partner_id: OT.APIKEY,
          widget_id: widgetId,
          widget_type: 'Controller'
        };

        if (options) event = OT.$.extend(options, event);
        _analytics.logEvent(event);
      },

      onConnectComplete = function onConnectComplete (error, sessionState, prefix) {
        if (error) {
          logAnalyticsEvent('Failure', "reason|webSocketServerUrl", prefix + error.code + ':' + error.message + '|' + _socketUrl);

          setState('error');
        }
        else {
          logAnalyticsEvent('Success', "webSocketServerUrl", _socketUrl, {connectionId: _rumor.id});

          setState('connected');
          _capabilities = new OT.Capabilities(sessionState.permissions);
        }

        _completion.apply(null, arguments);
      },

      onClose = function onClose (err) {
        var session = OT.sessions.get(_sessionId),
            connection = session.connection,
            reason = this.is('disconnecting') ? "clientDisconnected" : "networkDisconnected";

        if(err && err.code == 4001) {
          reason = "networkTimedout";
        }

        setState('disconnected');

        if (!connection) return;

        if (connection.destroyedReason) {
          console.debug("OT.Raptor.Socket: Socket was closed but the connection had already been destroyed. Reason: " + connection.destroyedReason);
          return;
        }

        connection.destroy( reason );
      }.bind(this),

      onError = function onError () {
        // @todo what does having an error mean? Are they always fatal? Are we disconnected now?
      };


  //// Public API


  // Check whether this socket connection has permissions to perform a particular
  // action.
  this.permittedTo = function (action) {
      return _capabilities[action] === 1;
  };

  this.connect = function (token, sessionInfo, completion) {
    if (!this.is('disconnected', 'error')) {
      OT.warn("Cannot connect the Raptor Socket as it is currently connected. You should disconnect first.");
      return;
    }

    setState('connecting');
    _sessionId = sessionInfo.sessionId;
    _completion = completion;

    var connectionId = OT.$.uuid(),
        session = OT.sessions.get(_sessionId);


    var analyticsPayload = [_socketUrl, navigator.userAgent, OT.properties.version, window.externalHost ? "yes" : "no"];
    logAnalyticsEvent(
      'Attempt',
      "webSocketServerUrl|userAgent|sdkVersion|chromeFrame",
      analyticsPayload.map(function(e) { return e.replace('|', '\\|'); }).join('|')
    );

    _rumor = new OT.Rumor.Socket(_socketUrl, _symphony);
    _rumor.onClose = onClose;
    _rumor.onMessage = _dispatcher.dispatch.bind(_dispatcher);

    _rumor.connect(connectionId, function(error) {
      if (error) {
        onConnectComplete(error, null, "RumorConnection:");
        return;
      }

      // we do this here to avoid getting connect errors twice
      _rumor.onError = onError;

      OT.debug("Raptor Socket connected to " + _sessionId + " on " + messagingServer);

      _rumor.subscribe([_sessionId]);

      //connect to session
      var connectMessage = OT.Raptor.Message.connect(widgetId, _rumor.id, _sessionId, OT.APIKEY, token, sessionInfo.p2pEnabled);
      this.publish(connectMessage);
    }.bind(this));
  };


  this.disconnect = function () {
    if (this.is('disconnected')) return;

    setState('disconnecting');
    _rumor.disconnect();
  };

  // Publishs +message+ to the Symphony app server.
  this.publish = function (message) {
    if (_rumor.isNot('connected')) {
      OT.error("OT.Raptor.Socket: cannot publish until the socket is connected." + message);
      return;
    }

    OT.debug("OT.Raptor.Socket Publish: " + message);
    _rumor.publish([_symphony], message);
  };

  // Register a new stream against _sessionId
  this.createStream = function(publisherId, name, orientation, encodedWidth, encodedHeight, hasAudio, hasVideo) {
    var session = OT.sessions.get(_sessionId),
        message = OT.Raptor.Message.streamCreate( _rumor.id,
                                                  _sessionId,
                                                  publisherId,
                                                  name,
                                                  orientation,
                                                  encodedWidth,
                                                  encodedHeight,
                                                  hasAudio,
                                                  hasVideo,
                                                  session.sessionInfo.p2pEnabled );

    this.publish(message);
  };

  this.updateStream = function(streamId, key, value) {
    this.publish( OT.Raptor.Message.streamModify(_rumor.id, _sessionId, streamId, key, value) );
  };

  this.destroyStream = function(streamId) {
    this.publish( OT.Raptor.Message.streamDestroy(_rumor.id, _sessionId, streamId) );
  };

  this.modifySubscriber = function(subscriber, key, value) {
    this.publish( OT.Raptor.Message.subscriberModify(_rumor.id, _sessionId, subscriber.streamId, subscriber.widgetId, key, value) );
  };

  this.forceDisconnect = function(connectionIdToDisconnect) {
    this.publish( OT.Raptor.Message.forceDisconnect(_rumor.id, connectionIdToDisconnect, _sessionId) );
  };

  this.forceUnpublish = function(streamId) {
    this.publish( OT.Raptor.Message.forceUnpublish(_rumor.id, _sessionId, streamId) );
  };

  this.jsepSubscribe = function(toConnectionId, streamId, subscribeToVideo, subscribeToAudio) {
    this.publish( OT.Raptor.Message.jsepSubscribe(_rumor.id, toConnectionId, streamId, subscribeToVideo, subscribeToAudio) );
  };

  this.jsepUnsubscribe = function(toConnectionId, streamId) {
    this.publish( OT.Raptor.Message.jsepUnsubscribe(_rumor.id, toConnectionId, streamId) );
  };

  this.jsepCandidate = function(toConnectionId, streamId, candidate) {
    this.publish( OT.Raptor.Message.jsepCandidate(_rumor.id, toConnectionId, streamId, candidate) );
  };

  this.jsepOffer = function(toConnectionId, streamId, offerSDP) {
    this.publish( OT.Raptor.Message.jsepOffer(_rumor.id, toConnectionId, streamId, offerSDP) );
  };

  this.jsepAnswer = function(toConnectionId, streamId, answerSDP) {
    this.publish( OT.Raptor.Message.jsepAnswer(_rumor.id, toConnectionId, streamId, answerSDP) );
  };


  this.signal = function(options, completion) {
    var signal = new OT.Signal(_sessionId, _rumor.id, options || {});

    if (!signal.valid) {
      if (completion && OT.$.isFunction(completion)) {
        completion( new SignalError(signal.error.code, signal.error.reason, signal.toHash()) );
      }

      return;
    }

    this.publish( signal.toRaptorMessage() );
    if (completion && OT.$.isFunction(completion)) completion(null, signal.toHash());
  };

  OT.$.defineGetters(this, {
    id: function() { return _rumor.id; },
    capabilities: function() { return _capabilities; },
    sessionId: function() { return _sessionId; }
  });

  _dispatcher = new (Dispatcher || OT.Raptor.Dispatcher)(this, function (error, sessionState) {
    onConnectComplete.call(this, error, sessionState, "ConnectToSession:");
  });
};


}(this));
(function(global) {

// Connect error codes and reasons that Raptor can return.
var connectErrorReasons = {
  409: "This P2P session already has 2 participants.",
  410: "The session already has four participants.",
  1004: "The token passed is invalid."
};


// @todo hide these
OT.publishers = new OT.Collection('guid');          // Publishers are id'd by their guid
OT.subscribers = new OT.Collection('widgetId');     // Subscribers are id'd by their widgetId
OT.sessions = new OT.Collection();

function parseStream(dict, session) {
  var stream = new OT.Stream( dict.streamId,
                              session.connections.get(dict.connection.connectionId),
                              dict.name,
                              dict.streamData,
                              dict.type,
                              dict.creationTime,
                              dict.hasAudio,
                              dict.hasVideo,
                              dict.orientation ? dict.orientation.videoOrientation : null,
                              dict.peerId,
                              dict.quality,
                              dict.orientation ? dict.orientation.width : null,
                              dict.orientation ? dict.orientation.height : null );

  // This is a code smell, but it's necessary for now as the part of the code
  // that re-parents streams to publishers is in a different object that cannot
  // access the raw stream packet
  if (dict.publisherId) {
    stream.publisherId = dict.publisherId;
  }

  return stream;
}

function parseAndAddStreamToSession(dict, session) {
  if (session.streams.has(dict.streamId)) return;

  var stream = parseStream(dict, session);
  session.streams.add( stream );

  return stream;
}


OT.Raptor.Dispatcher = function (socket, connectionCompletion) {
  this.socket = socket;
  this.connectionCompletion = connectionCompletion;
};

OT.Raptor.Dispatcher.prototype.dispatch = function(addresses, encodedMessage) {
  var message = OT.Raptor.deserializeMessage(encodedMessage);

  if (!message.typeName) {
    OT.error("OT.Raptor.dispatch: Invalid message type (" + message.type + ")");
    return;
  }

  if (!message.actionName) {
    OT.error("OT.Raptor.dispatch: Invalid action (" + message.action + ") for " + message.typeName);
    OT.error(message);
    return;
  }

  OT.debug("OT.Raptor.dispatch " + message.signature + ": " + encodedMessage);

  switch(message.type) {
    case OT.Raptor.Types.RPC_RESPONSE:
      this.dispatchRPCResponse(message);
      break;

    case OT.Raptor.Types.CONNECTION:
      this.dispatchConnection(message);
      break;

    case OT.Raptor.Types.CONNECTIONCOUNT:
      this.dispatchConnectionCount(message);
      break;

    case OT.Raptor.Types.STREAM:
      this.dispatchStream(message);
      break;

    case OT.Raptor.Types.SUBSCRIBER:
      this.dispatchSubscriber(message);
      break;

    case OT.Raptor.Types.MODERATION:
      this.dispatchModeration(message);
      break;

    case OT.Raptor.Types.JSEP:
      this.dispatchJsep(message);
      break;

    case OT.Raptor.Types.SIGNAL:
      this.dispatchSignal(message);
      break;



    default:
      OT.warn("OT.Raptor.dispatch: Type " + message.typeName + " is not currently implemented");
  }
};


OT.Raptor.Dispatcher.prototype.dispatchRPCResponse = function (message) {
  switch (message.action) {
    case OT.Raptor.Actions.CONNECT:
      if (message.payload.connectSuccess == false) {
        var error = new OT.Error(OT.ExceptionCodes.CONNECT_REJECTED, connectErrorReasons[message.payload.reason] || "Failed to connect");
        this.connectionCompletion.call(null, error);
      }
      else {
        this.socket.publish(OT.Raptor.Message.getSessionState(this.socket.id, message.payload.sessionId, true));
      }
      break;


    case OT.Raptor.Actions.STATE:
      var state = message.payload.value,
          session = OT.sessions.get(message.payload.key),
          connection;

      state.streams = [];
      state.connections = [];
      state.archives = [];

      if (state.hasOwnProperty("CONNECTIONS")) {
        for (var id in state.CONNECTIONS) {
          var connection = OT.Connection.fromHash(state.CONNECTIONS[id]);
          state.connections.push(connection);
          session.connections.add(connection)
        }

        delete state.CONNECTIONS;
      }

      if (state.hasOwnProperty("STREAMS")) {
        for (var id in state.STREAMS) {
          state.streams.push( parseAndAddStreamToSession(state.STREAMS[id], session) );
        }

        delete state.STREAMS;
      }


      this.connectionCompletion.call(null, null, state);
      break;


    default:
      OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
  }
};


OT.Raptor.Dispatcher.prototype.dispatchConnection = function (message) {
  var session = OT.sessions.get(message.payload.value.sessionId),
      connection;

  if (!session) {
    OT.error("OT.Raptor.dispatch: Unable to determine session for " + message.payload.value.sessionId + ' on ' + message.signature + " message!");
    // @todo error
    return;
  }

  switch (message.action) {
    case OT.Raptor.Actions.CREATE:
      connection = OT.Connection.fromHash(message.payload.value);
      if (session.connection && connection.id !== session.connection.id) session.connections.add( connection );
      break;


    case OT.Raptor.Actions.DELETE:
      connection = session.connections.get(message.payload.value.connectionId);
      connection.destroy(message.payload.reason);
      break;


    default:
      OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
  }
};

OT.Raptor.Dispatcher.prototype.dispatchConnectionCount = function (message) {
  // Note: we don't use any of this in the client right now.

  // switch (message.action) {
  //   case OT.Raptor.Actions.UPDATE:
  //     connectionCount = message.payload.value;
  //     OT.debug("OT.Raptor.dispatch: Connection count: " + connectionCount);
  //     break;


  //   default:
  //     OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
  // }
};


OT.Raptor.Dispatcher.prototype.dispatchStream = function (message) {
  var key = message.payload.key.split('/'),
      sessionId = key[0],
      session,
      stream;


  if (sessionId) session = OT.sessions.get(sessionId);

  if (!session) {
    OT.error("OT.Raptor.dispatch: Unable to determine sessionId, or the session does not exist, for " + message.signature + " message!");
    // @todo error
    return;
  }

  switch (message.action) {
    case OT.Raptor.Actions.REGISTER:
      stream = parseStream(message.payload.value, session);

      // @todo refactor this later
      if (stream.publisherId) {
        var publisher = OT.publishers.get(stream.publisherId);

        if (publisher) {
          publisher._.streamRegisteredHandler(stream);
        }
        else {
          OT.warn("OT.Raptor.dispatch: Could find a publisher " + stream.publisherId + " for " + message.signature);
        }
      }
      break;


    case OT.Raptor.Actions.CREATE:
      parseAndAddStreamToSession(message.payload.value, session)
      break;


    case OT.Raptor.Actions.UPDATE:
      if (key[1]) stream = session.streams.get(key[1]);

      if (!stream) {
        OT.error("OT.Raptor.dispatch: Unable to determine streamId, or the stream does not exist, for " + message.signature + " message!");
        // @todo error
        return;
      }

      stream.update(key[2], message.payload.value);
      break;


    case OT.Raptor.Actions.DELETE:
      if (key[2]) stream = session.streams.get(key[2]);

      if (!stream) {
        OT.error("OT.Raptor.dispatch: Unable to determine streamId, or the stream does not exist, for " + message.signature + " message!");
        // @todo error
        return;
      }

      stream.destroy(message.payload.reason);
      break;


    default:
      OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
  }
};



OT.Raptor.Dispatcher.prototype.dispatchModeration = function (message) {
  // Force disconnect and unpublish are handled in CONNECTION:DELETE and STREAM:DELETE respectively.
  return;

  // var session = OT.sessions.get(this.socket.sessionId);

  // if (!session) {
  //     OT.error("OT.Raptor.dispatch: " + message.signature + " ERROR - sessionId must be provided and be valid");
  //     return;
  // }

  // switch (message.action) {
  //   case OT.Raptor.Actions.FORCE_DISCONNECT:
  //     if (!message.payload.connectionId) {
  //         OT.error("OT.Raptor.dispatch: " + message.signature + " ERROR - connectionId must be provided");
  //         return;
  //     }

  //     var connection = session.connections.get(message.payload.connectionId);
  //     connection.destroy("forceDisconnected");
  //     break;


  //   case OT.Raptor.Actions.FORCE_UNPUBLISH:
  //     if (!message.payload.streamId) {
  //         OT.error("OT.Raptor.dispatch " + message.signature + " ERROR - streamId must be provided");
  //         return;
  //     }

  //     var stream = session.streams.get(message.payload.streamId);
  //     stream.destroy("forceUnpublished");
  //     break;


  //   default:
  //     OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
  // }
};



OT.Raptor.Dispatcher.prototype.dispatchJsep = function (message) {
  var fromConnection,
      streamId = message.payload.streamId,
      actors;

  switch (message.action) {
    // Messages for Subscribers
    case OT.Raptor.Actions.OFFER:
      actors = [];
      var subscriber = OT.subscribers.find({streamId: streamId});
      if (subscriber) actors.push(subscriber);
      break;


    // Messages for Publishers
    case OT.Raptor.Actions.ANSWER:
    case OT.Raptor.Actions.PRANSWER:
    case OT.Raptor.Actions.SUBSCRIBE:
    case OT.Raptor.Actions.UNSUBSCRIBE:
      actors = OT.publishers.where({streamId: streamId});
      break;


    // Messages for Publishers and Subscribers
    case OT.Raptor.Actions.CANDIDATE:
      // send to whichever of your publisher or subscribers are subscribing/publishing that stream
      actors = OT.publishers.where({streamId: streamId}).concat(OT.subscribers.where({streamId: streamId}));
      break;


    default:
      OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
      return;
  }

  if (actors.length) {
    // This is a bit hacky. We don't have the session in the message so we iterate
    // until we find the actor that the message relates to this stream, and then
    // we grab the session from it.
    fromConnection = actors[0].session.connections.get(message.payload.fromAddress);
    if(!fromConnection && message.payload.fromAddress.match(/^symphony\./)) {
      fromConnection = new OT.Connection(message.payload.fromAddress,
          Date.now(), null, { supportsWebRTC: true });
      actors[0].session.connections.add(fromConnection);
    } else if(!fromConnection) {
      OT.warn("Messsage comes from a connection (" + message.payload.fromAddress + ") that we do not know about.");
    }
  }

  actors.forEach(function(actor) {
    actor.processMessage(message.action, fromConnection, message.payload);
  });
};


// The payload is:
//    key:    "{session_id}}/SUBSCRIBER/{stream_id}/{subscriber_id}"
//    value:  Integer                 { Value between 0 and some non-zero max ( Max not decided yet )  }*
//
// * The complete range need not be used but this provision is just so that future facing we might need to have more granularity.
//
OT.Raptor.Dispatcher.prototype.dispatchSubscriber = function (message) {
  var key = message.payload.key.split('/'),
      session = OT.sessions.get(key[0]),
      subscriber,
      stream;

  if (!session) {
    OT.error("OT.Raptor.dispatch: Unable to determine sessionId, or the session does not exist, for " + message.signature + " message!");
    // @todo error
    return;
  }

  stream = key[2] ? session.streams.get(key[2]) : null;

  if (!stream) {
    OT.error("OT.Raptor.dispatch: Unable to determine streamId, or the stream does not exist, for " + message.signature + " message!");
    // @todo error
    return;
  }

  // Find the subscriber that matches this stream, connection, and session
  subscriber = OT.subscribers.find(function(subscriber) {
                  return subscriber.streamId === stream.id
                          && subscriber.session.id === session.id
                });

  if (!subscriber) {
    OT.error("OT.Raptor.dispatch: Unable to determine subscriberId, or the subscriber does not exist, for " + message.signature + " message!");
    // @todo error
    return;
  }


  switch (message.action) {
    case OT.Raptor.Actions.QUALITY_CHANGED:
      subscriber.updateQuality(parseInt(message.payload.value, 10));
      break;


    default:
      OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
  }
};


OT.Raptor.Dispatcher.prototype.dispatchSignal = function (message) {
  if (message.action !== OT.Raptor.Actions.SIGNAL) {
    OT.warn("OT.Raptor.dispatch: " + message.signature + " is not currently implemented");
    return;
  }

  var session = OT.sessions.get(this.socket.sessionId);

  if (!session) {
      OT.error("OT.Raptor.dispatch: " + message.signature + " ERROR - sessionId must be provided and be valid");
      return;
  }

  session._.dispatchSignal( session.connections.get(message.payload.fromAddress),
                            message.payload.type,
                            message.payload.data);
};

}(this));
(function(window) {

// Helper to synchronise several startup tasks and then dispatch a unified
// 'envLoaded' event.
//
// This depends on:
// * OT
// * OT.Config
//
function EnvironmentLoader() {
    var _configReady = false,
        _domReady = false,

        isReady = function() {
            return _domReady && _configReady;
        },

        onLoaded = function() {
            if (isReady()) {
                OT.dispatchEvent(new OT.EnvLoadedEvent(OT.Event.names.ENV_LOADED));
            }
        },

        onDomReady = function() {
            _domReady = true;

            // This is making an assumption about there being only one "window"
            // that we care about.
            OT.$.on(window, "unload", function() {
                OT.publishers.destroy();
                OT.subscribers.destroy();
                OT.sessions.destroy();
            });

            // The Dynamic Config won't load until the DOM is ready
            OT.Config.load(OT.properties.configURL);

            onLoaded();
        },

        configLoaded = function() {
            _configReady = true;
            OT.Config.off('dynamicConfigChanged', configLoaded);
            OT.Config.off('dynamicConfigLoadFailed', configLoadFailed);

            onLoaded();
        },

        configLoadFailed = function() {
            configLoaded();
        };

    OT.Config.on('dynamicConfigChanged', configLoaded);
    OT.Config.on('dynamicConfigLoadFailed', configLoadFailed);
    if (document.readyState == "complete" || (document.readyState == "interactive" && document.body)) {
        onDomReady();
    } else {
        if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", onDomReady, false);
        } else if (document.attachEvent) {
            // This is so onLoad works in IE, primarily so we can show the upgrade to Chrome popup
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState == "complete") onDomReady();
            });
        }
    }

    this.onLoad = function(cb) {
        if (isReady()) {
            cb();
            return;
        }

        OT.on(OT.Event.names.ENV_LOADED, cb);
    };
}

var EnvLoader = new EnvironmentLoader();

OT.onLoad = function(cb, context) {
    if (!context) {
        EnvLoader.onLoad(cb);
    }
    else {
        EnvLoader.onLoad(
            cb.bind(context)
        );
    }
};

})(window);
(function(window) {

OT.Error = function(code, message) {
    this.code = code;
    this.message = message;
};

var errorsCodesToTitle = {
    1000: "Failed To Load",
    1004: "Authentication error",
    1005: "Invalid Session ID",
    1006: "Connect Failed",
    1007: "Connect Rejected",
    1008: "Connect Time-out",
    1009: "Security Error",
    1010: "Not Connected",
    1011: "Invalid Parameter",
    1012: "Peer-to-peer Stream Play Failed",
    1013: "Connection Failed",
    1014: "API Response Failure",
    1500: "Unable to Publish",
    1510: "Unable to Signal",
    1520: "Unable to Force Disconnect",
    1530: "Unable to Force Unpublish",
    1540: "Unable to record archive",
    1550: "Unable to play back archive",
    1560: "Unable to create archive",
    1570: "Unable to load archive",
    2000: "Internal Error",
    2001: "Embed Failed",
    3000: "Archive load exception",
    3001: "Archive create exception",
    3002: "Playback stop exception",
    3003: "Playback start exception",
    3004: "Record start exception",
    3005: "Record stop exception",
    3006: "Archive load exception",
    3007: "Session recording in progress",
    3008: "Archive recording internal failure",
    4000: "WebSocket Connection Failed",
    4001: "WebSocket Network Disconnected"
};

var analytics;

function _exceptionHandler(component, msg, errorCode, context) {
    var title = errorsCodesToTitle[errorCode],
        contextCopy = context ? OT.$.clone(context) : {};

    OT.error("TB.exception :: title: " + title + " (" + errorCode + ") msg: " + msg);

    if (!contextCopy.partnerId) contextCopy.partnerId = OT.APIKEY;

    try {
        if (!analytics) analytics = new OT.Analytics();
        analytics.logError(errorCode, 'tb.exception', title, {details:msg}, contextCopy);

        OT.dispatchEvent(
            new OT.ExceptionEvent(OT.Event.names.EXCEPTION, msg, title, errorCode, component, component)
        );
    } catch(err) {
        OT.error("TB.exception :: Failed to dispatch exception - " + err.toString());
        // Don't throw an error because this is asynchronous
        // don't do an exceptionHandler because that would be recursive
    }
}

// @todo redo this when we have time to tidy up
//
// @example
//
//  TB.handleJsException("Descriptive error message", 2000, {
//      session: session,
//      target: stream|publisher|subscriber|session|etc
//  });
//
OT.handleJsException = function(errorMsg, code, options) {
    options = options || {};

    var context,
        session = options.session;

    if (session) {
        context = {
            sessionId: session.sessionId
        };

        if (session.connected) context.connectionId = session.connection.connectionId;
        if (!options.target) options.target = session;
    }
    else if (options.sessionId) {
        context = {
            sessionId: options.sessionId
        };

        if (!options.target) options.target = null;
    }

    _exceptionHandler(options.target, errorMsg, code, context);
};


// @todo redo this when we have time to tidy up
//
// Public callback for exceptions from Flash.
//
// Called from Flash like:
//  TB.exceptionHandler('publisher_1234,1234', "Descriptive Error Message", "Error Title", 2000, contextObj)
//
OT.exceptionHandler = function(componentId, msg, errorTitle, errorCode, context) {
    var target;

    if (componentId) {
        target = OT.components[componentId];

        if (!target) {
            OT.warn("Could not find the component with component ID " + componentId);
        }
    }

    _exceptionHandler(target, msg, errorCode, context);
};

})(window);
(function(window) {

OT.ConnectionCapabilities = function(capabilitiesHash) {
    // Private helper methods
    var castCapabilities = function(capabilitiesHash) {
            capabilitiesHash.supportsWebRTC = OT.$.castToBoolean(capabilitiesHash.supportsWebRTC);

            return capabilitiesHash;
        };


    // Private data
    var _caps = castCapabilities(capabilitiesHash);


    this.supportsWebRTC = _caps.supportsWebRTC;
};

})(window);
(function(window) {

/**
 * The Connection object represents a connection to an OpenTok session.
 * The Session object has a <code>connection</code> property that is a Connection object.
 * It represents the local client's connection. (A client only has a connection once the
 * client has successfully called the <code>connect()</code> method of the {@link Session} object.)
 * The Stream object has a <code>connection</code> property that is a Connection object.
 * It represents the stream publisher's connection.
 *
 * @class Connection
 * @property {String} id The ID of this connection.
 * @property {Number} creationTime The timestamp for the creation of the connection. This value is calculated in milliseconds.
	You can convert this value to a Date object by calling <code>new Date(creationTime)</code>, where <code>creationTime</code>
	is the <code>creationTime</code> property of the Connection object.
 * @property {String} data 	A string containing metadata describing the
	connection. When you generate a user token string pass the connection data string to the
	<code>generate_token()</code> method of our
	<a href="/opentok/libraries/server/">server-side libraries</a>. You can also generate a token and define connection data on the
	<a href="https://dashboard.tokbox.com/projects">Dashboard</a> page.
 */
OT.Connection = function(id, creationTime, data, capabilitiesHash) {
    var destroyedReason;

    this.id = this.connectionId = id;
    this.creationTime = creationTime ? Number(creationTime) : null;
    this.data = data;
    this.capabilities = new OT.ConnectionCapabilities(capabilitiesHash);
    this.quality = null;

    OT.$.eventing(this);

    this.destroy = function(reason, quiet) {
        destroyedReason = reason || 'clientDisconnected';

        if (quiet !== true) {
            this.dispatchEvent(
              new OT.DestroyedEvent(
                'destroyed',      // This should be OT.Event.names.CONNECTION_DESTROYED, but
                                  // the value of that is currently shared with Session
                this,
                destroyedReason
              )
            );
        }
    }.bind(this);

    Object.defineProperties(this, {
        destroyed: {
            get: function() { return destroyedReason !== void 0; },
            enumerable: true
        },

        destroyedReason: {
            get: function() { return destroyedReason; },
            enumerable: true
        }
    });
};

OT.Connection.fromHash = function(hash) {
  return new OT.Connection(hash.connectionId,
                            hash.creationTime,
                            hash.data,
                            { supportsWebRTC: hash.supportsWebRTC } );

};

})(window);
(function(window) {

var validPropertyNames = ['hasAudio', 'hasVideo', 'quality', 'name', 'videoDimensions', 'orientation'];


/**
 * Specifies a stream. A stream is a representation of a published stream in a session. When a client calls the
 * <a href="Session.html#publish">Session.publish() method</a>, a new stream is created. Properties of the Stream
 * object provide information about the stream.
 *
 *  <p>When a stream is added to a session, the Session object dispatches a <code>streamCreatedEvent</code>.
 *  When a stream is destroyed, the Session object dispatches a <code>streamDestroyed</code> event. The
 *  StreamEvent object, which defines these event objects, has a <code>stream</code> property, which is an
 *  array of Stream object. For details and a code example, see {@link StreamEvent}.</p>
 *
 *  <p>When a connection to a session is made, the Session object dispatches a <code>sessionConnected</code>
 *  event, defined by the SessionConnectEvent object. The SessionConnectEvent object has a <code>streams</code>
 *  property, which is an array of Stream objects pertaining to the streams in the session at that time.
 *  For details and a code example, see {@link SessionConnectEvent}.</p>
 *
 * @class Stream
 * @property {Connection} connection The Connection object corresponding
 * to the connection that is publishing the stream. You can compare this to to the <code>connection</code>
 * property of the Session object to see if the stream is being published by the local web page.
 *
 * @property {Number} creationTime The timestamp for the creation
 * of the stream. This value is calculated in milliseconds. You can convert this value to a
 * Date object by calling <code>new Date(creationTime)</code>, where <code>creationTime</code> is the
 * <code>creationTime</code> property of the Stream object.
 *
 * @property {Boolean} hasAudio Whether the stream has audio. This property can change if the publisher
 * turns on or off audio (by calling <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a>).
 * When this occurs, the {@link Session} object dispatches a <code>streamPropertyChanged</code> event
 * (see {@link StreamPropertyChangedEvent}.)
 *
 * @property {Boolean} hasVideo Whether the stream has video. This property can change if the publisher
 * turns on or off video (by calling <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a>).
 * When this occurs, the {@link Session} object dispatches a <code>streamPropertyChanged</code> event
 * (see {@link StreamPropertyChangedEvent}.)
 *
 * @property {Object} videoDimensions This object has two properties: <code>width</code> and <code>height</code>. Both are
 * numbers. The <code>width</code> property is the width of the encoded stream; the <code>height</code> property is the
 * height of the encoded stream. (These are independent of the actual width of Publisher and Subscriber objects corresponding
 * to the stream.) This property can change if a stream published from an iOS device resizes, based on a change in the device
 * orientation. When this occurs, the {@link Session} object dispatches a <code>streamPropertyChanged</code> event (see
 * {@link StreamPropertyChangedEvent}.)
 *
 * @property {String} name The name of the stream. Publishers can specify a name when publishing a stream
 * (using the <code>publish()</code> method of the publisher's Session object).
 */
OT.Stream = function(id, connection, name, data, type, creationTime, hasAudio, hasVideo, orientation, peerId, quality, width, height) {
  var destroyedReason;

  this.id = this.streamId = id;
  this.connection = connection;
  this.name = name;
  this.data = data;
  this.type = type || 'basic';
  this.creationTime = creationTime ? Number(creationTime) : null;
  this.hasAudio = OT.$.castToBoolean(hasAudio, true);
  this.hasVideo = OT.$.castToBoolean(hasVideo, true);
  this.peerId = peerId;
  this.quality = quality;
  this.videoDimensions = { width: (width || 640), height: (height || 480), orientation: (orientation || OT.VideoOrientation.ROTATED_NORMAL) };

  OT.$.eventing(this);

  // Confusingly, this should not be called when you want to change
  // the stream properties. This is used by Raptor dispatch to notify
  // the stream that it's properies have been successfully updated
  //
  // @todo make this sane. Perhaps use setters for the properties that can
  // send the appropriate Raptor message. This would require that Streams
  // have access to their session.
  //
  this.update = function(key, value) {
    if (validPropertyNames.indexOf(key) === -1) {
      OT.warn('Unknown stream property "' + key + '" was modified to "' + value + '".');
      return;
    }

    var oldValue = this[key],
        newValue = value;

    switch(key) {
      case 'hasAudio':
      case 'hasVideo':
        newValue = OT.$.castToBoolean(newValue, true);
        this[key] = newValue;
        break;

      case 'quality':
      case 'name':
        this[key] = newValue;
        break;

      case 'orientation':
        this.videoDimensions = { width: newValue.width, height: newValue.height, orientation: newValue.videoOrientation };
    }

    // We map the 'orientation' key (that comes from Raptor) to 'videoDimensions' when
    // dispatching the updated event, as this is actual property that is modified on the stream
    var event = new OT.StreamUpdatedEvent(this, key, oldValue, newValue);
    this.dispatchEvent(event);
  };

  this.destroy = function(reason, quiet) {
    destroyedReason = reason || 'clientDisconnected';

    if (quiet !== true) {
        this.dispatchEvent(
          new OT.DestroyedEvent(
            'destroyed',      // This should be OT.Event.names.STREAM_DESTROYED, but
                              // the value of that is currently shared with Session
            this,
            destroyedReason
          )
        );
    }
  };

  Object.defineProperties(this, {
      destroyed: {
          get: function() { return destroyedReason !== void 0; },
          enumerable: true
      },

      destroyedReason: {
          get: function() { return destroyedReason; },
          enumerable: true
      }
  });
};


})(window);
(function(window) {

// Normalise these
var NativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription); // order is very important: "RTCSessionDescription" defined in Firefox Nighly but useless
var NativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);

// Helper function to forward Ice Candidates via +messageDelegate+
var iceCandidateForwarder = function(messageDelegate) {
    return function(event) {
        OT.debug("IceCandidateForwarder: Ice Candidate");

        if (event.candidate) {
            messageDelegate(OT.Raptor.Actions.CANDIDATE, event.candidate);
        }
        else {
            OT.debug("IceCandidateForwarder: No more ICE candidates.");
        }
    };
};


// Process incoming Ice Candidates from a remote connection (which have been
// forwarded via iceCandidateForwarder). The Ice Candidates cannot be processed
// until a PeerConnection is available. Once a PeerConnection becomes available
// the pending PeerConnections can be processed by calling processPending.
//
// @example
//
//  var iceProcessor = new IceCandidateProcessor();
//  iceProcessor.process(iceMessage1);
//  iceProcessor.process(iceMessage2);
//  iceProcessor.process(iceMessage3);
//
//  iceProcessor.peerConnection = peerConnection;
//  iceProcessor.processPending();
//
var IceCandidateProcessor = function() {
    var _pendingIceCandidates = [],
        _peerConnection = null;


    Object.defineProperty(this, 'peerConnection', {
        set: function(peerConnection) {
            _peerConnection = peerConnection;
        }
    });

    this.process = function(message) {
        var iceCandidate = new NativeRTCIceCandidate(message.candidate);

        if (_peerConnection) {
            _peerConnection.addIceCandidate(iceCandidate);
        }
        else {
            _pendingIceCandidates.push(iceCandidate);
        }
    };

    this.processPending = function() {
        while(_pendingIceCandidates.length) {
            _peerConnection.addIceCandidate(_pendingIceCandidates.shift());
        }
    };
};

// Removes all Confort Noise from +sdp+.
//
// See https://jira.tokbox.com/browse/OPENTOK-7176
//
var removeComfortNoise = function removeComfortNoise (sdp) {
    // a=rtpmap:<payload type> <encoding name>/<clock rate> [/<encoding parameters>]
    var matcher = /a=rtpmap:(\d+) CN\/\d+/i,
        payloadTypes = [],
        audioMediaLineIndex,
        sdpLines,
        match;

    // Icky code. This filter operation has two side effects in addition
    // to doing the actual filtering:
    //   1. extract all the payload types from the rtpmap CN lines
    //   2. find the index of the audio media line
    //
    sdpLines = sdp.split("\r\n").filter(function(line, index) {
        if (line.indexOf('m=audio') !== -1) audioMediaLineIndex = index;

        match = line.match(matcher);
        if (match !== null) {
            payloadTypes.push(match[1]);

            // remove this line as it contains CN
            return false;
        }

        return true;
    });

    if (payloadTypes.length && audioMediaLineIndex) {
        // Remove all CN payload types from the audio media line.
        sdpLines[audioMediaLineIndex] = sdpLines[audioMediaLineIndex].replace( new RegExp(payloadTypes.join('|'), 'ig') , '').replace(/\s+/g, ' ');
    }

    return sdpLines.join("\r\n");
};

// Attempt to completely process +offer+. This will:
// * set the offer as the remote description
// * create an answer and
// * set the new answer as the location description
//
// If there are no issues, the +success+ callback will be executed on completion.
// Errors during any step will result in the +failure+ callback being executed.
//
var offerProcessor = function(peerConnection, offer, success, failure) {
    var generateErrorCallback = function(message) {
            return function(errorReason) {
                if (failure) failure(message, errorReason);
            };
        },

        setLocalDescription = function(answer) {
            answer.sdp = removeComfortNoise(answer.sdp);

            peerConnection.setLocalDescription(
                answer,

                // Success
                function() {
                    success(answer);
                },

                // Failure
                generateErrorCallback('SetLocalDescription:Error while setting LocalDescription')
            );
        },

        createAnswer = function(onSuccess) {
            peerConnection.createAnswer(
                // Success
                setLocalDescription,

                // Failure
                generateErrorCallback('CreateAnswer:Error while setting createAnswer'),

                null, // MediaConstraints
                false // createProvisionalAnswer
            );
        };

    // Workaround for a Chrome issue. Add in the SDES crypto line into offers
    // from Firefox
    if (offer.sdp.indexOf('a=crypto') === -1) {
        var crypto_line = "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:FakeFakeFakeFakeFakeFakeFakeFakeFakeFake\\r\\n";

        // insert the fake crypto line for every M line
        offer.sdp = offer.sdp.replace(/^c=IN(.*)$/gmi, "c=IN$1\r\n"+crypto_line);
    }

    if (offer.sdp.indexOf('a=rtcp-fb') === -1) {
        var rtcp_fb_line = "a=rtcp-fb:* ccm fir\r\na=rtcp-fb:* nack ";

        // insert the fake crypto line for every M line
        offer.sdp = offer.sdp.replace(/^m=video(.*)$/gmi, "m=video$1\r\n"+rtcp_fb_line);
    }

    peerConnection.setRemoteDescription(
        offer,

        // Success
        createAnswer,

        // Failure
        generateErrorCallback('SetRemoteDescription:Error while setting RemoteDescription')
    );

};

// Attempt to completely process a subscribe message. This will:
// * create an Offer
// * set the new offer as the location description
//
// If there are no issues, the +success+ callback will be executed on completion.
// Errors during any step will result in the +failure+ callback being executed.
//
var suscribeProcessor = function(peerConnection, success, failure) {
    var constraints = {
            mandatory: {},
            optional: []
        },

        generateErrorCallback = function(message) {
            return function(errorReason) {
                if (failure) failure(message, errorReason);
            };
        },

        setLocalDescription = function(offer) {
            offer.sdp = removeComfortNoise(offer.sdp);

            peerConnection.setLocalDescription(
                offer,

                // Success
                function() {
                    success(offer);
                },

                // Failure
                generateErrorCallback('SetLocalDescription:Error while setting LocalDescription')
            );
        };


    // For interop with FireFox. Disable Data Channel in createOffer.
    if (navigator.mozGetUserMedia) {
        constraints.mandatory.MozDontOfferDataChannel = true;
    }

    peerConnection.createOffer(
        // Success
        setLocalDescription,

        // Failure
        generateErrorCallback('CreateOffer:Error while creating Offer'),

        constraints
    );
};

/**
 * Negotiates a WebRTC PeerConnection.
 *
 * Responsible for:
 * * offer-answer exchange
 * * iceCandidates
 * * notification of remote streams being added/removed
 *
 */
OT.PeerConnection = function(config) {
    var _peerConnection,
        _iceProcessor = new IceCandidateProcessor(),
        _offer,
        _answer,
        _state = 'new',
        _iceCandidatesGathered = false,
        _messageDelegates = [],
        _gettingStats,
        _createTime = OT.$.now();

    OT.$.eventing(this);

    // if ice servers doesn't exist Firefox will throw an exception. Chrome
    // interprets this as "Use my default STUN servers" whereas FF reads it
    // as "Don't use STUN at all". *Grumble*
    if (!config.iceServers) config.iceServers = [];

    // Private methods
    var delegateMessage = function(type, messagePayload) {
            if (_messageDelegates.length) {
                // We actually only ever send to the first delegate. This is because
                // each delegate actually represents a Publisher/Subscriber that
                // shares a single PeerConnection. If we sent to all delegates it
                // would result in each message being processed multiple times by
                // each PeerConnection.
                _messageDelegates[0](type, messagePayload);
            }
        }.bind(this),


        setupPeerConnection = function() {
            if (!_peerConnection) {
                try {
                    OT.debug("Creating peer connection config \"" + JSON.stringify(config) + "\".");


                    _peerConnection = OT.$.createPeerConnection(config, {
                        optional: [
                            {DtlsSrtpKeyAgreement: true}
                        ]
                    });
                } catch(e) {
                    triggerError("NewPeerConnection: " + e.message);
                    return null;
                }

                _iceProcessor.peerConnection = _peerConnection;

                _peerConnection.onicecandidate = iceCandidateForwarder(delegateMessage);
                _peerConnection.onaddstream = onRemoteStreamAdded.bind(this);
                _peerConnection.onremovestream = onRemoteStreamRemoved.bind(this);

                if (_peerConnection.onsignalingstatechange !== undefined) {
                    _peerConnection.onsignalingstatechange = routeStateChanged.bind(this);
                } else if (_peerConnection.onstatechange !== undefined) {
                    _peerConnection.onstatechange = routeStateChanged.bind(this);
                }
            }

            return _peerConnection;
        }.bind(this),

        // Clean up the Peer Connection and trigger the close event.
        // This function can be called safely multiple times, it will
        // only trigger the close event once (per PeerConnection object)
        tearDownPeerConnection = function() {
            // Our connection is dead, stop processing ICE candidates
            if (_iceProcessor) _iceProcessor.peerConnection = null;

            if (_peerConnection !== null) {
                _peerConnection = null;
                this.trigger('close');
            }
        },

        routeStateChanged = function(event) {
            var newState;

            if (typeof(event) === 'string') {
                // The newest version of the API
                newState = event;
            }
            else if (event.target && event.target.signalingState) {
                // The slightly older version
                newState = event.target.signalingState;
            }
            else {
                // At least six months old version. Positively ancient, yeah?
                newState = event.target.readyState;
            }


            OT.debug('PeerConnection.stateChange: ' + newState);
            if (newState && newState.toLowerCase() !== _state) {
                _state = newState.toLowerCase();
                OT.debug('PeerConnection.stateChange: ' + _state);

                switch(_state) {
                    case 'closed':
                        tearDownPeerConnection.call(this);

                        break;
                    case 'failed':
                      triggerError('ICEWorkflow: Ice state failed');
                      break;
                }
            }
        },

        getLocalStreams = function() {
            var streams;

            if (_peerConnection.getLocalStreams) {
                streams = _peerConnection.getLocalStreams();
            }
            else if (_peerConnection.localStreams) {
                streams = _peerConnection.localStreams;
            }
            else {
                throw new Error("Invalid Peer Connection object implements no method for retrieving local streams");
            }

            // Force streams to be an Array, rather than a "Sequence" object,
            // which is browser dependent and does not behaviour like an Array
            // in every case.
            return Array.prototype.slice.call(streams);
        },

        getRemoteStreams = function() {
            var streams;

            if (_peerConnection.getRemoteStreams) {
                streams = _peerConnection.getRemoteStreams();
            }
            else if (_peerConnection.remoteStreams) {
                streams = _peerConnection.remoteStreams;
            }
            else {
                throw new Error("Invalid Peer Connection object implements no method for retrieving remote streams");
            }

            // Force streams to be an Array, rather than a "Sequence" object,
            // which is browser dependent and does not behaviour like an Array
            // in every case.
            return Array.prototype.slice.call(streams);
        },

        generateErrorCallback = function(forMethod, message) {
            return function(errorReason) {
                triggerError.call(this, "PeerConnection." + forMethod + ": " + message + ": " + errorReason);
            }.bind(this);
        },

        /// PeerConnection signaling
        onRemoteStreamAdded = function(event) {
            this.trigger('streamAdded', event.stream);
        },

        onRemoteStreamRemoved = function(event) {
            this.trigger('streamRemoved', event.stream);
        },

        // ICE Negotiation messages


        // Relays a SDP payload (+sdp+), that is part of a message of type +messageType+
        // via the registered message delegators
        relaySDP = function(messageType, sdp) {
            delegateMessage(messageType, sdp);
        },

        // Process an offer that
        processOffer = function(message) {
            var offer = new NativeRTCSessionDescription(message.sdp),

                // Relays +answer+ Answer
                relayAnswer = function(answer) {
                    relaySDP(OT.Raptor.Actions.ANSWER, answer);
                },

                reportError = function(message, errorReason) {
                    triggerError(message + ":" + errorReason + ":PeerConnection.offerProcessor");
                };

            setupPeerConnection();

            _remoteDescriptionType = offer.type;
            _remoteDescription = offer;

            offerProcessor(
                _peerConnection,
                offer,
                relayAnswer,
                reportError
            );
        },

        processAnswer = function(message) {
            if (!message.sdp) {
                OT.error("PeerConnection.processMessage: Weird message, no SDP.");
                return;
            }

            _answer = new NativeRTCSessionDescription(message.sdp);

            _remoteDescriptionType = _answer.type;
            _remoteDescription = _answer;

            _peerConnection.setRemoteDescription(_answer, function () {
              OT.debug("setRemoteDescription succeeded");
            }, function (errReason) {
              triggerError("SetRemoteDescription:Error while setting RemoteDescription: " + errReason);
            });
            _iceProcessor.processPending();
        },

        processSubscribe = function(message) {
            OT.debug("PeerConnection.processSubscribe: Sending offer to subscriber.");

            setupPeerConnection();

            suscribeProcessor(
                _peerConnection,

                // Success: Relay Offer
                function(offer) {
                    _offer = offer;
                    relaySDP(OT.Raptor.Actions.OFFER, _offer);
                },

                // Failure
                function(message, errorReason) {
                    triggerError(message + ":" + errorReason + ": PeerConnection.suscribeProcessor");
                }
            );
        },

        triggerError = function(errorReason) {
            OT.error(errorReason);
            this.trigger('error', errorReason);
        }.bind(this);

    this.addLocalStream = function(webRTCStream) {
        setupPeerConnection();
        _peerConnection.addStream(webRTCStream);
    };

    this.disconnect = function() {
        _iceProcessor = null;

        if (_peerConnection) {
            var currentState = (_peerConnection.signalingState || _peerConnection.readyState);
            if (currentState && currentState.toLowerCase() !== 'closed') _peerConnection.close();

            // In theory, calling close on the PeerConnection should trigger a statechange
            // event with 'close'. For some reason I'm not seeing this in FF, hence we're
            // calling it manually below
            tearDownPeerConnection.call(this);
        }

        this.off();
    };

    this.processMessage = function(type, message) {
        OT.debug("PeerConnection.processMessage: Received " + type + " from " + message.fromAddress);
        OT.debug(message);

        switch(type) {
            case OT.Raptor.Actions.SUBSCRIBE:
                processSubscribe.call(this, message);
                break;

            case OT.Raptor.Actions.OFFER:
                processOffer.call(this, message);
                break;

            case OT.Raptor.Actions.ANSWER:
            // case OT.Raptor.Actions.PRANSWER:
                processAnswer.call(this, message);
                break;

            case OT.Raptor.Actions.CANDIDATE:
                _iceProcessor.process(message);
                break;

            default:
                OT.debug("PeerConnection.processMessage: Received an unexpected message of type " + type + " from " + message.fromAddress + ": " + JSON.stringify(message));
        }

        return this;
    };

    this.registerMessageDelegate = function(delegateFn) {
        return _messageDelegates.push(delegateFn);
    };

    this.unregisterMessageDelegate = function(delegateFn) {
        var index = _messageDelegates.indexOf(delegateFn);

        if ( index !== -1 ) {
            _messageDelegates.splice(index, 1);
        }
        return _messageDelegates.length;
    };

    /**
     * Retrieves the PeerConnection stats.
     *
     * TODO document what the format of the final reports that +callback+ gets is
     *
     * @ignore
     * @private
     * @memberof PeerConnection
     * @param callback {Function} this will be triggered once the stats a are ready.
     * It takes a single argument which is the stats report, which may be undefined
     * if there is presently no stats.
     */
    this.getStats = function(prevStats, callback) {
        // need to make sure that this isn't called again when in the middle of processing
        if (_gettingStats == true) {
            OT.warn("PeerConnection.getStats: Already getting the stats!");
            return;
        }

        // locking this function
        _gettingStats = true;

        // get the previous timestamp (seconds)
        var now = OT.$.now();
        var time_difference = (now - prevStats["timeStamp"]) / 1000; // how many seconds has passed

        // now update the date
        prevStats["timeStamp"] = now;

        /* this parses a result if there it contains the video bitrate */
        var parseAvgVideoBitrate = function(result) {
            var last_bytesSent = prevStats["videoBytesTransferred"] || 0;

            if (result.stat("googFrameHeightSent")) {
                prevStats["videoBytesTransferred"] = result.stat("bytesSent");
                return Math.round((prevStats["videoBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else if (result.stat("googFrameHeightReceived")) {
                prevStats["videoBytesTransferred"] = result.stat("bytesReceived");
                return Math.round((prevStats["videoBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else {
                return NaN;
            }
        };

        /* this parses a result if there it contains the audio bitrate */
        var parseAvgAudioBitrate = function(result) {
            var last_bytesSent = prevStats["audioBytesTransferred"] || 0;

            if (result.stat("audioInputLevel")) {
                prevStats["audioBytesTransferred"] = result.stat("bytesSent");
                return Math.round((prevStats["audioBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else if (result.stat("audioOutputLevel")) {
                prevStats["audioBytesTransferred"] = result.stat("bytesReceived");
                return Math.round((prevStats["audioBytesTransferred"] - last_bytesSent) * 8 / time_difference);
            } else {
                return NaN;
            }
        };

        var parsed_stats = {};
        var parseStatsReports = function(stats) {
            if (stats.result) {
                var result_list = stats.result();
                for (var result_index = 0; result_index < result_list.length; result_index++) {
                    var report = {};
                    var result = result_list[result_index];
                    if (result.stat) {

                        if(result.stat("googActiveConnection") === 'true') {
                            parsed_stats.localCandidateType = result.stat('googLocalCandidateType');
                            parsed_stats.remoteCandidateType = result.stat('googRemoteCandidateType');
                            parsed_stats.transportType = result.stat('googTransportType');
                        }

                        var avgVideoBitrate = parseAvgVideoBitrate(result);
                        if (!isNaN(avgVideoBitrate)) {
                            parsed_stats["avgVideoBitrate"] = avgVideoBitrate;
                        }

                        var avgAudioBitrate = parseAvgAudioBitrate(result);
                        if (!isNaN(avgAudioBitrate)) {
                            parsed_stats["avgAudioBitrate"] = avgAudioBitrate;
                        }
                    }
                }
            }

            _gettingStats = false;
            callback(parsed_stats);
        }
        parsed_stats["duration"] = Math.round(now - _createTime);

        var parseStats = function(stats) {
            for (var key in stats) {
                if (stats.hasOwnProperty(key) &&
                    (stats[key].type === 'outboundrtp' || stats[key].type === 'inboundrtp')) {
                    var res = stats[key];
                    // Find the bandwidth info for video
                    if (res.id.indexOf('video') !== -1) {
                        var avgVideoBitrate = parseAvgVideoBitrate(res);
                        if(!isNaN(avgVideoBitrate)) {
                            parsed_stats.avgVideoBitrate = avgVideoBitrate;
                        }

                    } else if (res.id.indexOf('audio') !== -1) {
                        var avgAudioBitrate = parseAvgAudioBitrate(res);
                        if(!isNaN(avgAudioBitrate)) {
                            parsed_stats.avgAudioBitrate = avgAudioBitrate;
                        }
                    }
                }
            }

            _gettingStats = false;
            callback(parsed_stats);
        }


        var needsNewGetStats = function() {
            var firefoxVersion = window.navigator.userAgent.toLowerCase()
            .match(/Firefox\/([0-9\.]+)/i);
            var needs = (firefoxVersion !== null && parseFloat(firefoxVersion[1], 10) >= 27.0);
            needsNewGetStats = function() { return needs; };
            return needs;
        };

        if (_peerConnection && _peerConnection.getStats) {
            if(needsNewGetStats()) {
                _peerConnection.getStats(null, parseStats, function(err) {
                    OT.warn('Error collecting stats', err);
                    _gettingStats = false;
                });
            } else {
                _peerConnection.getStats(parseStatsReports);
            }
        } else {
            // there was no peer connection yet or getStats isn't implemented in this enviroment
            _gettingStats = false;
            callback(parsed_stats);
        }
    };

    Object.defineProperty(this, 'remoteStreams', {
        get: function() {
            return _peerConnection ? getRemoteStreams() : [];
        }
    });
};

})(window);
(function(window) {

var _peerConnections = {};

OT.PeerConnections = {
    add: function(remoteConnection, stream, config) {
        var key = remoteConnection.id + "_" + stream.id,
            ref = _peerConnections[key];

        if (!ref) {
            ref = _peerConnections[key] = {
                count: 0,
                pc: new OT.PeerConnection(config)
            };
        }

        // increase the PCs ref count by 1
        ref.count += 1;

        return ref.pc;
    },

    remove: function(remoteConnection, stream) {
        var key = remoteConnection.id + "_" + stream.id,
            ref = _peerConnections[key];

        if (ref) {
            ref.count -= 1;

            if (ref.count === 0) {
                ref.pc.disconnect();
                delete _peerConnections[key];
            }
        }
    }
};


})(window);
(function(window) {

/**
 * Abstracts PeerConnection related stuff away from OT.Publisher.
 *
 * Responsible for:
 * * setting up the underlying PeerConnection (delegates to OT.PeerConnections)
 * * triggering a connected event when the Peer connection is opened
 * * triggering a disconnected event when the Peer connection is closed
 * * providing a destroy method
 * * providing a processMessage method
 *
 * Once the PeerConnection is connected and the video element playing it triggers the connected event
 *
 * Triggers the following events
 * * connected
 * * disconnected
 */
OT.PublisherPeerConnection = function(remoteConnection, session, stream, webRTCStream) {
    var _peerConnection,
        _hasRelayCandidates = false;

    // Private
    var _onPeerClosed = function() {
            this.destroy();
            this.trigger('disconnected', this);
        },

        // Note: All Peer errors are fatal right now.
        _onPeerError = function(errorReason) {
            this.trigger('error', null, errorReason, this);
            this.destroy();
        },

        _relayMessageToPeer = function(type, payload) {
            if (!_hasRelayCandidates){
                var extractCandidates = type === OT.Raptor.Actions.CANDIDATE ||
                                        type === OT.Raptor.Actions.OFFER ||
                                        type === OT.Raptor.Actions.ANSWER ||
                                        type === OT.Raptor.Actions.PRANSWER ;

                if (extractCandidates) {
                    var message = (type === OT.Raptor.Actions.CANDIDATE) ? payload.candidate : payload.sdp;
                    _hasRelayCandidates = message.indexOf('typ relay') !== -1;
                }
            }

            switch(type) {
            case OT.Raptor.Actions.ANSWER:
            case OT.Raptor.Actions.PRANSWER:
                session._.jsepAnswer(remoteConnection.id, stream, payload);
                break;

            case OT.Raptor.Actions.OFFER:
                this.trigger('connected');
                session._.jsepOffer(remoteConnection.id, stream, payload);
                break;

            case OT.Raptor.Actions.CANDIDATE:
                session._.jsepCandidate(remoteConnection.id, stream, payload);
            }
        }.bind(this);


    OT.$.eventing(this);

    // Public
    this.destroy = function() {
        // Clean up our PeerConnection
        if (_peerConnection) {
            OT.PeerConnections.remove(remoteConnection, stream);
        }

        _peerConnection.off();
        _peerConnection = null;
    };

    this.processMessage = function(type, message) {
        _peerConnection.processMessage(type, message);
    };

    this.getStats = function(prevStats, callback) {
        _peerConnection.getStats(prevStats, callback);
    }

    // Init
    this.init = function() {
        var iceServers = session.sessionInfo.iceServers.map(function(is) {
            var iceServer = OT.$.clone(is);

            if (iceServer.url.trim().substr(0, 5) === 'turn:') {
                // Make the username sessionId:connectionId:streamId for tracking purposes.
                iceServer.username = session.id + '.' + session.connection.id + '.' + stream.id;
            }

            return iceServer;
        });

        _peerConnection = OT.PeerConnections.add(remoteConnection, stream, {
            iceServers: iceServers
        });

        _peerConnection.on({
            close: _onPeerClosed,
            error: _onPeerError
        }, this);

        _peerConnection.registerMessageDelegate(_relayMessageToPeer);
        _peerConnection.addLocalStream(webRTCStream);

        Object.defineProperty(this, 'remoteConnection', {value: remoteConnection});

        Object.defineProperty(this, 'hasRelayCandidates', {
            get: function() { return _hasRelayCandidates; }
        });
    }
};

})(window);
(function(window) {

/**
 * Abstracts PeerConnection related stuff away from OT.Subscriber.
 *
 * Responsible for:
 * * setting up the underlying PeerConnection (delegates to OT.PeerConnections)
 * * triggering a connected event when the Peer connection is opened
 * * triggering a disconnected event when the Peer connection is closed
 * * creating a video element when a stream is added
 * * responding to stream removed intelligently
 * * providing a destroy method
 * * providing a processMessage method
 *
 * Once the PeerConnection is connected and the video element playing it triggers the connected event
 *
 * Triggers the following events
 * * connected
 * * disconnected
 * * remoteStreamAdded
 * * remoteStreamRemoved
 * * error
 *
 */

OT.SubscriberPeerConnection = function(remoteConnection, session, stream, properties) {
    var _peerConnection,
        _hasRelayCandidates = false;

    // Private
    var _onPeerClosed = function() {
            this.destroy();
            this.trigger('disconnected', this);
        },

        _onRemoteStreamAdded = function(remoteRTCStream) {
            this.trigger('remoteStreamAdded', remoteRTCStream, this);
        },

        _onRemoteStreamRemoved = function(remoteRTCStream) {
            this.trigger('remoteStreamRemoved', remoteRTCStream, this);
        },

        // Note: All Peer errors are fatal right now.
        _onPeerError = function(errorReason) {
            this.trigger('error', null, errorReason, this);
        },

        _relayMessageToPeer = function(type, payload) {
            if (!_hasRelayCandidates){
                var extractCandidates = type === OT.Raptor.Actions.CANDIDATE ||
                                        type === OT.Raptor.Actions.OFFER ||
                                        type === OT.Raptor.Actions.ANSWER ||
                                        type === OT.Raptor.Actions.PRANSWER ;

                if (extractCandidates) {
                    var message = (type === OT.Raptor.Actions.CANDIDATE) ? payload.candidate : payload.sdp;
                    _hasRelayCandidates = message.indexOf('typ relay') !== -1;
                }
            }

            switch(type) {
            case OT.Raptor.Actions.ANSWER:
            case OT.Raptor.Actions.PRANSWER:
                this.trigger('connected');
                session._.jsepAnswer(remoteConnection.id, stream, payload);
                break;

            case OT.Raptor.Actions.OFFER:
                session._.jsepOffer(remoteConnection.id, stream, payload);
                break;

            case OT.Raptor.Actions.CANDIDATE:
                session._.jsepCandidate(remoteConnection.id, stream, payload);
            }
        }.bind(this),

        // Helper method used by subscribeToAudio/subscribeToVideo
        _setEnabledOnStreamTracksCurry = function(isVideo) {
            var method = 'get' + (isVideo ? 'Video' : 'Audio') + 'Tracks';

            return function(enabled) {
                var remoteStreams = _peerConnection.remoteStreams,
                    tracks,
                    stream;

                if (remoteStreams.length === 0 || !remoteStreams[0][method]) {
                    // either there is no remote stream or we are in a browser that doesn't
                    // expose the media tracks (Firefox)
                    return;
                }

                for (var i=0, num=remoteStreams.length; i<num; ++i) {
                    stream = remoteStreams[i];
                    tracks = stream[method]();

                    for (var k=0, numTracks=tracks.length; k < numTracks; ++k){
                        tracks[k].enabled=enabled;
                    }
                }
            };
        };


    OT.$.eventing(this);

    // Public
    this.destroy = function() {
      if (_peerConnection) {
        var numDelegates = _peerConnection.unregisterMessageDelegate(_relayMessageToPeer);

        // Only clean up the PeerConnection if there isn't another Subscriber using it
        if (numDelegates === 0) {
          // Unsubscribe us from the stream, if it hasn't already been destroyed
          if (session && session.connected && stream && !stream.destroyed) {
              // Notify the server components
              session._.jsepUnsubscribe(stream);
          }

          // Ref: OPENTOK-2458 disable all audio tracks before removing it.
          this.subscribeToAudio(false);
        }
        OT.PeerConnections.remove(remoteConnection, stream.streamId);
      }
      _peerConnection = null;
      this.off();
    };

    this.processMessage = function(type, message) {
        _peerConnection.processMessage(type, message);
    };

    this.getStats = function(prevStats, callback) {
        _peerConnection.getStats(prevStats, callback);
    };

    this.subscribeToAudio = _setEnabledOnStreamTracksCurry(false);
    this.subscribeToVideo = _setEnabledOnStreamTracksCurry(true);

    Object.defineProperty(this, 'hasRelayCandidates', {
        get: function() { return _hasRelayCandidates; }
    });


    // Init
    this.init = function() {
        var iceServers = session.sessionInfo.iceServers.map(function(is) {
            var iceServer = OT.$.clone(is);

            if (iceServer.url.trim().substr(0, 5) === 'turn:') {
                // Make the username sessionId:connectionId:streamId for tracking purposes.
                iceServer.username = session.id + '.' + session.connection.id + '.' + stream.id;
            }

            return iceServer;
        });

        _peerConnection = OT.PeerConnections.add(remoteConnection, stream.streamId, {
            iceServers: iceServers
        });

        _peerConnection.on({
            close: _onPeerClosed,
            streamAdded: _onRemoteStreamAdded,
            streamRemoved: _onRemoteStreamRemoved,
            error: _onPeerError
        }, this);

        var numDelegates = _peerConnection.registerMessageDelegate(_relayMessageToPeer);

        // If there are already remoteStreams, add them immediately
        if (_peerConnection.remoteStreams.length > 0) {
            _peerConnection.remoteStreams.forEach(_onRemoteStreamAdded, this);
        }
        else if (numDelegates === 1) {
            // We only bother with the PeerConnection negotiation if we are the only delegate.
            session._.jsepSubscribe(stream, properties.subscribeToVideo, properties.subscribeToAudio);
        }
    };
};

})(window);
(function(window) {

// Manages N Chrome elements
OT.Chrome = function(properties) {
    var _visible = false,
        _widgets = {},

        // Private helper function
        _set = function(name, widget) {
            widget.parent = this;
            widget.appendTo(properties.parent);

            _widgets[name] = widget;

            Object.defineProperty(this, name, {
                get: function() { return _widgets[name]; }
            });
        };

    if (!properties.parent) {
        // @todo raise an exception
        return;
    }

    OT.$.eventing(this);

    this.destroy = function() {
        this.off();
        this.hide();

        for (var name in _widgets) {
            _widgets[name].destroy();
        }
    };

    this.show = function() {
        _visible = true;

        for (var name in _widgets) {
            _widgets[name].show();
        }
    };

    this.hide = function() {
        _visible = false;

        for (var name in _widgets) {
            _widgets[name].hide();
        }
    };


    // Adds the widget to the chrome and to the DOM. Also creates a accessor
    // property for it on the chrome.
    //
    // @example
    //  chrome.set('foo', new FooWidget());
    //  chrome.foo.setDisplayMode('on');
    //
    // @example
    //  chrome.set({
    //      foo: new FooWidget(),
    //      bar: new BarWidget()
    //  });
    //  chrome.foo.setDisplayMode('on');
    //
    this.set = function(widgetName, widget) {
        if (typeof(widgetName) === "string" && widget) {
            _set.call(this, widgetName, widget);
        }
        else {
          for (var name in widgetName) {
            if (widgetName.hasOwnProperty(name)) {
              _set.call(this, name, widgetName[name]);
            }
          }
        }

        return this;
    };
};

})(window);
(function(window) {

if (!OT.Chrome.Behaviour) OT.Chrome.Behaviour = {};

// A mixin to encapsulate the basic widget behaviour. This needs a better name,
// it's not actually a widget. It's actually "Behaviour that can be applied to
// an object to make it support the basic Chrome widget workflow"...but that would
// probably been too long a name.
OT.Chrome.Behaviour.Widget = function(widget, options) {
    var _options = options || {},
        _mode,
        _previousMode;

    //
    // @param [String] mode
    //      'on', 'off', or 'auto'
    //
    widget.setDisplayMode = function(mode) {
        var newMode = mode || 'auto';
        if (_mode === newMode) return;

        OT.$.removeClass(this.domElement, 'OT_mode-' + _mode);
        OT.$.addClass(this.domElement, 'OT_mode-' + newMode);

        _previousMode = _mode;
        _mode = newMode;
    };

    widget.show = function() {
        this.setDisplayMode(_previousMode);
        if (_options.onShow) _options.onShow();

        return this;
    };

    widget.hide = function() {
        this.setDisplayMode('off');
        if (_options.onHide) _options.onHide();

        return this;
    };

    widget.destroy = function() {
        if (_options.onDestroy) _options.onDestroy(this.domElement);
        if (this.domElement) OT.$.removeElement(this.domElement);

        return widget;
    };

    widget.appendTo = function(parent) {
        // create the element under parent
        this.domElement = OT.$.createElement(_options.nodeName || 'div',
                                            _options.htmlAttributes,
                                            _options.htmlContent);

        if (_options.onCreate) _options.onCreate(this.domElement);

        // if the mode isn't auto, then we can directly set it
        if (_options.mode != "auto") {
            widget.setDisplayMode(_options.mode);
        } else {
            // we set it to on at first, and then apply the desired mode
            // this will let the proper widgets nicely fade away
            widget.setDisplayMode('on');
            setTimeout(function() {
                widget.setDisplayMode(_options.mode);
            }, 2000);
        }

        // add the widget to the parent
        parent.appendChild(this.domElement);

        return widget;
    };
};

})(window);
(function(window) {

// NamePanel Chrome Widget
//
// mode (String)
// Whether to display the name. Possible values are: "auto" (the name is displayed
// when the stream is first displayed and when the user mouses over the display),
// "off" (the name is not displayed), and "on" (the name is displayed).
//
// displays a name
// can be shown/hidden
// can be destroyed
OT.Chrome.NamePanel = function(options) {
    var _name = options.name;

    if (!_name || _name.trim().length === '') {
        _name = null;

        // THere's no name, just flip the mode off
        options.mode = 'off';
    }

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'h1',
        htmlContent: _name,
        htmlAttributes: {className: 'OT_name'}
    });

    Object.defineProperty(this, 'name', {
        set: function(name) {
            if (!_name) this.setDisplayMode('auto');

            _name = name;
            _domElement.innerHTML = _name;
        }.bind(this)
    });
};

})(window);
(function(window) {

OT.Chrome.MuteButton = function(options) {
    var _onClickCb,
        _muted = options.muted || false;

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Private Event Callbacks
    var attachEvents = function(elem) {
            _onClickCb = onClick.bind(this);
            elem.addEventListener('click', _onClickCb, false);
        },

        detachEvents = function(elem) {
            _onClickCb = null;
            elem.removeEventListener('click', _onClickCb, false);
        },

        onClick = function(event) {
            _muted = !_muted;

            if (_muted) {
                OT.$.addClass(_domElement, 'OT_active');
                this.parent.trigger('muted', this);
            }
            else {
                OT.$.removeClass(_domElement, 'OT_active');
                this.parent.trigger('unmuted', this);
            }

            return false;
        };

    // Mixin common widget behaviour
    var classNames = _muted ? 'OT_mute OT_active' : 'OT_mute';
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'button',
        htmlContent: 'Mute',
        htmlAttributes: {className: classNames},
        onCreate: attachEvents.bind(this),
        onDestroy: detachEvents.bind(this)
    });
};


})(window);
(function(window) {

OT.Chrome.MicVolume = function(options) {
    var _onClickCb,
        _muted = options.muted || false;

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Private Event Callbacks
    var attachEvents = function(elem) {
            _onClickCb = onClick.bind(this);
            elem.addEventListener('click', _onClickCb, false);
        },

        detachEvents = function(elem) {
            _onClickCb = null;
            elem.removeEventListener('click', _onClickCb, false);
        },

        onClick = function(event) {
            _muted = !_muted;

            if (_muted) {
                OT.$.addClass(_domElement, 'active');
                this.parent.trigger('muted', this);
            }
            else {
                OT.$.removeClass(_domElement, 'active');
                this.parent.trigger('unmuted', this);
            }

            return false;
        };

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'button',
        htmlContent: 'Mute',
        htmlAttributes: {className: 'OT_mic-volume'},
        onCreate: attachEvents.bind(this),
        onDestroy: detachEvents.bind(this)
    });
};


})(window);
(function(window) {

OT.Chrome.SettingsPanelButton = function(options) {
    var _onClickCb;

    // Private Event Callbacks
    var attachEvents = function(elem) {
            _onClickCb = onClick.bind(this);
            elem.addEventListener('click', _onClickCb, false);
        },

        detachEvents = function(elem) {
            _onClickCb = null;
            elem.removeEventListener('click', _onClickCb, false);
        },

        onClick = function(event) {
            this.parent.trigger('SettingsPanel:open', this);
            return false;
        };


    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'button',
        htmlContent: 'Settings',
        htmlAttributes: {className: 'OT_settings-panel'},
        onCreate: attachEvents.bind(this),
        onDestroy: detachEvents.bind(this)
    });
};

})(window);
(function(window) {

OT.Chrome.SettingsPanel = function(options) {
    if (!options.stream) {
        // @todo raise error
        return;
    }

    var webRTCStream = options.stream;

    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    Object.defineProperty(this, 'domElement', {
        get: function() { return _domElement; },
        set: function(domElement) { _domElement = domElement; }
    })

    var renderDialog = function() {
            var camLabel = webRTCStream.getVideoTracks().length ? webRTCStream.getVideoTracks()[0].label : "None",
                micLabel = webRTCStream.getAudioTracks().length ? webRTCStream.getAudioTracks()[0].label : "None";

            _domElement.innerHTML = "<dl>\
                                        <dt>Cam</dt>\
                                        <dd>" + camLabel + "</dd>\
                                        <dt>Mic</dt>\
                                        <dd>" + micLabel + "</dd>\
                                    </dl>";


            var closeButton  = OT.$.createButton('Close', {
                className: 'OT_close'
            }, {
                click: onClose.bind(this)
            });

            _domElement.appendChild(closeButton);
        },

        onShow = function() {
            renderDialog.call(this);
        },

        onClose = function() {
            this.parent.trigger('SettingsPanel:close', this);
            return false;
        };


    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options.mode,
        nodeName: 'section',
        htmlContent: 'Settings',
        htmlAttributes: {className: 'OT_settings-panel'},
        onCreate: renderDialog.bind(this),
        onShow: onShow.bind(this)
    });
};

})(window);
(function(window) {

OT.Chrome.OpenTokButton = function(options) {
    // This behaviour must be implemented to make the widget behaviour work.
    // @fixme This is a nasty code smell
    var _domElement;
    this.__defineGetter__("domElement", function() { return _domElement; });
    this.__defineSetter__("domElement", function(domElement) { _domElement = domElement; });

    // Mixin common widget behaviour
    OT.Chrome.Behaviour.Widget(this, {
        mode: options ? options.mode : null,
        nodeName: 'span',
        htmlContent: 'OpenTok',
        htmlAttributes: {
            className: 'OT_opentok'
        }
    });
};

})(window);
(function(window) {
/* Stylable Notes

* RTC doesn't need to wait until anything is loaded (flash needs to wait until the Flash component loads)
* Some bits are controlled by multiple flags, i.e. buttonDisplayMode and nameDisplayMode.
* When there are multiple flags how is the final setting chosen?
* When some style bits are set updates will need to be pushed through to the Chrome
*/

// Mixes the StylableComponent behaviour into the +self+ object. It will
// also set the default styles to +initialStyles+.
//
// @note This Mixin is dependent on OT.Eventing.
//
//
// @example
//
//  function SomeObject {
//      OT.StylableComponent(this, {
//          name: 'SomeObject',
//          foo: 'bar'
//      });
//  }
//
//  var obj = new SomeObject();
//  obj.getStyle('foo');        // => 'bar'
//  obj.setStyle('foo', 'baz')
//  obj.getStyle('foo');        // => 'baz'
//  obj.getStyle();             // => {name: 'SomeObject', foo: 'baz'}
//
OT.StylableComponent = function(self, initalStyles) {
    if (!self.trigger) {
        throw new Error("OT.StylableComponent is dependent on the mixin OT.$.eventing. Ensure that this is included in the object before StylableComponent.");
    }

    // Broadcast style changes as the styleValueChanged event
    var onStyleChange = function(key, value, oldValue) {
        if (oldValue) {
            self.trigger('styleValueChanged', key, value, oldValue);
        }
        else {
            self.trigger('styleValueChanged', key, value);
        }
    };

    var _style = new Style(initalStyles, onStyleChange);

    /**
    * Returns an object that has the properties that define the current user interface controls of the Publisher.
    * You can modify the properties of this object and pass the object to the <code>setStyle()</code> method of the
    * Publisher object. (See the documentation for <a href="#setStyle">setStyle()</a> to see the styles that define
    * this object.)
    * @return {Object} The object that defines the styles of the Publisher.
    * @see <a href="#setStyle">setStyle()</a>
    * @method #getStyle
    * @memberOf Publisher
    */

	/**
	* Returns an object that has the properties that define the current user interface controls of the Subscriber.
	* You can modify the properties of this object and pass the object to the <code>setStyle()</code> method of the
	* Subscriber object. (See the documentation for <a href="#setStyle">setStyle()</a> to see the styles that define
	* this object.)
	* @return {Object} The object that defines the styles of the Subscriber.
	* @see <a href="#setStyle">setStyle()</a>
	* @method #getStyle
	* @memberOf Subscriber
	*/
    // If +key+ is falsly then all styles will be returned.
    self.getStyle = function(key) {
        return _style.get(key);
    };

    /**
    * Sets properties that define the appearance of some user interface controls of the Publisher.
    *
    * <p>You can either pass one parameter or two parameters to this method.</p>
    *
    * <p>If you pass one parameter, <code>style</code>, it is an object that has one property: <code>nameDisplayMode</code>.
    * Possible values for the <code>style.nameDisplayMode</code> property are: "auto" (the name is displayed when the stream
    * is first displayed and when the user mouses over the display), "off" (the name is not displayed), and "on"
    * (the name is displayed).
    *
    * <p>For example, the following code passes one parameter to the method:</p>
    *
    * <pre>myPublisher.setStyle({nameDisplayMode: "off"});</pre>
    *
    * <p>If you pass two parameters, <code>style</code> and <code>value</code>, they are key-value pair that
    * define one property of the display style. For example, the following code passes two parameter values
    * to the method:</p>
    *
    * <pre>myPublisher.setStyle("nameDisplayMode", "off");</pre>
    *
    * <p>You can set the initial settings when you call the <code>Session.publish()</code>
    * or <code>TB.initPublisher()</code> method. Pass a <code>style</code> property as part of the
    * <code>properties</code> parameter of the method.</p>
    *
    * <p>The TB object dispatches an <code>exception</code> event if you pass in an invalid style to the method.
    * The <code>code</code> property of the ExceptionEvent object is set to 1011.</p>
    *
    * @param {Object} style Either an object containing properties that define the style, or a String defining this
    * single style property to set.
    * @param {String} value The value to set for the <code>style</code> passed in. Pass a value for this parameter
    * only if the value of the <code>style</code> parameter is a String.</p>
    *
    * @see <a href="#getStyle">getStyle()</a>
    * @return {Publisher} The Publisher object
    * @see <a href="#setStyle">setStyle()</a>
    *
    * @see <a href="Session.html#subscribe">Session.publish()</a>
    * @see <a href="TB.html#initPublisher">TB.initPublisher()</a>
    * @method #setStyle
    * @memberOf Publisher
    */

    /**
    * Sets properties that define the appearance of some user interface controls of the Subscriber.
    *
    * <p>You can either pass one parameter or two parameters to this method.</p>
    *
    * <p>If you pass one parameter, <code>style</code>, it is an object that has one property: <code>nameDisplayMode</code>.
    * Possible values for the <code>style.nameDisplayMode</code> property are: "auto" (the name is displayed when the stream
    * is first displayed and when the user mouses over the display), "off" (the name is not displayed), and "on"
    * (the name is displayed).
    *
    * <p>For example, the following code passes one parameter to the method:</p>
    *
    * <pre>mySubscriber.setStyle({nameDisplayMode: "off"});</pre>
    *
    * <p>If you pass two parameters, <code>style</code> and <code>value</code>, they are key-value pair that
    * define one property of the display style. For example, the following code passes two parameter values
    * to the method:</p>
    *
    * <pre>mySubscriber.setStyle("nameDisplayMode", "off");</pre>
    *
    * <p>You can set the initial settings when you call the <code>Session.subscribe()</code> method.
    * Pass a <code>style</code> property as part of the <code>properties</code> parameter of the method.</p>
    *
    * <p>The TB object dispatches an <code>exception</code> event if you pass in an invalid style to the method.
    * The <code>code</code> property of the ExceptionEvent object is set to 1011.</p>
    *
    * @param {Object} style Either an object containing properties that define the style, or a String defining this
    * single style property to set.
    * @param {String} value The value to set for the <code>style</code> passed in. Pass a value for this parameter
    * only if the value of the <code>style</code> parameter is a String.</p>
    *
    * @returns {Subscriber} The Subscriber object.
    *
    * @see <a href="#getStyle">getStyle()</a>
    * @see <a href="#setStyle">setStyle()</a>
    *
    * @see <a href="Session.html#subscribe">Session.subscribe()</a>
    * @method #setStyle
    * @memberOf Subscriber
    */
    self.setStyle = function(keyOrStyleHash, value, silent) {
        if (typeof(keyOrStyleHash) !== 'string') {
            _style.setAll(keyOrStyleHash, silent);
        }
        else {
            _style.set(keyOrStyleHash, value);
        }

        return this;
    };
};

var Style = function(initalStyles, onStyleChange) {
    var _COMPONENT_STYLES = [
            "showMicButton",
            "showSpeakerButton",
            "showSettingsButton",
            "showCameraToggleButton",
            "nameDisplayMode",
            "buttonDisplayMode",
            "showSaveButton",
            "showRecordButton",
            "showRecordStopButton",
            "showReRecordButton",
            "showPauseButton",
            "showPlayButton",
            "showPlayStopButton",
            "showStopButton",
            "backgroundImageURI",
            "showControlPanel",
            "showRecordCounter",
            "showPlayCounter",
            "showControlBar",
            "showPreviewTime"
        ],

        _validStyleValues = {
            buttonDisplayMode: ["auto", "off", "on"],
            nameDisplayMode: ["auto", "off", "on"],
            showSettingsButton: [true, false],
            showMicButton: [true, false],
            showCameraToggleButton: [true, false],
            showSaveButton: [true, false],
            backgroundImageURI: null,
            showControlBar: [true, false],
            showPlayCounter: [true, false],
            showRecordCounter: [true, false],
            showPreviewTime: [true, false]
        },

        _style = {},


        // Validates the style +key+ and also whether +value+ is valid for +key+
        isValidStyle = function(key, value) {
            return key === 'backgroundImageURI' ||
                    (   _validStyleValues.hasOwnProperty(key) &&
                        _validStyleValues[key].indexOf(value) !== -1 );
        },

        castValue = function(value) {
            switch(value) {
                case 'true':
                    return true;
                case 'false':
                    return false;
                default:
                    return value;
            }
        };


    // Returns a shallow copy of the styles.
    this.getAll = function() {
        var style = OT.$.clone(_style);

        for (var i in style) {
            if (_COMPONENT_STYLES.indexOf(i) < 0) {
                // Strip unnecessary properties out, should this happen on Set?
                delete style[i];
            }
        }

        return style;
    };

    this.get = function(key) {
        if (key) {
            return _style[key];
        }

        // We haven't been asked for any specific key, just return the lot
        return this.getAll();
    };

    // *note:* this will not trigger onStyleChange if +silent+ is truthy
    this.setAll = function(newStyles, silent) {
        var oldValue, newValue;

        for (var key in newStyles) {
            newValue = castValue(newStyles[key]);

            if (isValidStyle(key, newValue)) {
                oldValue = _style[key];

                if (newValue !== oldValue) {
                    _style[key] = newValue;
                    if (!silent) onStyleChange(key, newValue, oldValue);
                }
            }
            else {
                OT.warn("Style.setAll::Invalid style property passed " + key + " : " + newValue);
            }
        }

        return this;
    };

    this.set = function(key, value) {
        OT.debug("Publisher.setStyle: " + key.toString());

        var newValue = castValue(value),
            oldValue;

        if (!isValidStyle(key, newValue)) {
            OT.warn("Style.set::Invalid style property passed " + key + " : " + newValue);
            return this;
        }

        oldValue = _style[key];
        if (newValue !== oldValue) {
            _style[key] = newValue;

            onStyleChange(key, value, oldValue);
        }

        return this;
    };


    if (initalStyles) this.setAll(initalStyles, true);
};

})(window);
(function(window) {

/**
 * A Publishers Microphone.
 *
 * TODO
 * * bind to changes in mute/unmute/volume/etc and respond to them
 */
OT.Microphone = function(webRTCStream, muted) {
    var _muted,
        _gain = 50;


    Object.defineProperty(this, 'muted', {
        get: function() { return _muted; },
        set: function(muted) {
            if (_muted === muted) return;

            _muted = muted;

            var audioTracks = webRTCStream.getAudioTracks();

            for (var i=0, num=audioTracks.length; i<num; ++i) {
                audioTracks[i].enabled = !_muted;
            }
        }
    });

    Object.defineProperty(this, 'gain', {
        get: function() { return _gain; },

        set: function(gain) {
            OT.warn("OT.Microphone.gain IS NOT YET IMPLEMENTED");

            _gain = gain;
        }
    });

    // Set the initial value
    if (muted !== undefined) {
        this.muted = muted === true;
    }
    else if (webRTCStream.getAudioTracks().length) {
        this.muted = !webRTCStream.getAudioTracks()[0].enabled;
    }
    else {
        this.muted = false;
    }
};

})(window);
(function(window) {

// A Factory method for generating simple state machine classes.
//
// @usage
//    var StateMachine = OT.generateSimpleStateMachine('start', ['start', 'middle', 'end', {
//      start: ['middle'],
//      middle: ['end'],
//      end: ['start']
//    }]);
//
//    var states = new StateMachine();
//    state.current;            // <-- start
//    state.set('middle');
//
OT.generateSimpleStateMachine = function(initialState, states, transitions) {
  var validStates = states.slice(),
      validTransitions = OT.$.clone(transitions);

  var isValidState = function (state) {
    return validStates.indexOf(state) !== -1;
  }

  var isValidTransition = function(fromState, toState) {
    return validTransitions[fromState] && validTransitions[fromState].indexOf(toState) !== -1;
  };

  return function(stateChangeFailed) {
    var currentState = initialState,
        previousState = null;

    function signalChangeFailed(message, newState) {
        stateChangeFailed({
          message: message,
          newState: newState,
          currentState: currentState,
          previousState: previousState
        });
    }

    // Validates +newState+. If it's invalid it triggers stateChangeFailed and returns false.
    function handleInvalidStateChanges(newState) {
      if (!isValidState(newState)) {
        signalChangeFailed("'" + newState + "' is not a valid state", newState)

        return false;
      }

      if (!isValidTransition(currentState, newState)) {
        signalChangeFailed("'" + currentState + "' cannot transition to '" + newState + "'", newState)

        return false;
      }

      return true;
    }


    this.set = function(newState) {
      if (!handleInvalidStateChanges(newState)) return;

      previousState = currentState;
      currentState = newState;
    };

    Object.defineProperties(this, {
      current: {
        get: function() { return currentState; }
      },

      subscribing: {
        get: function() { return currentState === 'Subscribing'; }
      }
    });
  };
};

})(window);
(function(window) {

// Models a Subscriber's subscribing State
//
// Valid States:
//     NotSubscribing            (the initial state
//     Init                      (basic setup of DOM
//     ConnectingToPeer          (Failure Cases -> No Route, Bad Offer, Bad Answer
//     BindingRemoteStream       (Failure Cases -> Anything to do with the media being invalid, the media never plays
//     Subscribing               (this is 'onLoad'
//     Failed                    (terminal state, with a reason that maps to one of the failure cases above
//
//
// Valid Transitions:
//     NotSubscribing ->
//         Init
//
//     Init ->
//             ConnectingToPeer
//           | BindingRemoteStream         (if we are subscribing to ourselves and we alreay have a stream
//           | NotSubscribing              (destroy()
//
//     ConnectingToPeer ->
//             BindingRemoteStream
//           | NotSubscribing
//           | Failed
//           | NotSubscribing              (destroy()
//
//     BindingRemoteStream ->
//             Subscribing
//           | Failed
//           | NotSubscribing              (destroy()
//
//     Subscribing ->
//             NotSubscribing              (unsubscribe
//           | Failed                      (probably a peer connection failure after we began subscribing
//
//     Failed ->                           (terminal error state)
//
//
// @example
//     var state = new SubscribingState(function(change) {
//       console.log(change.message);
//     });
//
//     state.set('Init');
//     state.current;                 -> 'Init'
//
//     state.set('Subscribing');      -> triggers stateChangeFailed and logs out the error message
//
//

var validStates = [ 'NotSubscribing', 'Init', 'ConnectingToPeer', 'BindingRemoteStream', 'Subscribing', 'Failed' ],

    validTransitions = {
      NotSubscribing: ['NotSubscribing', 'Init'],
      Init: ['NotSubscribing', 'ConnectingToPeer', 'BindingRemoteStream'],
      ConnectingToPeer: ['NotSubscribing', 'BindingRemoteStream', 'Failed'],
      BindingRemoteStream: ['NotSubscribing', 'Subscribing', 'Failed'],
      Subscribing: ['NotSubscribing', 'Failed'],
      Failed: []
    },

    initialState = 'NotSubscribing';

OT.SubscribingState = OT.generateSimpleStateMachine(initialState, validStates, validTransitions);

Object.defineProperty(OT.SubscribingState.prototype, 'attemptingToSubscribe', {
  get: function() { return [ 'Init', 'ConnectingToPeer', 'BindingRemoteStream' ].indexOf(this.current) !== -1; }
});

})(window);
(function(window) {

// Models a Publisher's publishing State
//
// Valid States:
//    NotPublishing
//    GetUserMedia
//    BindingMedia
//    MediaBound
//    PublishingToSession
//    Publishing
//    Failed
//
//
// Valid Transitions:
//    NotPublishing ->
//        GetUserMedia
//
//    GetUserMedia ->
//        BindingMedia
//      | Failed                      (Failure Reasons -> stream error, constraints, permission denied
//      | NotPublishing               (destroy()
//
//
//    BindingMedia ->
//        MediaBound
//      | Failed                      (Failure Reasons -> Anything to do with the media being invalid, the media never plays
//      | NotPublishing               (destroy()
//
//    MediaBound ->
//        PublishingToSession         (MediaBound could transition to PublishingToSession if a stand-alone publish is bound to a session
//      | Failed                      (Failure Reasons -> media issues with a stand-alone publisher
//      | NotPublishing               (destroy()
//
//    PublishingToSession
//        Publishing
//      | Failed                      (Failure Reasons -> timeout while waiting for ack of stream registered. We do not do this right now
//      | NotPublishing               (destroy()
//
//
//    Publishing ->
//        NotPublishing               (Unpublish
//      | Failed                      (Failure Reasons -> loss of network, media error, anything that causes *all* Peer Connections to fail (less than all failing is just an error, all is failure)
//      | NotPublishing               (destroy()
//
//    Failed ->                       (Terminal state
//
//


var validStates = [ 'NotPublishing', 'GetUserMedia', 'BindingMedia', 'MediaBound', 'PublishingToSession', 'Publishing', 'Failed' ],

    validTransitions = {
      NotPublishing: ['NotPublishing', 'GetUserMedia'],
      GetUserMedia: ['BindingMedia', 'Failed', 'NotPublishing'],
      BindingMedia: ['MediaBound', 'Failed', 'NotPublishing'],
      MediaBound: ['NotPublishing', 'PublishingToSession', 'Failed'],
      PublishingToSession: ['NotPublishing', 'Publishing', 'Failed'],
      Publishing: ['NotPublishing', 'MediaBound', 'Failed'],
      Failed: []
    },

    initialState = 'NotPublishing';

OT.PublishingState = OT.generateSimpleStateMachine(initialState, validStates, validTransitions);

Object.defineProperties(OT.PublishingState.prototype, {
  attemptingToPublish: {
    get: function() { return [ 'GetUserMedia', 'BindingMedia', 'MediaBound', 'PublishingToSession' ].indexOf(this.current) !== -1; }
  },

  publishing: {
    get: function() { return this.current === 'Publishing'; }
  }
});


})(window);
(function(window) {

// The default constraints
var defaultConstraints = {
    audio: true,
    video: true
};

/**
 * The Publisher object  provides the mechanism through which control of the
 * published stream is accomplished. Calling the <code>TB.initPublisher</code> method of a
 *  Session object creates a Publisher object. </p>
 *
 *  <p>The following code instantiates a session, and publishes an audio-video stream
 *  upon connection to the session: </p>
 *
 *  <pre>
 *  var API_KEY = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 *  var sessionID = ""; // Replace with your own session ID.
 *                      // See https://dashboard.tokbox.com/projects
 *  var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                  // See https://dashboard.tokbox.com/projects
 *
 *  var session = TB.initSession(sessionID);
 *  session.addEventListener("sessionConnected", sessionConnectHandler);
 *  session.connect(API_KEY, token);
 *
 *  function sessionConnectHandler(event) {
 *      var div = document.createElement('div');
 *      div.setAttribute('id', 'publisher');
 *
 *      var publisherContainer = document.getElementById('publisherContainer');
 *          // This example assumes that a publisherContainer div exists
 *      publisherContainer.appendChild(div);
 *
 *      var publisherProperties = {width: 400, height:300, name:"Bob's stream"};
 *      publisher = TB.initPublisher(API_KEY, 'publisher', publisherProperties);
 *      session.publish(publisher);
 *  }
 *  </pre>
 *
 *      <p>This example creates a Publisher object and adds its video to a DOM element named <code>publisher</code>
 *      by calling the <code>TB.initPublisher()</code> method. It then publishes a stream to the session by calling
 *      the <code>publish()</code> method of the Session object.</p>
 *
 * @property id The DOM ID of the Publisher.
 * @property stream The {@link Stream} object corresponding the the stream of the Publihser.
 * @property session The {@link Session} to which the Publisher belongs.
 *
 * @see <a href="TB.html#initPublisher">TB.initPublisher</a>
 * @see <a href="Session.html#publish">Session.publish()</a>
 *
 * @class Publisher
 * @augments EventDispatcher
 */
OT.Publisher = function() {
    // Check that the client meets the minimum requirements, if they don't the upgrade
    // flow will be triggered.
    if (!OT.checkSystemRequirements()) {
        OT.upgradeSystemRequirements();
        return;
    }

    var _guid = OT.Publisher.nextId(),
        _domId,
        _container,
        _targetElement,
        _stream,
        _webRTCStream,
        _session,
        _peerConnections = {},
        _loaded = false,
        _publishProperties,
        _publishStartTime,
        _streamCreatedTimeout,
        _microphone,
        _chrome,
        _analytics = new OT.Analytics(),
        _validResolutions = [
            {width: 320, height: 240},
            {width: 640, height: 480},
            {width: 1280, height: 720}
        ],
        _qosIntervals = {},
        _gettingStats = 0,
        _prevStats = {
            "timeStamp" : OT.$.now()
        },
        _state;

    OT.$.eventing(this);

    OT.StylableComponent(this, {
        showMicButton: true,
        showSettingsButton: true,
        showCameraToggleButton: true,
        nameDisplayMode: "auto",
        buttonDisplayMode: "auto",
        backgroundImageURI: null
    });

        /// Private Methods
    var logAnalyticsEvent = function(action, variation, payloadType, payload) {
            _analytics.logEvent({
                action: action,
                variation: variation,
                payload_type: payloadType,
                payload: payload,
                session_id: _session ? _session.sessionId : null,
                connection_id: _session && _session.connected ? _session.connection.connectionId : null,
                partner_id: _session ? _session.apiKey : OT.APIKEY,
                streamId: _stream ? _stream.id : null,
                widget_id: _guid,
                widget_type: 'Publisher'
            });
        },

        isValidResolution = function(width, height) {
            for (var i=0; i<_validResolutions.length; ++i) {
                if (_validResolutions[i].width == width && _validResolutions[i].height == height) {
                    return true;
                }
            }
            return false;
        },

        recordQOS = function(connection_id) {
            var QoS_blob = {
                widget_type: 'Publisher',
                stream_type : 'WebRTC',
                sessionId: _session ? _session.sessionId : null,
                connectionId: _session && _session.connected ? _session.connection.connectionId : null,
                partnerId: _session ? _session.apiKey : OT.APIKEY,
                streamId: _stream ? _stream.id : null,
                widgetId: _guid,
                version: OT.properties.version,
                media_server_name: _session ? _session.sessionInfo.messagingServer : null,
                p2pFlag: _session ? _session.sessionInfo.p2pEnabled : false,
                duration: new Date().getTime() -_publishStartTime.getTime(),
                remote_connection_id: connection_id
            };

            // get stats for each connection id
            _peerConnections[connection_id].getStats(_prevStats, function(stats) {
                if (stats) {
                    for (var stat_index in stats) {
                        QoS_blob[stat_index] = stats[stat_index];
                    }
                }
                _analytics.logQOS(QoS_blob);
            });
        },

        /// Private Events

        stateChangeFailed = function(changeFailed) {
            OT.error("Publisher State Change Failed: ", changeFailed.message);
            OT.debug(changeFailed);
        },

        onLoaded = function() {
            OT.debug("OT.Publisher.onLoaded");

            _state.set('MediaBound');
            _container.loading = false;
            _loaded = true;

            _createChrome.call(this);

            this.trigger('initSuccess', this);
            this.trigger('loaded', this);
        },

        onLoadFailure = function(reason) {
            logAnalyticsEvent('publish', 'Failure', 'reason', "Publisher PeerConnection Error: " + reason);

            _state.set('Failed');
            this.trigger('publishError', "Publisher PeerConnection Error: " + reason);

            OT.handleJsException("Publisher PeerConnection Error: " + reason, OT.ExceptionCodes.P2P_CONNECTION_FAILED, {
                session: _session,
                target: this
            });
        },

        onStreamAvailable = function(webOTStream) {
            OT.debug("OT.Publisher.onStreamAvailable");

            _state.set('BindingMedia');

            cleanupLocalStream();
            _webRTCStream = webOTStream;

            _microphone = new OT.Microphone(_webRTCStream, !_publishProperties.publishAudio);
            this.publishVideo(_publishProperties.publishVideo);

            this.dispatchEvent(
                new OT.Event(OT.Event.names.ACCESS_ALLOWED, false)
            );

            _targetElement = new OT.VideoElement({
                attributes: {muted:true}
            });

            _targetElement.on({
                    streamBound: onLoaded,
                    loadError: onLoadFailure,
                    error: onVideoError
                }, this)
                .bindToStream(_webRTCStream);

            _container.video = _targetElement;
        },

        onStreamAvailableError = function(error) {
            OT.error('OT.Publisher.onStreamAvailableError ' + error.name + ': ' + error.message);

            _state.set('Failed');
            this.trigger('publishError', error.message);

            if (_container) _container.destroy();

            logAnalyticsEvent('publish', 'Failure', 'reason', "Publisher failed to access camera/mic: " + error.message);

            OT.handleJsException("Publisher failed to access camera/mic: " + error.message, 2000, {
                session: _session,
                target: this
            });
        },

        // The user has clicked the 'deny' button the the allow access dialog (or it's set to always deny)
        onAccessDenied = function(error) {
            OT.error('OT.Publisher.onStreamAvailableError Permission Denied');

            _state.set('Failed');
            this.trigger('publishError', error.message);

            logAnalyticsEvent('publish', 'Failure', 'reason', 'Publisher Access Denied: Permission Denied');

            var event = new OT.Event(OT.Event.names.ACCESS_DENIED),
                defaultAction = function() {
                    if (!event.isDefaultPrevented() && _container) _container.destroy();
                };

            this.dispatchEvent(event, defaultAction);
        },

        onAccessDialogOpened = function() {
            logAnalyticsEvent('accessDialog', 'Opened', '', '');

            this.dispatchEvent(
                new OT.Event(OT.Event.names.ACCESS_DIALOG_OPENED, false)
            );
        },

        onAccessDialogClosed = function() {
            logAnalyticsEvent('accessDialog', 'Closed', '', '');

            this.dispatchEvent(
                new OT.Event(OT.Event.names.ACCESS_DIALOG_CLOSED, false)
            );
        },

        onVideoError = function(errorCode, errorReason) {
            OT.error('OT.Publisher.onVideoError');

            var message = errorReason + (errorCode ? ' (' + errorCode + ')' : '');
            logAnalyticsEvent('stream', null, 'reason', "Publisher while playing stream: " + message);

            _state.set('Failed');

            if (_state.attemptingToPublish) {
                this.trigger('publishError', message);
            }
            else {
                this.trigger('error', message);
            }

            OT.handleJsException("Publisher error playing stream: " + message, 2000, {
                session: _session,
                target: this
            });
        },

        onPeerDisconnected = function(peerConnection) {
            OT.debug("OT.Subscriber has been disconnected from the Publisher's PeerConnection");

            this.cleanupSubscriber(peerConnection.remoteConnection.id);
        },

        onPeerConnectionFailure = function(code, reason, peerConnection) {
            logAnalyticsEvent('publish', 'Failure', 'reason|hasRelayCandidates', [
                reason + ": Publisher PeerConnection with connection " + (peerConnection && peerConnection.remoteConnection && peerConnection.remoteConnection.id)  + " failed",
                peerConnection.hasRelayCandidates
                ].join('|'));

            OT.handleJsException("Publisher PeerConnection Error: " + reason, 2000, {
                session: _session,
                target: this
            });

            // We don't call cleanupSubscriber as it also logs a
            // disconnected analytics event, which we don't want in this
            // instance. The duplication is crufty though and should
            // be tidied up.
            if (peerConnection.remoteConnection) {
                clearInterval(_qosIntervals[peerConnection.remoteConnection.id]);
                delete _qosIntervals[peerConnection.remoteConnection.id]

                delete _peerConnections[peerConnection.remoteConnection.id];
            }
            peerConnection.off();
        },

        getStats = function(callback) {
            if (_gettingStats > 0) {
                OT.debug("Still getting stats");
                return;
            }

            var getStatsBlob = {};

            // loops through all the peer connections get get the stats for them
            for (var conn_id in _peerConnections) {

                // this locks the getStats function so it isn't accidentally called
                // again while already in the middle of getting stats
                _gettingStats++;

                getStatsBlob[conn_id] = null;

                // just so we don't lose the connection id
                (function(connection_id) {
                    _peerConnections[connection_id].getStats(function(parsed_stats) {

                        // one down
                        _gettingStats--;

                        if (parsed_stats) {
                            getStatsBlob[connection_id] = parsed_stats;
                        }

                        // if this reaches zero, that means all of the peer connections
                        // have returned their stats reports
                        if (_gettingStats == 0) {
                            callback(getStatsBlob);
                        }
                    });
                })(conn_id);
            }
        },

        /// Private Helpers

        // Clean up our LocalMediaStream
        cleanupLocalStream = function() {
            if (_webRTCStream) {
                // Stop revokes our access cam and mic access for this instance
                // of localMediaStream.
                _webRTCStream.stop();
                _webRTCStream = null;
            }
        },

        createPeerConnectionForRemote = function(remoteConnection) {
            var peerConnection = _peerConnections[remoteConnection.id];

            if (!peerConnection) {
                var startConnectingTime = OT.$.now();

                logAnalyticsEvent('createPeerConnection', 'Attempt', '', '');

                // Cleanup our subscriber when they disconnect
                remoteConnection.on('destroyed', this.cleanupSubscriber.bind(this, remoteConnection.id));

                peerConnection = _peerConnections[remoteConnection.id] = new OT.PublisherPeerConnection(
                    remoteConnection,
                    _session,
                    _stream,
                    _webRTCStream
                );

                peerConnection.on({
                    connected: function() {
                        logAnalyticsEvent('createPeerConnection', 'Success', 'pcc|hasRelayCandidates', [
                            parseInt(OT.$.now() - startConnectingTime, 10),
                            peerConnection.hasRelayCandidates
                        ].join('|'));

                        // start recording the QoS for this peer connection
                        _qosIntervals[remoteConnection.id] = setInterval(function() {
                            recordQOS(remoteConnection.id)
                        }, 30000);
                    },
                    disconnected: onPeerDisconnected,
                    error: onPeerConnectionFailure
                }, this);

                peerConnection.init();
            }

            return peerConnection;
        },

        /// Chrome

        // If mode is false, then that is the mode. If mode is true then we'll
        // definitely display  the button, but we'll defer the model to the
        // Publishers buttonDisplayMode style property.
        chromeButtonMode = function(mode) {
            if (mode === false) return 'off';

            var defaultMode = this.getStyle('buttonDisplayMode');

            // The default model is false, but it's overridden by +mode+ being true
            if (defaultMode === false) return 'on';

            // defaultMode is either true or auto.
            return defaultMode;
        },

        updateChromeForStyleChange = function(key, value, oldValue) {
            if (!_chrome) return;

            switch(key) {
                case 'nameDisplayMode':
                    _chrome.name.setDisplayMode(value);
                    break;

                case 'buttonDisplayMode':
                case 'showMicButton':
                case 'showSettingsButton':
                    // _chrome.settingsPanelButton.setDisplayMode(
                    //     chromeButtonMode.call(this, this.getStyle('showSettingsButton'))
                    // );

                    // _chrome.muteButton.setDisplayMode(
                    //     chromeButtonMode.call(this, this.getStyle('showMicButton'))
                    // );
            }
        },

        _createChrome = function() {
            _chrome = new OT.Chrome({
                parent: _container.domElement
            }).set({
                name: new OT.Chrome.NamePanel({
                    name: _publishProperties.name,
                    mode: this.getStyle('nameDisplayMode')
                }),

                // settingsPanelButton: new OT.Chrome.SettingsPanelButton({
                //     mode: chromeButtonMode.call(this, this.getStyle('showSettingsButton'))
                // }),

                // Disabled until we can change the mic Volume through WebRTC
                muteButton: new OT.Chrome.MuteButton({
                    muted: _publishProperties.publishAudio === false,
                    mode: chromeButtonMode.call(this, this.getStyle('showMicButton'))
                }),

                opentokButton: new OT.Chrome.OpenTokButton()
            }).on({
                // 'SettingsPanel:open': function() {
                //     if (!_chrome.settingsPanel) {
                //         // Add the settings panel, hide it initially
                //         _chrome.set(
                //             'settingsPanel',
                //             new OT.Chrome.SettingsPanel({
                //                 stream: _webRTCStream,
                //                 mode: 'on'
                //             })
                //         );
                //     }
                //     else {
                //         _chrome.settingsPanel.setDisplayMode('on');
                //     }

                //     OT.$.addClass(_container, 'OT_reversed');
                // },

                // 'SettingsPanel:close': function() {
                //     OT.$.removeClass(_container, 'OT_reversed');

                //     // Hide the settings panel after our animation is complete
                //     setTimeout(function() {
                //         _chrome.settingsPanel.setDisplayMode('off');
                //     }, 3000);
                // },


                muted: this.publishAudio.bind(this, false),
                unmuted: this.publishAudio.bind(this, true)
            });
        },

        reset = function() {
            if (_chrome) {
              _chrome.destroy();
              _chrome = null;
            }

            this.disconnect();

            _microphone = null;

            if (_targetElement) {
                _targetElement.destroy();
                _targetElement = null;
            }

            cleanupLocalStream();

            if (_container) {
                _container.destroy();
                _container = null;
            }

            if (this.session) this._.unpublishFromSession(this.session);

            // clear all the intervals
            for (var conn_id in _qosIntervals) {
                clearInterval(_qosIntervals[conn_id]);
                delete _qosIntervals[conn_id];
            }

            _domId = null;
            _stream = null;
            _loaded = false;

            _session = null;
            _properties = null;

            _state.set('NotPublishing');
        }.bind(this);


    this.publish = function(targetElement, properties) {
        OT.debug("OT.Publisher: publish");

        if ( _state.attemptingToPublish || _state.publishing ) reset();
        _state.set('GetUserMedia');

        _publishProperties = OT.$.defaults(properties || {}, {
            publishAudio : true,
            publishVideo : true,
            mirror: true
        });

        _publishProperties.constraints = OT.$.defaults(_publishProperties.constraints || {}, defaultConstraints);

        if (_publishProperties.style) {
            this.setStyle(_publishProperties.style, null, true);
        }

        if (_publishProperties.name) {
            _publishProperties.name = _publishProperties.name.toString();
        }

        _publishProperties.classNames = 'OT_root OT_publisher';

        // Defer actually creating the publisher DOM nodes until we know
        // the DOM is actually loaded.
        OT.onLoad(function() {
            _container = new OT.WidgetView(targetElement, _publishProperties);
            _domId = _container.domId;

            OT.$.getUserMedia(
                _publishProperties.constraints,
                onStreamAvailable.bind(this),
                onStreamAvailableError.bind(this),
                onAccessDialogOpened.bind(this),
                onAccessDialogClosed.bind(this),
                onAccessDenied.bind(this)
            );
        }, this);

        return this;
    };

 /**
  * Starts publishing audio (if it is currently not being published)
  * when the <code>value</code> is <code>true</code>; stops publishing audio
  * (if it is currently being published) when the <code>value</code> is <code>false</code>.
  *
  * @param {Boolean} value Whether to start publishing audio (<code>true</code>)
  * or not (<code>false</code>).
  *
  * @see <a href="TB.html#initPublisher">TB.initPublisher()</a>
  * @see <a href="Stream.html#hasAudio">Stream.hasAudio</a>
  * @see StreamPropertyChangedEvent
  * @method #publishAudio
  * @memberOf Publisher
  */
    this.publishAudio = function(value) {
        _publishProperties.publishAudio = value;

        if (_microphone) {
            _microphone.muted = !value;
        }

        if (_session && _stream) {
            _session._.modifyStream(_stream.streamId, "hasAudio", value);
        }
        return this;
    };


 /**
  * Starts publishing video (if it is currently not being published)
  * when the <code>value</code> is <code>true</code>; stops publishing video
  * (if it is currently being published) when the <code>value</code> is <code>false</code>.
  *
  * @param {Boolean} value Whether to start publishing video (<code>true</code>)
  * or not (<code>false</code>).
  *
  * @see <a href="TB.html#initPublisher">TB.initPublisher()</a>
  * @see <a href="Stream.html#hasVideo">Stream.hasVideo</a>
  * @see StreamPropertyChangedEvent
  * @method #publishVideo
  * @memberOf Publisher
  */
    this.publishVideo = function(value) {
        var oldValue = _publishProperties.publishVideo;
        _publishProperties.publishVideo = value;

        if (_session && _stream && _publishProperties.publishVideo !== oldValue) {
            _session._.modifyStream(_stream.streamId, "hasVideo", value);
        }

        // We currently do this event if the value of publishVideo has not changed
        // This is because the state of the video tracks enabled flag may not match
        // the value of publishVideo at this point. This will be tidied up shortly.
        if (_webRTCStream) {
            var videoTracks = _webRTCStream.getVideoTracks();
            for (var i=0, num=videoTracks.length; i<num; ++i) {
                videoTracks[i].enabled = value;
            }
        }

        if(_container) {
            _container.showPoster = !value;
        }

        return this;
    };

    this.recordQOS = function() {

        // have to record QoS for every peer connection
        for (var conn_id in _peerConnections) {
            recordQOS(conn_id);
        }
    };

    /**
    * Deletes the Publisher object and removes it from the HTML DOM.
    * @method #destroy
    * @memberOf Publisher
    * @return {Publisher} The Publisher.
    */
    this.destroy = function(/* unused */ reason, quiet) {
        reset();

        if (quiet !== true) {
            this.dispatchEvent(
              new OT.DestroyedEvent(
                OT.Event.names.PUBLISHER_DESTROYED,
                this,
                reason
              ),
              this.off.bind(this)
            );
        }

        return this;
    };

    /**
    * @methodOf Publisher
    * @private
    */
    this.disconnect = function() {
        // Close the connection to each of our subscribers
        for (var fromConnectionId in _peerConnections) {
            this.cleanupSubscriber(fromConnectionId);
        }
    };

    this.cleanupSubscriber = function(fromConnectionId) {
        var pc = _peerConnections[fromConnectionId];

        clearInterval(_qosIntervals[fromConnectionId]);
        delete _qosIntervals[fromConnectionId];

        if (pc) {
            pc.destroy();
            delete _peerConnections[fromConnectionId];

            logAnalyticsEvent('disconnect', 'PeerConnection', 'subscriberConnection', fromConnectionId);
        }
    };


    this.processMessage = function(type, fromConnection, message) {
        OT.debug("OT.Publisher.processMessage: Received " + type + " from " + fromConnection.id);
        OT.debug(message);

        switch (type) {
            case OT.Raptor.Actions.UNSUBSCRIBE:
                this.cleanupSubscriber(fromConnection.id);
                break;

            default:
                var peerConnection = createPeerConnectionForRemote.call(this, fromConnection);
                peerConnection.processMessage(type, message);
        }
    };

    /**
    * Returns the base-64-encoded string of PNG data representing the Publisher video.
    *
    *   <p>You can use the string as the value for a data URL scheme passed to the src parameter of
    *   an image file, as in the following:</p>
    *
    * <pre>
    *  var imgData = publisher.getImgData();
    *
    *  var img = document.createElement("img");
    *  img.setAttribute("src", "data:image/png;base64," + imgData);
    *  var imgWin = window.open("about:blank", "Screenshot");
    *  imgWin.document.write("&lt;body&gt;&lt;/body&gt;");
    *  imgWin.document.body.appendChild(img);
    * </pre>
    *
    * @method #getImgData
    * @memberOf Publisher
    * @return {String} The base-64 encoded string. Returns an empty string if there is no video.
    */

    this.getImgData = function() {
        if (!_loaded) {
            OT.error("OT.Publisher.getImgData: Cannot getImgData before the Publisher is publishing.");

            return null;
        }

        return _targetElement.imgData;
    };


    // API Compatibility layer for Flash Publisher, this could do with some tidyup.
    this._ = {
        publishToSession: function(session) {
            // Add session property to Publisher
            this.session = session;

            var createStream = function() {
                // Bail if this.session is gone, it means we were unpublished
                // before createStream could finish.
                if (!this.session) return;

                _state.set('PublishingToSession');

                if (_streamCreatedTimeout) {
                  clearTimeout(_streamCreatedTimeout);
                }
                _streamCreatedTimeout = setTimeout(function () {
                  logAnalyticsEvent('publish', 'Failure', 'reason', 'StreamCreated: Timed out waiting for streamRegistered');
                  this.trigger('publishError', "StreamCreated: Timed out waiting for streamRegistered");
                }.bind(this), 30000);

                session._.createStream( this.guid,
                                        _publishProperties && _publishProperties.name ? _publishProperties.name : "",
                                        OT.VideoOrientation.ROTATED_NORMAL,
                                        _targetElement.videoWidth,                      // actual width and height
                                        _targetElement.videoHeight,                     // of the video stream.
                                        _publishProperties.publishAudio,
                                        _publishProperties.publishVideo );
            };

            if (_loaded) createStream.call(this);
            else this.on("initSuccess", createStream, this);

            logAnalyticsEvent('publish', 'Attempt', 'streamType', 'WebRTC');

            return this;
        }.bind(this),

        unpublishFromSession: function(session) {
            if (!this.session || session.id !== this.session.id) {
                OT.warn("The publisher " + this.guid + " is trying to unpublish from a session " + session.id + " it is not attached to");
                return this;
            }

            if (session.connected && this.stream) {
                session._.destroyStream(this.stream.id);
            }

            // Disconnect immediately, rather than wait for the WebSocket to
            // reply to our destroyStream message.
            this.disconnect();
            this.session = null;

            // We're back to being a stand-alone publisher again.
            _state.set('MediaBound');

            logAnalyticsEvent('unpublish', 'Success', 'sessionId', session.id);

            return this;
        }.bind(this),

        // Called once our stream has been ack'd as created by the session
        streamRegisteredHandler: function(stream) {
            clearTimeout(_streamCreatedTimeout);
            _streamCreatedTimeout = null;

            logAnalyticsEvent('publish', 'Success', 'streamType', 'WebRTC');

            this.stream = stream;
            this.stream.on('destroyed', this.disconnect, this);

            var oldGuid = _guid;
            _guid = OT.Publisher.nextId();

            // Our publisher has changed guids, let people that rely
            // on the GUID be non-volatile know.
            if (oldGuid) {
                this.trigger('idUpdated', oldGuid, _guid);
            }

            _state.set('Publishing');
            _publishStartTime = new Date();

            this.trigger('publishSuccess');
        }.bind(this)
    };

    this.detectDevices = function() {
        OT.warn("Fixme: Haven't implemented detectDevices");
    };

    this.detectMicActivity = function() {
        OT.warn("Fixme: Haven't implemented detectMicActivity");
    };

    this.getEchoCancellationMode = function() {
        OT.warn("Fixme: Haven't implemented getEchoCancellationMode");
        return "fullDuplex";
    };

    this.setMicrophoneGain = function(value) {
        OT.warn("Fixme: Haven't implemented setMicrophoneGain");
    };

    this.getMicrophoneGain = function() {
        OT.warn("Fixme: Haven't implemented getMicrophoneGain");
        return 0.5;
    };

    this.setCamera = function(value) {
        OT.warn("Fixme: Haven't implemented setCamera");
    };

    this.setMicrophone = function(value) {
        OT.warn("Fixme: Haven't implemented setMicrophone");
    };


    Object.defineProperties(this, {
        id: {
            get: function() { return _domId; },
            enumerable: true
        },

        guid: {
            get: function() { return _guid; },
            enumerable: true
        },

        stream: {
            get: function() { return _stream; },
            set: function(stream) { _stream = stream; },
            enumerable: true
        },

        streamId: {
            get: function() {
                if (!_stream) return null;

                return _stream.id;
            },
            enumerable: true
        },

        targetElement: {
            get: function() { return _targetElement.domElement; }
        },

        domId: {
            get: function() { return _domId; }
        },

        session: {
            get: function() { return _session; },
            set: function(session) { _session = session; },
            enumerable: true
        },

        isWebRTC: {
            get: function() { return true; }
        },

        loading: {
            get: function(){ return _container && _container.loading }
        }
    });

    Object.defineProperty(this._, 'webRtcStream', {
        get: function() { return _webRTCStream; }
    });

    this.on('styleValueChanged', updateChromeForStyleChange, this);
    _state = new OT.PublishingState(stateChangeFailed);


	/**
	* Dispatched when the user has clicked the Allow button, granting the
	* app access to the camera and microphone.
	* @name accessAllowed
	* @event
	* @memberof Publisher
	*/

	/**
	* Dispatched when the user has clicked the Deny button, preventing the
	* app from having access to the camera and microphone.
	* @name accessDenied
	* @event
	* @memberof Publisher
	*/

	/**
	* Dispatched when the Allow/Deny dialog box is opened. (This is the dialog box in which the user can grant
	* the app access to the camera and microphone.)
	* @name accessDialogOpened
	* @event
	* @memberof Publisher
	*/

	/**
	* Dispatched when the Allow/Deny box is closed. (This is the dialog box in which the user can grant
	* the app access to the camera and microphone.)
	* @name accessDialogClosed
	* @event
	* @memberof Publisher
	*/

};

// Helper function to generate unique publisher ids
OT.Publisher.nextId = OT.$.uuid;

})(window);
(function(window) {


/**
 * The Subscriber object is a representation of the local video element that is playing back a remote stream.
 * The Subscriber object includes methods that let you disable and enable local audio playback for the subscribed stream.
 * The <code>subscribe()</code> method of the {@link Session} object returns a Subscriber object.
 *
 * @property {String} id The DOM ID of the Subscriber.
 * @property {Stream} stream The stream to which you are subscribing.
 * @class Subscriber
 * @augments EventDispatcher
 */
OT.Subscriber = function(targetElement, options) {
    var _widgetId = OT.$.uuid(),
        _domId = targetElement || _widgetId,
        _container,
        _streamContainer,
        _chrome,
        _stream,
        _fromConnectionId,
        _peerConnection,
        _session = options.session,
        _subscribeStartTime,
        _startConnectingTime,
        _qosInterval,
        _properties = OT.$.clone(options),
        _analytics = new OT.Analytics(),
        _audioVolume = 50,
        _gettingStats = 0,
        _state,
        _subscribeAudioFalseWorkaround, // OPENTOK-6844
        _prevStats = {
            "timeStamp" : OT.$.now()
        };


    if (!_session) {
        OT.handleJsException("Subscriber must be passed a session option", 2000, {
            session: _session,
            target: this
        });

        return;
    }

    OT.$.eventing(this);

    OT.StylableComponent(this, {
        nameDisplayMode: "auto",
        buttonDisplayMode: "auto",
        backgroundImageURI: null
    });

    var logAnalyticsEvent = function(action, variation, payloadType, payload) {
            _analytics.logEvent({
                action: action,
                variation: variation,
                payload_type: payloadType,
                payload: payload,
                stream_id: _stream ? _stream.id : null,
                session_id: _session ? _session.sessionId : null,
                connection_id: _session && _session.connected ? _session.connection.connectionId : null,
                partner_id: _session && _session.connected ? _session.sessionInfo.partnerId : null,
                widget_id: _widgetId,
                widget_type: 'Subscriber'
            });
        },

        recordQOS = function() {
            if(_state.subscribing && _session && _session.connected) {
                var QoS_blob = {
                    widget_type: 'Subscriber',
                    stream_type : 'WebRTC',
                    session_id: _session ? _session.sessionId : null,
                    connectionId: _session ? _session.connection.connectionId : null,
                    media_server_name: _session ? _session.sessionInfo.messagingServer : null,
                    p2pFlag: _session ? _session.sessionInfo.p2pEnabled : false,
                    partner_id: _session ? _session.apiKey : null,
                    stream_id: _stream.id,
                    widget_id: _widgetId,
                    version: OT.properties.version,
                    duration: parseInt(OT.$.now() - _subscribeStartTime, 10),
                    remote_connection_id: _stream.connection.connectionId
                };


                // get stats for each connection id
                _peerConnection.getStats(_prevStats, function(stats) {
                    if (stats) {
                        for (stat_index in stats) {
                            QoS_blob[stat_index] = stats[stat_index];
                        }
                    }
                    _analytics.logQOS(QoS_blob);
                });
            }
        },

        stateChangeFailed = function(changeFailed) {
            OT.error("Subscriber State Change Failed: ", changeFailed.message);
            OT.debug(changeFailed);
        },

        onLoaded = function() {
            if (_state.subscribing || !_streamContainer) return;

            OT.debug("OT.Subscriber.onLoaded");

            _state.set('Subscribing');
            _subscribeStartTime = OT.$.now();

            logAnalyticsEvent('createPeerConnection', 'Success', 'pcc|hasRelayCandidates', [
                parseInt(_subscribeStartTime - _startConnectingTime, 10),
                _peerConnection && _peerConnection.hasRelayCandidates
            ].join('|'));

            _qosInterval = setInterval(recordQOS, 30000);

            if(_subscribeAudioFalseWorkaround) {
                _subscribeAudioFalseWorkaround = null;
                this.subscribeToVideo(false);
            }

            _container.loading = false;

            _createChrome.call(this);

            this.trigger('subscribeSuccess', this);
            this.trigger('loaded', this);


            logAnalyticsEvent('subscribe', 'Success', 'streamId', _stream.id);
        },

        onDisconnected = function() {
            OT.debug("OT.Subscriber has been disconnected from the Publisher's PeerConnection");

            if (_state.attemptingToSubscribe) {
                // subscribing error
                _state.set('Failed');
                this.trigger('subscribeError', "ClientDisconnected");
            }
            else if (_state.subscribing) {
                _state.set('Failed');

                // we were disconnected after we were already subscribing
                // probably do nothing?
            }

            this.disconnect();
        },


        onPeerConnectionFailure = function(code, reason) {
            if (_state.attemptingToSubscribe) {
                // We weren't subscribing yet so this was a failure in setting
                // up the PeerConnection or receiving the initial stream.
                logAnalyticsEvent('createPeerConnection', 'Failure', 'reason|hasRelayCandidates', [
                    "Subscriber PeerConnection Error: " + reason,
                    _peerConnection && _peerConnection.hasRelayCandidates
                ].join('|'));

                _state.set('Failed');
                this.trigger('subscribeError', reason);
            }
            else if (_state.subscribing) {
                // we were disconnected after we were already subscribing
                _state.set('Failed');
                this.trigger('error', reason);
            }

            this.disconnect();

            logAnalyticsEvent('subscribe', 'Failure', 'reason', reason + ":Subscriber PeerConnection Error");

            OT.handleJsException("Subscriber PeerConnection Error: " + reason, OT.ExceptionCodes.P2P_CONNECTION_FAILED, {
                session: _session,
                target: this
            });
            _showError.call(this, reason);
        },

        onRemoteStreamAdded = function(webOTStream) {
            OT.debug("OT.Subscriber.onRemoteStreamAdded");

            _state.set('BindingRemoteStream');

            // Disable the audio/video, if needed
            this.subscribeToAudio(_properties.subscribeToAudio);

            var preserver = _subscribeAudioFalseWorkaround;
            this.subscribeToVideo(_properties.subscribeToVideo);
            _subscribeAudioFalseWorkaround = preserver;

            var streamElement = new OT.VideoElement();

            // Initialize the audio volume
            streamElement.setAudioVolume(_audioVolume);
            streamElement.on({
                    streamBound: onLoaded,
                    loadError: onPeerConnectionFailure,
                    error: onPeerConnectionFailure
                }, this);

            streamElement.bindToStream(webOTStream);
             _container.video = streamElement;

            _streamContainer = streamElement;

            _streamContainer.orientation = {
                width: _stream.videoDimensions.width,
                height: _stream.videoDimensions.height,
                videoOrientation: _stream.videoDimensions.orientation
            };

            logAnalyticsEvent('createPeerConnection', 'StreamAdded', '', '');
            this.trigger('streamAdded', this);
        },

        onRemoteStreamRemoved = function(webOTStream) {
            OT.debug("OT.Subscriber.onStreamRemoved");

            if (_streamContainer.stream == webOTStream) {
                _streamContainer.destroy();
                _streamContainer = null;
            }


            this.trigger('streamRemoved', this);
        },

        streamUpdated = function(event) {
            switch(event.changedProperty) {
                case 'orientation':
                    _streamContainer.orientation = {
                        width: _stream.videoDimensions.width,
                        height: _stream.videoDimensions.height,
                        videoOrientation: _stream.videoDimensions.orientation
                    };
                    break;

                case 'hasVideo':
                    if(_container) {
                        _container.showPoster = !(_stream.hasVideo && _properties.subscribeToVideo);
                    }

                    break;

                case 'hasAudio':
                    // noop
            }
        },

        /// Chrome

        updateChromeForStyleChange = function(key, value, oldValue) {
            if (!_chrome) return;

            switch(key) {
                case 'nameDisplayMode':
                    _chrome.name.setDisplayMode(value);
                    break;

                case 'buttonDisplayMode':
                    // _chrome.muteButton.setDisplayMode(value);
            }
        },

        _createChrome = function() {
            _chrome = new OT.Chrome({
                parent: _container.domElement
            }).set({
                name: new OT.Chrome.NamePanel({
                    name: _properties.name,
                    mode: this.getStyle('nameDisplayMode')
                }),

                // // Disabled until we can change the mic Volume through WebRTC
                // muteButton: new OT.Chrome.MicVolume({
                //     muted: false,
                //     mode: this.getStyle('buttonDisplayMode')
                // }),

                opentokButton: new OT.Chrome.OpenTokButton()
            }).on({
                muted: function() {
                    // @todo turn off audio on the web rtc stream
                },

                unmuted: function() {
                    // @todo turn on audio on the web rtc stream
                }
            });
        },

        _showError = function(errorMsg) {
            // Display the error message inside the container, assuming it's
            // been created by now.
            if (_container) _container.addError(errorMsg);
        };


    this.recordQOS = function() {
        recordQOS();
    };

    this.subscribe = function(stream) {
        OT.debug("OT.Subscriber: subscribe to " + stream.id);

        if (_state.subscribing) {
            // @todo error
            OT.error("OT.Subscriber.Subscribe: Cannot subscribe, already subscribing.");
            return false;
        }

        _state.set('Init');

        if (!stream) {
            // @todo error
            OT.error("OT.Subscriber: No stream parameter.");
            return false;
        }

        if (_stream) {
            // @todo error
            OT.error("OT.Subscriber: Already subscribed");
            return false;
        }

        _stream = stream;
        _stream.on({
            updated: streamUpdated,
            destroyed: this.disconnect
        }, this);

        _fromConnectionId = stream.connection.connectionId;
        _properties.name = _stream.name;
        _properties.classNames = 'OT_root OT_subscriber';

        if (_properties.style) {
            this.setStyle(_properties.style, null, true);
        }
        if (_properties.audioVolume) {
            this.setAudioVolume(_properties.audioVolume);
        }

        _properties.subscribeToAudio = OT.$.castToBoolean(_properties.subscribeToAudio, true);
        _properties.subscribeToVideo = OT.$.castToBoolean(_properties.subscribeToVideo, true);

        _container = new OT.WidgetView(targetElement, _properties);
        _domId = _container.domId;

        if(!_properties.subscribeToVideo && OT.$.browser() == 'Chrome') {
            _subscribeAudioFalseWorkaround = true;
            _properties.subscribeToVideo = true;
        }

        _startConnectingTime = OT.$.now();

        if (_stream.connection.id !== _session.connection.id) {
            logAnalyticsEvent('createPeerConnection', 'Attempt', '', '');

            _state.set('ConnectingToPeer');

            _peerConnection = new OT.SubscriberPeerConnection(_stream.connection, _session, _stream, _properties);

            _peerConnection.on({
                disconnected: onDisconnected,
                error: onPeerConnectionFailure,
                remoteStreamAdded: onRemoteStreamAdded,
                remoteStreamRemoved: onRemoteStreamRemoved
            }, this);

            // initialize the peer connection AFTER we've added the event listeners
            _peerConnection.init();
        }
        else {
            logAnalyticsEvent('createPeerConnection', 'Attempt', '', '');

            // Subscribe to yourself edge-case
            onRemoteStreamAdded.call(this, _session.getPublisherForStream(_stream)._.webRtcStream);
        }

        logAnalyticsEvent('subscribe', 'Attempt', 'streamId', _stream.id);

        return this;
    };

    this.destroy = function(/* unused */ reason, quiet) {
        clearInterval(_qosInterval);
        _qosInterval = null;

        this.disconnect();

        if (_chrome) {
            _chrome.destroy();
            _chrome = null;
        }

        if (_container) {
            _container.destroy();
            _container = null;
        }

        if (_stream && !_stream.destroyed) logAnalyticsEvent('unsubscribe', null, 'streamId', _stream.id);

        _domId = null;
        _stream = null;

        _session = null;
        _properties = null;

        if (quiet !== true) {
            this.dispatchEvent(
              new OT.DestroyedEvent(
                OT.Event.names.SUBSCRIBER_DESTROYED,
                this,
                reason
              ),
              this.off.bind(this)
            );
        }

        return this;
    };


    this.disconnect = function() {
        _state.set('NotSubscribing');

        if (_streamContainer) {
            _streamContainer.destroy();
            _streamContainer = null;
        }

        if (_peerConnection) {
            _peerConnection.destroy();
            _peerConnection = null;

            logAnalyticsEvent('disconnect', 'PeerConnection', 'streamId', _stream.id);
        }
    };

    this.processMessage = function(type, fromConnection, message) {
        OT.debug("OT.Subscriber.processMessage: Received " + type + " message from " + fromConnection.id);
        OT.debug(message);

        if (_fromConnectionId != fromConnection.id) {
            _fromConnectionId = fromConnection.id;
        }

        if (_peerConnection) {
          _peerConnection.processMessage(type, message);
        }
    };

    this.updateQuality = function(quality) {
        // Currently, this only disables the video and disregards
        // the quality.
        OT.warn("Due to high packet loss and low bandwidth, video has been disabled");
        this.subscribeToVideo(false);
        this.dispatchEvent(new OT.Event("videoDisabled"));
    };

    /**
    * Return the base-64-encoded string of PNG data representing the Subscriber video.
    *
    *  <p>You can use the string as the value for a data URL scheme passed to the src parameter of
    *  an image file, as in the following:</p>
    *
    *  <pre>
    *  var imgData = subscriber.getImgData();
    *
    *  var img = document.createElement("img");
    *  img.setAttribute("src", "data:image/png;base64," + imgData);
    *  var imgWin = window.open("about:blank", "Screenshot");
    *  imgWin.document.write("&lt;body&gt;&lt;/body&gt;");
    *  imgWin.document.body.appendChild(img);
    *  </pre>
    * @method #getImgData
    * @memberOf Subscriber
    * @return {String} The base-64 encoded string. Returns an empty string if there is no video.
    */
    this.getImgData = function() {
        if (!this.subscribing) {
            OT.error("OT.Subscriber.getImgData: Cannot getImgData before the Subscriber is subscribing.");
            return null;
        }

        return _streamContainer.imgData;
    };

    /**
    * Sets the audio volume, between 0 and 100, of the Subscriber.
    *
    * <p>You can set the initial volume when you call the <code>Session.subscribe()</code>
    * method. Pass a <code>audioVolume</code> property of the <code>properties</code> parameter
    * of the method.</p>
    *
    * @param {Number} value The audio volume, between 0 and 100.
    *
    * @return {Subscriber} The Subscriber object. This lets you chain method calls, as in the following:
    *
    * <pre>mySubscriber.setAudioVolume(50).setStyle(newStyle);</pre>
    *
    * @see <a href="#getAudioVolume">getAudioVolume()</a>
    * @see <a href="Session.html#subscribe">Session.subscribe()</a>
    * @method #setAudioVolume
    * @memberOf Subscriber
    */
    this.setAudioVolume = function(value) {
        value = parseInt(value, 10);
        if (isNaN(value)) {
            OT.error("OT.Subscriber.setAudioVolume: value should be an integer between 0 and 100");
            return this;
        }
        _audioVolume = Math.max(0, Math.min(100, value));
        if (_audioVolume != value) {
            OT.warn("OT.Subscriber.setAudioVolume: value should be an integer between 0 and 100");
        }
        if (_streamContainer) {
            _streamContainer.setAudioVolume(_audioVolume);
        }

        return this;
    };

    /**
    * Returns the audio volume, between 0 and 100, of the Subscriber.
    *
    * <p>Generally you use this method in conjunction with the <code>setAudioVolume()</code> method.</p>
    *
    * @return {Number} The audio volume, between 0 and 100, of the Subscriber.
    * @see <a href="#setAudioVolume">setAudioVolume()</a>
    * @method #getAudioVolume
    * @memberOf Subscriber
    */
    this.getAudioVolume = function() {
        if (_streamContainer) return _streamContainer.getAudioVolume();
        else return _audioVolume;
    };

    /**
    * Toggles audio on and off. Starts subscribing to audio (if it is available and currently not being
    * subscribed to) when the <code>value</code> is <code>true</code>; stops subscribing to audio
    * (if it is currently being subscribed to) when the <code>value</code> is <code>false</code>.
    * <p>
    * <i>Note:</i> This method only affects the local playback of audio. It has no impact on the audio
    * for other connections subscribing to the same stream. If the Publsher is not publishing audio,
    * enabling the Subscriber audio will have no practical effect.
    * </p>
    *
    * @param {Boolean} value Whether to start subscribing to audio (<code>true</code>) or not (<code>false</code>).
    *
    * @return {Subscriber} The Subscriber object. This lets you chain method calls, as in the following:
    *
    * <pre>mySubscriber.subscribeToAudio(true).subscribeToVideo(false);</pre>
    *
    * @see <a href="#subscribeToVideo">subscribeToVideo()</a>
    * @see <a href="Session.html#subscribe">Session.subscribe()</a>
    * @see <a href="StreamPropertyChangedEvent.html">StreamPropertyChangedEvent</a>
    *
    * @method #subscribeToAudio
    * @memberOf Subscriber
    */
    this.subscribeToAudio = function(p_value) {
        var value = OT.$.castToBoolean(p_value, true);

        if (_peerConnection) {
            _peerConnection.subscribeToAudio(value);

            if (_session && _stream && value !== _properties.subscribeToAudio) {
                _session._.modifySubscriber(this, "hasAudio", value);
            }
        }

        _properties.subscribeToAudio = value;

        return this;
    };


    /**
    * Toggles video on and off. Starts subscribing to video (if it is available and currently not being
    * subscribed to) when the <code>value</code> is <code>true</code>; stops subscribing to video
    * (if it is currently being subscribed to) when the <code>value</code> is <code>false</code>.
    * <p>
    * <i>Note:</i> This method only affects the local playback of video. It has no impact on the video
    * for other connections subscribing to the same stream. If the Publsher is not publishing video,
    * enabling the Subscriber video will have no practical video.
    * </p>
    *
    * @param {Boolean} value Whether to start subscribing to video (<code>true</code>) or not (<code>false</code>).
    *
    * @return {Subscriber} The Subscriber object. This lets you chain method calls, as in the following:
    *
    * <pre>mySubscriber.subscribeToVideo(true).subscribeToAudio(false);</pre>
    *
    * @see <a href="#subscribeToAudio">subscribeToAudio()</a>
    * @see <a href="Session.html#subscribe">Session.subscribe()</a>
    * @see <a href="StreamPropertyChangedEvent.html">StreamPropertyChangedEvent</a>
    *
    * @method #subscribeToVideo
    * @memberOf Subscriber
    */
    this.subscribeToVideo = function(p_value) {
        if(_subscribeAudioFalseWorkaround && p_value == true) {
            // Turn off the workaround if they enable the video
            _subscribeAudioFalseWorkaround = false;
            return;
        }

        var value = OT.$.castToBoolean(p_value, true);

        if(_container) {
            _container.showPoster = !(value && _stream.hasVideo);
            if(value && _container.video) {
                _container.loading = value;
                _container.video.whenTimeIncrements(function(){
                    _container.loading = false;
                }, this);
            }
        }

        if (_peerConnection) {
            _peerConnection.subscribeToVideo(value);

            if (_session && _stream && value !== _properties.subscribeToVideo) {
                _session._.modifySubscriber(this, "hasVideo", value);
            }
        }

        _properties.subscribeToVideo = value;

        return this;
    };

    Object.defineProperties(this, {
        id: {
            get: function() { return _domId; },
            enumerable: true
        },

        widgetId: {
            get: function() { return _widgetId; }
        },

        stream: {
            get: function() { return _stream; },
            enumerable: true
        },

        streamId: {
            get: function() {
                if (!_stream) return null;

                return _stream.id;
            },
            enumerable: true
        },

        targetElement: {
            get: function() { return _streamContainer ? _streamContainer.domElement : null; }
        },

        subscribing: {
            get: function() { return _state.subscribing; },
            enumerable: true
        },

        isWebRTC: {
            get: function() { return true; }
        },

        loading: {
            get: function(){ return _container && _container.loading }
        },

        session: {
            get: function() { return _session; }
        }
    });

    this.on('styleValueChanged', updateChromeForStyleChange, this);

    _state = new OT.SubscribingState(stateChangeFailed);

	/**
	* Dispatched when the OpenTok media server stops sending video to the subscriber.
	* This feature of the OpenTok media server has a subscriber drop the video stream
	* when connectivity degrades. The subscriber continues to receive the audio stream,
	* if there is one. This feature is only available in sessions that use the OpenTok
	* media server, not in peer-to-peer sessions.
	* @name videoDisabled
	* @event
	* @memberof Subscriber
	*/

};

})(window);
(function(window) {
    OT.SessionInfo = function(xmlDocument) {
        var sessionXML = null;

        this.sessionId = null;
        this.partnerId = null;
        this.sessionStatus = null;
        this.p2pEnabled = false;

        this.messagingServer = null;
        this.iceServers = null;

        OT.log("SessionInfo Response:")
        OT.log(xmlDocument);

        if (xmlDocument && xmlDocument.documentElement && xmlDocument.documentElement.firstElementChild !== null) {
            sessionXML = xmlDocument.documentElement.firstElementChild;
        }

        var element = sessionXML.firstElementChild;
        do {
            switch (element.localName) {
            case "session_id":
                this.sessionId = element.textContent;
                break;

            case "partner_id":
                this.partnerId = element.textContent;
                break;

            case "session_status":
                this.sessionStatus = element.textContent;
                break;

            case "messaging_server_url":
                this.messagingServer = element.textContent;
                break;

            case "ice_servers":
                // <ice_servers>
                //     <ice_server url="foo.com" />
                //     <ice_server url="bar.com" credential="xxx" />
                // </ice_servers>

                this.iceServers = normaliseIceServers( parseIceServersXml(element.childNodes) );
                break;

            case "properties":
                var property = element.firstElementChild;
                if (property) {
                    do {
                        if (property.localName === "p2p" && property.firstElementChild !== null) {
                            this.p2pEnabled = (property.firstElementChild.textContent === "enabled");
                            break;
                        }
                    } while (property = property.nextElementSibling);
                }

                break;

            default:
                // OT.debug("OT.SessionInfo element was not handled (" + element.localName + ")");
                break;
            }

        } while (element = element.nextElementSibling);

        if (!this.iceServers || this.iceServers.length === 0) {
            // We haven't got any ICE Servers from Anvil, default to something
            OT.warn("SessionInfo contained not ICE Servers, using the default");
            this.iceServers = [ {"url": "stun:stun.l.google.com:19302"} ];
        }

        //we've parsed the XML into the object

        sessionXML = null;
    };


// Retrieves Session Info for +session+. The SessionInfo object will be passed
// to the +onSuccess+ callback. The +onFailure+ callback will be passed an error
// object and the DOMEvent that relates to the error.
OT.SessionInfo.get = function(session, onSuccess, onFailure) {
    var sessionInfoURL = OT.properties.apiURL + '/session/' + session.id + "?extended=true",

        startTime = OT.$.now(),

        validateRawSessionInfo = function(sessionInfo) {
            session.logEvent('Instrumentation', null, 'gsi', OT.$.now() - startTime);

            var error = parseErrorFromXMLDocument(sessionInfo);

            if (error === false) {
                onGetResponseCallback(session, onSuccess, sessionInfo);
            }
            else {
                onGetErrorCallback(session, onFailure, error);
            }
        };

    session.logEvent('getSessionInfo', 'Attempt', 'api_url', OT.properties.apiURL);

    OT.$.getXML(sessionInfoURL, {
        headers: {"X-TB-TOKEN-AUTH": session.token, "X-TB-VERSION": 1},

        success: validateRawSessionInfo,

        error: function(event) {
            onGetErrorCallback(session, onFailure, parseErrorFromXMLDocument(event.target.responseXML));
        }
    });
};

var messageServerToClientErrorCodes = {};
messageServerToClientErrorCodes['404'] = OT.ExceptionCodes.INVALID_SESSION_ID;
messageServerToClientErrorCodes['403'] = OT.ExceptionCodes.AUTHENTICATION_ERROR;

// Return the error in +xmlDocument+, if there is one. Otherwise it will return
// false.
parseErrorFromXMLDocument = function(xmlDocument) {
    if (xmlDocument && xmlDocument.documentElement && xmlDocument.documentElement.firstElementChild !== null) {
        var errorNodes = xmlDocument.evaluate('//error', xmlDocument.documentElement, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null ),
            numErrorNodes = errorNodes.snapshotLength;

        if (numErrorNodes === 0) return false;

        for (var i=0; i<numErrorNodes; ++i) {
            var errorNode = errorNodes.snapshotItem(i);

            return {
                code: errorNode.getAttribute('code'),
                message: errorNode.firstElementChild.getAttribute('message')
            };
        }
    }

    // There was an error, but we couldn't find the error info.
    return {
        code: null,
        message: "Unknown error: getSessionInfo XML response was badly formed " +
          (xmlDocument && xmlDocument.documentElement && xmlDocument.documentElement.innerHTML)
    };
};

onGetResponseCallback = function(session, onSuccess, rawSessionInfo) {
  session.logEvent('getSessionInfo', 'Success', 'api_url', OT.properties.apiURL);

  onSuccess( new OT.SessionInfo(rawSessionInfo) );
};

onGetErrorCallback = function(session, onFailure, error) {
    TB.handleJsException("TB.SessionInfoError :: Unable to get session info " + error.message, messageServerToClientErrorCodes[error.code], {
        session: session
    });

    session.logEvent('Connect', 'Failure', 'errorMessage', "GetSessionInfo:" + error.code + ": Unable to get session info " + error.message);
    onFailure(error, session);
};

parseIceServersXml = function (nodes) {
    var iceServers = [],
        iceServer,
        attributes;

    for (var i=0, numNodes=nodes.length; i<numNodes; ++i) {
        if (nodes[i].localName === 'ice_server') {
            // @todo parse either a URL node, or a URL and credentials
            attributes = nodes[i].attributes;
            iceServer = {
                url: attributes.getNamedItem('url').nodeValue
            };

            if (attributes.getNamedItem('credential') && attributes.getNamedItem('credential').nodeValue.length) {
                iceServer.credential = attributes.getNamedItem('credential').nodeValue;
            }

            iceServers.push(iceServer);
        }
    }

    return iceServers;
};

// This is ugly. Here we are handling the following:
// 1. Firefox doesn't support TURN until version 25. We fallback to STUN
// in previous versions.
//
// 2. In FF >= 23 the new syntax for declaring Ice Servers with credentials
// is used. i.e. url, credential, and username as opposed to just url and credential.
//
// 3. FF >= 27 supports the TURN transport parameter, in older versions we need
// to strip it out.
//
normaliseIceServers = function (iceServers) {
    var userAgent = navigator.userAgent.match(/(Firefox)\/([0-9]+\.[0-9]+)/),
        firefoxVersion = userAgent ? parseFloat(userAgent[2], 10) : void 0,
        bits;

    return iceServers.map(function(iceServer) {
        // We don't need to normalise STUN, just pass it on through
        if (iceServer.url.trim().substr(0, 5) !== 'turn:') {
            return iceServer;
        }

        if (userAgent !== null) {
            // TURN is broken in these versions of FF: Fallback to STUN.
            if (firefoxVersion < 25) {
                return {url: iceServer.url.replace("turn:", "stun:")};
            }

            // FF < 27 doesn't support the TURN transport parameter, so we strip it out
            if (firefoxVersion < 27 && iceServer.url.indexOf('?') !== -1) {
                iceServer.url = iceServer.url.trim().split('?')[0];
            }
        }

        bits = iceServer.url.trim().split(/[:@]/);

        return {
            username: bits[1],
            credential: iceServer.credential,
            url: bits[0] + ':' + bits[2] + (bits.length === 4 ? ':' + bits[3] : '')
        };
    });
};

})(window);
(function(window) {
	/**
	 * A class defining properties of the <code>capabilities</code> property of a
     * Session object. See <a href="Session.html#capabilites">Session.capabilities</a>.
	 * <p>
	 * All Capabilities properties are undefined until you have connected to a session
	 * and the Session object has dispatched the <code>sessionConnected</code> event.
	 * <p>
	 * For more information on token roles, see the <a href="server_side_libraries.html#generate_token">generate_token()</a>
     * method of the OpenTok server-side libraries.
	 *
	 * @class Capabilities
	 *
	 * @property {Number} forceDisconnect Specifies whether you can call
     the <code>Session.forceDisconnect()</code> method (1) or not (0). To call the <code>Session.forceDisconnect()</code> method,
     the user must have a token that is assigned the role of moderator.
	 * @property {Number} forceUnpublish Specifies whether you can call
     the <code>Session.forceUnpublish()</code> method (1) or not (0). To call the <code>Session.forceUnpublish()</code> method,
     the user must have a token that is assigned the role of moderator.
	 * @property {Number} publish Specifies whether you can publish to the session (1) or not (0).
     The ability to publish is based on a few factors. To publish, the user must have a token that
     is assigned a role that supports publishing. There must be a connected camera and microphone.
	 * @property {Number} subscribe Specifies whether you can subscribe to streams
     in the session (1) or not (0). Currently, this capability is available for all users on all platforms.
	 * @property {Number} supportsWebRTC Whether the client supports WebRTC (1) or not (0).
	 */
	OT.Capabilities = function(permissions) {
	    this.publish = permissions.indexOf('publish') !== -1 ? 1 : 0;
	    this.subscribe = permissions.indexOf('subscribe') !== -1 ? 1 : 0;
	    this.forceUnpublish = permissions.indexOf('forceunpublish') !== -1 ? 1 : 0;
	    this.forceDisconnect = permissions.indexOf('forcedisconnect') !== -1 ? 1 : 0;
	    this.supportsWebRTC = OT.$.supportsWebRTC() ? 1 : 0;
    };

})(window);
(function(window) {

// Wraps up some common error handling for implementing callbacks
// for work requests made to the OT backend via the Messenger.
var RemoteWork = function RemoteWork (parent, success, error, options) {
  var REQUEST_TIMEOUT = 30000,
      timeoutInterval,
      exceptionCodesIndicatingFailure = {};

  var destroy = function() {
        clearTimeout(timeoutInterval);
        parent.off('exception', onException);
      },

      onException = function(event) {
        if (!exceptionCodesIndicatingFailure.hasOwnProperty(event.code)) return;

        // We don't even know if this relates to this particular forceDisconnct...
        this.failed(exceptionCodesIndicatingFailure[event.code]);
      },

      onTimeout = function() {
        var reason = options && options.timeoutMessage ? options.timeoutMessage : "Timed out while waiting for the server to respond.";
        this.failed(reason);
      };


  this.failsOnExceptionCodes = function(codes) {
    exceptionCodesIndicatingFailure = codes;
  };

  this.succeeded = function() {
    destroy();
    if (completionHandler) OT.$.callAsync(completionHandler, null);
  };

  this.failed = function(reason) {
    destroy();
    if (completionHandler) OT.$.callAsync(completionHandler, new OT.Error(null, reason));
  };

  parent.on('exception', onException, this);
  timeoutInterval = setTimeout(onTimeout.bind(this), REQUEST_TIMEOUT);
};


/**
 * The Session object returned by the <code>TB.initSession()</code> method provides access to much of the OpenTok functionality.
 *
 * @class Session
 * @augments EventDispatcher
 *
 * @property {Capabilities} capabilities A {@link Capabilities} object that includes information about the capabilities of the client.
 * All properties of the <code>capabilities</code> object are undefined until you have connected to a session
 * and the Session object has dispatched the <code>sessionConnected</code> event.
 * @property {Connection} connection The {@link Connection} object for this session. The connection property is only available once the
 * Session object dispatches the sessionConnected event. The Session object asynchronously dispatches a sessionConnected event in response
 * to a successful call to the connect() method. See: <a href="Session#connect">connect</a> and {@link Connection}.
 * @property {String} sessionId The session ID for this session. You pass this value into the <code>TB.initSession()</code> method when you create
 * the Session object. (Note: a Session object is not connected to the OpenTok server until you
 * call the connect() method of the object and the object dispatches a connected event. See {@link TB.initSession} and {@link connect}).
 * 	For more information on sessions and session IDs, see
 * <a href="/opentok/tutorials/create-session/">Session creation</a>.
 */
OT.Session = function(sessionId) {
  // Check that the client meets the minimum requirements, if they don't the upgrade
  // flow will be triggered.
  if (!OT.checkSystemRequirements()) {
      OT.upgradeSystemRequirements();
      return;
  }

  var _initialConnection = true,
      _apiKey,
      _token,
      _sessionId = sessionId,
      _socket,
      _widgetId = OT.$.uuid(),
      _analytics = new OT.Analytics(),
      _connectionId,
      _callbacks = {
        forceDisconnect: {},
        forceUnpublish: {}
      };


  OT.$.eventing(this);
  var setState = OT.$.statable(this, ['disconnected', 'connecting', 'connected', 'disconnecting'], 'disconnected');

  this.connections = new OT.Collection();
  this.streams = new OT.Collection();


	//--------------------------------------
	//  MESSAGE HANDLERS
	//--------------------------------------

	var
  // The duplication of this and sessionConnectionFailed will go away when
  // session and messenger are refactored
  sessionConnectFailed = function(reason, code) {
    setState('disconnected');

    OT.error(reason);

    this.trigger('sessionConnectFailed', reason);

    TB.handleJsException(reason, code || OT.ExceptionCodes.CONNECT_FAILED, {
      session: this
    });
  },

	sessionDisconnectedHandler = function(event) {
    var reason = event.reason;
    if(reason == "networkTimedout") {
      reason = "networkDisconnected";
      this.logEvent('Connect', 'TimeOutDisconnect', "reason", event.reason);
    } else {
      this.logEvent('Connect', 'Disconnected', "reason", event.reason);
    }

		var publicEvent = new OT.SessionDisconnectEvent('sessionDisconnected', reason);

    reset.call(this);
    disconnectComponents.call(this);

		var defaultAction = function() {
      if (!publicEvent.isDefaultPrevented()) destroyComponents.call(this, publicEvent.reason);
		}.bind(this);

		this.dispatchEvent(publicEvent, defaultAction);
	},

  connectionCreatedHandler = function(connection) {
    // We don't broadcast events for the symphony connection
    if (connection.id.match(/^symphony\./)) return;

    this.dispatchEvent(new OT.ConnectionEvent(
        OT.Event.names.CONNECTION_CREATED,
        [connection]
    ));
  },

	connectionDestroyedHandler = function(connection, reason) {
    // We don't broadcast events for the symphony connection
    if (connection.id.match(/^symphony\./)) return;

    // Don't delete the connection if it's ours. This only happens when
    // we're about to receive a session disconnected and session disconnected
    // will also clean up our connection.
    if (connection.id === _socket.id) return;

    // Handle success callbacks
    if (_callbacks.forceDisconnect[connection.id]) {
      var callback = _callbacks.forceDisconnect[connection.id];
      delete _callbacks.forceDisconnect[connection.id];


      if (reason !== 'forceDisconnected') {
        OT.warn("Expected a forceDisconnect for connection " + connection.id + ", but a " + reason + " was received instead.");
      }

      callback.succeeded();
    }

    this.dispatchEvent(
      new OT.ConnectionEvent(
        OT.Event.names.CONNECTION_DESTROYED,
        [connection],
        reason
      )
    );
	},

  streamCreatedHandler = function(stream) {
    this.dispatchEvent(new OT.StreamEvent(
      OT.Event.names.STREAM_CREATED,
      [stream]
    ));
  },

  streamPropertyModifiedHandler = function(event) {
    var stream = event.target,
        propertyName = event.changedProperty,
        newValue = event.newValue;

    if (propertyName === 'orientation') {
      propertyName = 'videoDimensions';
      newValue = {width: newValue.width, height: newValue.height};
    }

    this.dispatchEvent(new OT.StreamPropertyChangedEvent(
      OT.Event.names.STREAM_PROPERTY_CHANGED,
      stream,
      propertyName,
      event.oldValue,
      newValue
    ));
  },

	streamDestroyedHandler = function(stream, reason) {
    // Handle success callbacks
    if (_callbacks.forceUnpublish[stream.id]) {
      var callback = _callbacks.forceUnpublish[stream.id];
      delete _callbacks.forceUnpublish[stream.id];

      if (reason !== 'forceUnpublished') {
        OT.warn("Expected a forceUnpublish for stream " + stream.id + ", but a " + reason + " destroyed was received instead.");
      }

      callback.succeeded();
    }

    var event = new OT.StreamEvent('streamDestroyed', [stream], reason);

    var defaultAction = function() {
      if (!event.isDefaultPrevented()) {
        // If the stream is one of ours then we need to cleanup
        // a publisher.
        var publisher = OT.publishers.where({streamId: stream.id})[0];
        if (publisher) {
          publisher._.unpublishFromSession(this);
          publisher.destroy();
        }

        // If we are subscribed to any of the streams we should unsubscribe
        OT.subscribers.where({streamId: stream.id}).forEach(function(subscriber) {
          if (subscriber.session.id === this.id) {
            this.unsubscribe(subscriber);
          }
        }, this);
      }
		}.bind(this);

		this.dispatchEvent(event, defaultAction);
	},


	// Put ourselves into a pristine state
	reset = function() {
    _apiKey = null;
    _token = null;
    setState('disconnected');

    this.connections.destroy();
    this.streams.destroy();
	},

  disconnectComponents = function() {
    OT.publishers.where({session: this}).forEach(function(publisher) {
      publisher.disconnect();
    });

    OT.subscribers.where({session: this}).forEach(function(subscriber) {
      subscriber.disconnect();
    });
  },

  destroyComponents = function(reason) {
    OT.publishers.where({session: this}).forEach(function(publisher) {
      publisher.destroy(reason);
    });

    OT.subscribers.where({session: this}).forEach(function(subscriber) {
      subscriber.destroy(reason);
    });
  },

	connectMessenger = function() {
    TB.debug("OT.Session: connecting to Raptor");

    _socket = new OT.Raptor.Socket(_widgetId, this.sessionInfo.messagingServer);
    _socket.connect(_token, this.sessionInfo, function(error, sessionState) {
      if (error) {
        sessionConnectFailed.call(this, error.reason, error.code);
        return;
      }

      OT.debug("OT.Session: Received session state from Raptor", sessionState);

      _connectionId = this.connection.id;
      setState('connected');

      // Listen for our own connection's destroyed event so we know when we've been disconnected.
      this.connection.on('destroyed', sessionDisconnectedHandler, this);

      // Listen for connection updates
      this.connections.on({
        add: connectionCreatedHandler,
        remove: connectionDestroyedHandler
      }, this);

      // Listen for stream updates
      this.streams.on({
        add: streamCreatedHandler,
        remove: streamDestroyedHandler,
        update: streamPropertyModifiedHandler
      }, this);

      this.dispatchEvent(new OT.SessionConnectEvent(
        OT.Event.names.SESSION_CONNECTED,
        sessionState.connections,
        sessionState.streams,
        sessionState.archives
      ));
    }.bind(this));
	},

  getSessionInfo = function() {
    if (this.is('connecting')) {
      OT.SessionInfo.get(
        this,
        onSessionInfoResponse.bind(this),
        function(error) {
          sessionConnectFailed.call(this, error.message + (error.code ? ' (' + error.code + ')' : ''));
        }.bind(this)
      );
    }
  },

  onSessionInfoResponse = function(sessionInfo) {
    if (this.is('connecting')) {
      this.sessionInfo = sessionInfo;
      if (this.sessionInfo.partnerId && this.sessionInfo.partnerId != _apiKey) {
          _apiKey = this.sessionInfo.partnerId;

          var reason = 'Authentication Error: The apiKey passed into the session.connect ' +
            'method does not match the apiKey in the token or session you are trying to ' +
            'connect to.';

          this.logEvent('Connect', 'Failure', 'reason', 'GetSessionInfo:' +
            OT.ExceptionCodes.AUTHENTICATION_ERROR + ':' + reason);

          sessionConnectFailed.call(this, reason, OT.ExceptionCodes.AUTHENTICATION_ERROR);
      } else {
          connectMessenger.call(this);
      }
    }
  },

  // Check whether we have permissions to perform the action.
  permittedTo = function(action) {
      return _socket && _socket.permittedTo(action);
  };

  this.logEvent = function(action, variation, payload_type, payload) {
    var event = {
      action: action,
      variation: variation,
      payload_type: payload_type,
      payload: payload,
      session_id: _sessionId,
      partner_id: _apiKey,
      widget_id: _widgetId,
      widget_type: 'Controller'
    };
    if (this.connection && this.connection.id) event.connection_id = this.connection.id;
    else if (_connectionId) event.connection_id = _connectionId;
    _analytics.logEvent(event);
  };

 /**
 * Connects to an OpenTok session. Pass your API key as the <code>apiKey</code> parameter. You get an API key when you
 * <a href="https://dashboard.tokbox.com/users/sign_in">sign up</a> for an OpenTok account. Pass a token string as
 * the <code>token</code> parameter. You generate a token using the
 * <a href="/opentok/api/tools/documentation/api/server_side_libraries.html">OpenTok server-side libraries</a>
 * or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page. For more information, see
 * <a href="/opentok/tutorials/create-token/">Connection token creation</a>.
 *  <p>
 *  	Upon a successful connection, the Session object dispatches a <code>sessionConnected</code> event. Call the
 * <code>addEventListener()</code> method to set up an event listener to process this event before calling other methods of the Session object.
 *  </p>
 *  <p>
 *  	The Session object dispatches a <code>connectionCreated</code> event when other clients create connections to the session.
 *  </p>
 *  <p>
 *  	The TB object dispatches an <code>exception</code> event if the session ID,
 *    API key, or token string are invalid. See <a href="ExceptionEvent.html">ExceptionEvent</a>
 *    and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
 *  </p>
 *  <p>
 *  	The application throws an error if the system requirements are not met
 *    (see <a href="TB.html#checkSystemRequirements">TB.checkSystemRequirements()</a>).
 *  </p>
 *
 *  <h5>
 *  Example
 *  </h5>
 *  <p>
 *  The following code initializes a session and sets up an event listener for when the session connects:
 *  </p>
 *  <pre>
 *  var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
 *  var sessionID = ""; // Replace with your own session ID.
 *                      // See https://dashboard.tokbox.com/projects
 *  var token = ""; // Replace with a generated token that has been assigned the moderator role.
 *                  // See https://dashboard.tokbox.com/projects
 *
 *  var session = TB.initSession(sessionID);
 *  session.addEventListener("sessionConnected", sessionConnectHandler);
 *  session.connect(apiKey, token);
 *
 *  function sessionConnectHandler(sessionConnectEvent) {
 *      //
 *  }
 *  </pre>
 *  <p>
 *  <p>
 *  	In this example, the <code>sessionConnectHandler()</code> function is passed an event object of type {@link SessionConnectEvent}.
 *  </p>
 *
 *  <h5>
 *  Events dispatched:
 *  </h5>
 *
 *  <p>
 *  	<code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151; Dispatched by the TB class
 *  	locally in the event of an error.
 *  </p>
 *  <p>
 *  	<code>connectionCreated</code> (<a href="ConnectionEvent.html">ConnectionEvent</a>) &#151;
 *      Dispatched by the Session object on all clients connected to the session.
 *  </p>
 *  <p>
 *  	<code>sessionConnected</code> (<a href="SessionConnectEvent.html">SessionConnectEvent</a>) &#151;
 *      Dispatched locally by the Session object when the connection is established.
 *  </p>
 *
  * @param {String} apiKey The API key that TokBox provided you when you registered for the OpenTok API.
  *
  * @param {String} token The session token. You generate a session token using our
  * <a href="/opentok/libraries/server/">server-side libraries</a> or the
  * <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page. For more information, see
  * <a href="/opentok/tutorials/create-token/">Connection token creation</a>.
  *
  * @method #connect
  * @memberOf Session
  */
  this.connect = function(apiKey, token, completionHandler) {
    if (this.is('connecting', 'connected')) {
      OT.warn("OT.Session: Cannot connect, the session is already " + this.state);
      return;
    }

    reset.call(this);
    setState('connecting');
    _token = token;

    // Get a new widget ID when reconnecting.
    if (_initialConnection) {
      _initialConnection = false;
    } else {
      _widgetId = OT.$.uuid();
    }

    _apiKey = apiKey.toString();

    // Ugly hack, make sure OT.APIKEY is set
    if (OT.APIKEY.length === 0) {
        OT.APIKEY = _apiKey;
    }

    if (completionHandler && OT.$.isFunction(completionHandler)) {
      this.once(OT.Event.names.SESSION_CONNECTED, completionHandler.bind(null, null));
      this.once('sessionConnectFailed', completionHandler);
    }

    var analyticsPayload = [
      navigator.userAgent, OT.properties.version,
      window.externalHost ? 'yes' : 'no'
    ];
    this.logEvent( 'Connect', 'Attempt',
      'userAgent|sdkVersion|chromeFrame',
      analyticsPayload.map(function(e) { return e.replace('|', '\\|'); }).join('|')
    );

    getSessionInfo.call(this);
  };

 /**
  * Disconnects from the OpenTok session.
  *
  * <p>
  * Calling the <code>disconnect()</code> method ends your connection with the session. In the course of terminating your connection,
  * it also ceases publishing any stream(s) you were publishing.
  * </p>
  * <p>
  * Session objects on remote clients dispatch <code>streamDestroyed</code> events for any stream you were publishing.
  * The Session object dispatches a <code>sessionDisconnected</code> event locally. The Session objects on remote clients dispatch
  * <code>connectionDestroyed</code> events, letting other connections know you have left the session. The {@link SessionDisconnectEvent}
  * and {@link StreamEvent} objects that define the <code>sessionDisconnect</code> and <code>connectionDestroyed</code> events each have
  * a <code>reason</code> property. The <code>reason</code> property lets the developer determine whether the connection is being
  * terminated voluntarily and whether any streams are being destroyed as a byproduct of the underlying connection's voluntary destruction.
  * </p>
  * <p>
  * If the session is not currently connected, calling this method causes a warning to be logged.
  * See <a "href=TB.html#setLogLevel">TB.setLogLevel()</a>.
  * </p>
  *
  * <p>
  * <i>Note:</i> If you intend to reuse a Publisher object created using <code>TB.initPublisher()</code>
  * to publish to different sessions sequentially, call either <code>Session.disconnect()</code> or
  * <code>Session.unpublish()</code>. Do not call both. Then call the <code>preventDefault()</code> method
  * of the <code>streamDestroyed</code> or <code>sessionDisconnected</code> event object to prevent the
  * Publisher object from being removed from the page. Be sure to call <code>preventDefault()</code> only
  * if the <code>connection.connectionId</code> property of the Stream object in the event matches the
  * <code>connection.connectionId</code> property of your Session object (to ensure that you are preventing
  * the default behavior for your published streams, not for other streams that you subscribe to).
  * </p>
  *
  * <h5>
  * Events dispatched:
  * </h5>
  * <p>
  * <code>sessionDisconnected</code> (<a href="SessionDisconnectEvent.html">SessionDisconnectEvent</a>)
  * &#151; Dispatched locally when the connection is disconnected.
  * </p>
  * <p>
  * <code>connectionDestroyed</code> (<a href="ConnectionEvent.html">ConnectionEvent</a>) &#151;
  * Dispatched on other connections, along with the <code>streamDestroyed</code> event (as warranted).
  * </p>
  *
  * <p>
  * <code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  * Dispatched if streams are lost as a result of the session disconnecting.
  * </p>
  *
  * @method #disconnect
  * @memberOf Session
  */
  this.disconnect = function() {
    if (_socket && _socket.isNot('disconnected')) {
      setState('disconnecting');
      _socket.disconnect();
    }
    else {
      reset.call(this);
    }
  };

  this.destroy = function(reason, quiet) {
    this.streams.destroy();
    this.connections.destroy();
    this.disconnect();
  };

 /**
  * The <code>publish()</code> method starts publishing an audio-video stream to the session.
  * The audio-video stream is captured from a local microphone and webcam. Upon successful publishing,
  * the Session objects on all connected clients dispatch the <code>streamCreated</code> event.
  * </p>
  *
  * <!--JS-ONLY-->
  * <p>You pass a Publisher object as the one parameter of the method. You can initialize a Publisher object by calling the
  * <a href="TB.html#initPublisher">TB.initPublisher()</a> method. Before calling <code>Session.publish()</code>.
  * </p>
  *
  * <p>This method takes an alternate form: <code>publish([targetElement:String, properties:Object]):Publisher</code> &#151;
  * In this form, you do <i>not</i> pass a Publisher object into the function. Instead, you pass in a <code>targetElement</code>
  * (the ID of the DOM element that the Publisher will replace) and a <code>properties</code> object that defines
  * options for the Publisher (see <a href="TB.html#initPublisher">TB.initPublisher()</a>.) The method
  * returns a new Publisher object, which starts sending an audio-video stream to the session.
  * The remainder of this documentation describes the form that takes a single Publisher object as a parameter.
  *
  * <p>
  * 	A local display of the published stream is created on the web page by replacing
  *         the specified element in the DOM with a streaming video display. The video stream
  *         is automatically mirrored horizontally so that users see themselves and movement
  *         in their stream in a natural way. If the width and height of the display do not match
  *         the 4:3 aspect ratio of the video signal, the video stream is cropped to fit the display.
  * </p>
  *
  * <p>
  * 	If calling this method creates a new Publisher object and the OpenTok library does not have access to
  * 	the camera or microphone, the web page alerts the user to grant access to the camera and microphone.
  * </p>
  *
  * <p>
  * The TB object dispatches an <code>exception</code> event if the user's role does not
  * include permissions required to publish. For example, if the user's role is set to subscriber,
  * then they cannot publish. You define a user's role when you create the user token using the <code>generate_token()</code> method
  * of our <a href="/opentok/libraries/server/">server-side libraries</a> or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page.
  * You pass the token string as a parameter of the <code>connect()</code> method of the Session object.
  * See <a href="ExceptionEvent.html">ExceptionEvent</a> and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
  * </p>
  *     <p>
  *     The application throws an error if the session is not connected.
  *     </p>
  *
  * <h5>Events dispatched:</h5>
  * <p>
  * <code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151; Dispatched by the TB object. This
  * can occur when user's role does not allow publishing (the <code>code</code> property of event object is set to 1500);
  * it can also occur if the connection fails to connect (the <code>code</code> property of event object is set to 1013).
  * WebRTC is a peer-to-peer protocol, and it is possible that connections will fail to connect. The most common cause
  * for failure is a firewall that the protocol cannot traverse.</li>
  * </p>
  * <p>
  * <code>streamCreated</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  * The stream has been published. The Session object dispatches this on all clients
  * subscribed to the stream, as well as on the publisher's client.
  * </p>
  *
  * <h5>Example</h5>
  *
  * <p>
  * 	The following example publishes a video once the session connects:
  * </p>
  * <pre>
  * var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  * var sessionId = ""; // Replace with your own session ID.
  *                     // See https://dashboard.tokbox.com/projects
  * var token = ""; // Replace with a generated token that has been assigned the moderator role.
  *                 // See https://dashboard.tokbox.com/projects
  * var session = TB.initSession(sessionID);
  * session.addEventListener("sessionConnected", sessionConnectHandler);
  * session.connect(apiKey, token);
  *
  * function sessionConnectHandler(event) {
  *     var divProps = {width: 400, height:300, name:"Bob's stream"};
  *     publisher = TB.initPublisher(apiKey, 'publisher', divProps);
  *                       // This assumes that there is a DOM element with the ID 'publisher'.
  *     session.publish(publisher);
  * }
  * </pre>
  *
  * @param publisher A Publisher object, which you initialize by calling the <a href="TB.html#initPublisher">TB.initPublisher()</a>
  * method.
  *
  * @returns The Publisher object for this stream.
  *
  * @method #publish
  * @memberOf Session
  */
  this.publish = function(publisher, properties, completionHandler) {
    var errorMsg;

    if (this.isNot('connected')) {
      _analytics.logError(1010, 'tb.exception', "We need to be connected before you can publish", null, {
        action: 'publish',
        variation: 'Failure',
        payload_type: "reason",
        payload: "We need to be connected before you can publish",
        session_id: _sessionId,
        partner_id: _apiKey,
        widgetId: _widgetId,
        widget_type: 'Controller'
      });

      if (completionHandler && OT.$.isFunction(completionHandler)) {
        errorMsg = "We need to be connected before you can publish";
        OT.$.callAsync(completionHandler, new OT.Error(OT.ExceptionCodes.NOT_CONNECTED, errorMsg));
      }

      return null;
    }

    if (!permittedTo("publish")) {
      this.logEvent('publish', 'Failure', 'reason', 'This token does not allow publishing. The role must be at least `publisher` to enable this functionality');

      TB.handleJsException("This token does not allow publishing. The role must be at least `publisher` to enable this functionality", OT.ExceptionCodes.UNABLE_TO_PUBLISH, {
        session: this
      });
      return null;
    }

    // If the user has passed in an ID of a element then we create a new publisher.
    if (!publisher || typeof(publisher)==='string' || publisher.nodeType == Node.ELEMENT_NODE){
      // Initiate a new Publisher with the new session credentials
     publisher = OT.initPublisher(this.apiKey, publisher, properties);
    }
    else if (publisher instanceof OT.Publisher){

      // If the publisher already has a session attached to it we can
      if( "session" in publisher && publisher.session && "sessionId" in publisher.session ){
        // send a warning message that we can't publish again.
        if( publisher.session.sessionId === this.sessionId){
          OT.warn("Cannot publish " + publisher.guid + " again to " + this.sessionId + ". Please call session.unpublish(publisher) first.");
        }
        else {
          OT.warn("Cannot publish " + publisher.guid + " publisher already attached to " + publisher.session.sessionId+ ". Please call session.unpublish(publisher) first.");
        }
      }
    }
    else {
      errorMsg = "Session.publish :: First parameter passed in is neither a string nor an instance of the Publisher";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (completionHandler && OT.$.isFunction(completionHandler)) publisher.once('publishComplete', completionHandler);

    // Add publisher reference to the session
    publisher._.publishToSession(this);

    // return the embed publisher
    return publisher;
  };

 /**
  * Ceases publishing the specified publisher's audio-video stream
  * to the session. By default, the local representation of the audio-video stream is removed from the
  * web page.< Upon successful termination, the Session object on every connected
  * web page dispatches
  * a <code>streamDestroyed</code> event.
  * </p>
  *
  * <p>
  * To prevent the Publisher from being removed from the DOM, add an event listener for the
  * <code>streamDestroyed</code> event and call the <code>preventDefault()</code> method of the event object.
  * </p>
  *
  * <p>
  * <i>Note:</i> If you intend to reuse a Publisher object created using <code>TB.initPublisher()</code>
  * to publish to different sessions sequentially, call either <code>Session.disconnect()</code> or
  * <code>Session.unpublish()</code>. Do not call both. Then call the <code>preventDefault()</code> method
  * of the <code>streamDestroyed</code> or <code>sessionDisconnected</code> event object to prevent the
  * Publisher object from being removed from the page. Be sure to call <code>preventDefault()</code> only
  * if the <code>connection.connectionId</code> property of the Stream object in the event matches the
  * <code>connection.connectionId</code> property of your Session object (to ensure that you are preventing
  * the default behavior for your published streams, not for other streams that you subscribe to).
  * </p>
  *
  * <h5>Events dispatched:</h5>
  *
  * <p>
  * <code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  * The stream associated with the Publisher has been destroyed. Dispatched on
  * the Publisher's browser and on the browser for all connections subscribing
  * to the publisher's stream.
  *                </p>
  *
  * <h5>Example</h5>
  *
  * The following example publishes a stream to a session and adds a Disconnect link to the web page. Clicking this link causes the stream to stop being published.
  *
  * <pre>
  * &lt;script&gt;
  *     var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  *     var sessionID = ""; // Replace with your own session ID.
  *                      // See https://dashboard.tokbox.com/projects
  *     var token = "Replace with the TokBox token string provided to you."
  *     var session = TB.initSession(sessionID);
  *     session.addEventListener("sessionConnected", sessionConnectHandler);
  *     session.connect(apiKey, token);
  *     var publisher;
  *
  *     function sessionConnectHandler(event) {
  *         publisher = TB.initPublisher(apiKey, 'publisher');
  *                         // This assumes that there is a DOM element with the ID 'publisher'.
  *         session.publish(publisher);
  *     }
  *     function unpublsh() {
  *         session.unpublish(publisher);
  *     }
  * &lt;/script&gt;
  *
  * &lt;body&gt;
  *
  *     &lt;div id="publisherContainer/&gt;
  *     &lt;br/&gt;
  *
  *     &lt;a href="javascript:unpublish()"&gt;Stop Publishing&lt;/a&gt;
  *
  * &lt;/body&gt;
  *
  * </pre>
  *
  * @see <a href="#publish">publish()</a>
  *
  * @see <a href="StreamEvent.html">streamDestroyed event</a>
  *
  * @param {Publisher} publisher</span> The Publisher object to stop streaming.
  *
  * @method #unpublish
  * @memberOf Session
  */
  this.unpublish = function(publisher) {
    if (!publisher) {
      OT.error('OT.Session.unpublish: publisher parameter missing.');
      return;
    }

    // Unpublish the localMedia publisher
    publisher._.unpublishFromSession(this);
  };


 /**
  * Subscribes to a stream that is available to the session. You can get an array of
  * available streams from the <code>streams</code> property of the <code>sessionConnected</code>
  * and <code>streamCreated</code> events (see <a href="SessionConnectEvent.html">SessionConnectEvent</a> and
  * <a href="StreamEvent.html">StreamEvent</a>).
  * </p>
  * <p>
  * The subscribed stream is displayed on the local web page by replacing the specified element in the DOM with a streaming video display.
  * If the width and height of the display do not match the 4:3 aspect ratio of the video signal, the video stream is cropped to fit
  * the display. If the stream lacks a video component, a blank screen with an audio indicator is displayed in place of the video stream.
  * </p>
  *
  * <p>
  * The application throws an error if the session is not connected<!--JS-ONLY--> or if the
  * <code>targetElement</code> does not exist in the HTML DOM<!--/JS-ONLY-->.
  * </p>
  *
  * <h5>Example</h5>
  *
  * The following code subscribes to available streams at the time that a session is connected
  *
  * <pre>
  * var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  * var sessionID = ""; // Replace with your own session ID.
  *                     // See https://dashboard.tokbox.com/projects
  *
  * var session = TB.initSession(sessionID);
  * session.addEventListener("sessionConnected", sessionConnectHandler);
  * session.connect(apiKey, token);
  *
  * function sessionConnectHandler(event) {
  *     for (var i = 0; i &lt; event.streams.length; i++) {
  *         var stream = event.streams[i];
  *         displayStream(stream);
  *     }
  * }
  *
  * function displayStream(stream) {
  *     var div = document.createElement('div');
  *     div.setAttribute('id', 'stream' + stream.streamId);
  *     var streamsContainer = document.getElementById('streamsContainer');
  *     streamsContainer.appendChild(div);
  *     subscriber = session.subscribe(stream, 'stream' + stream.streamId);
  * }
  * </pre>
  * <p>
  * You can also add an event listener for the <code>streamCreated</code> event. The Session object dispatches this event when a new stream is created.
  * </p>
  * <pre>
  * session.addEventListener("streamCreated", streamCreatedHandler);
  *
  * function streamCreatedHandler(event) {
  *     for (var i = 0; i &lt; event.streams.length; i++) {
  *         var stream = event.streams[i];
  *         displayStream(stream);
  *     }
  * }
  * </pre>
  *
  * @param {Stream} stream The Stream object representing the stream to which we are trying to subscribe.
  *
  * @param {String} targetElement The ID of the existing DOM element
  * that the Subscriber replaces. If you do not specify a <code>targetElement</code>, the application
  * appends a new DOM element to the HTML <code>body</code>.
  *
  * @param {Object} properties This is an object that contains the following properties:
  *    <ul>
  *       <li><code>audioVolume</code> (Number) &#151; The desired audio volume, between 0 and 100, when the Subscriber
  *       is first opened (default: 50). After you subscribe to the stream, you can adjust the volume by calling
  *       the <a href="Subscriber.html#setAudioVolume"><code>setAudioVolume()</code> method</a> of the Subscriber
  *       object. This volume setting affects local playback only; it does not affect the stream's volume on other
  *       clients.</li>
  *
  *       <li><code>height</code> (Number) &#151; The desired height, in pixels, of the
  *        displayed Subscriber video stream (default: 198). <i>Note:</i> Use the
  *       <code>height</code> and <code>width</code> properties to set the dimensions
  *       of the Subscriber video; do not set the height and width of the DOM element
  *       (using CSS).</li>
  *
  *       <li><code>style.nameDisplayMode</code> (String) &#151; This property determines whether to display the
  *       stream name. Possible values are: <code>"auto"</code> (the name is displayed when the stream is first
  *       displayed and when the user mouses over the display), <code>"off"</code> (the name is not displayed),
  *       and <code>"on"</code> (the name is displayed).</li>
  *
  *       <li><code>subscribeToAudio</code> (Boolean) &#151; Whether to initially subscribe to audio
  *       (if available) for the stream (default: <code>true</code>).</li>
  *
  *       <li><code>subscribeToVideo</code> (Boolean) &#151; Whether to initially subscribe to video
  *       (if available) for the stream (default: <code>true</code>).</li>
  *
  *       <li><code>width</code> (Number) &#151; The desired width, in pixels, of the
  *       displayed Subscriber video stream (default: 264). <i>Note:</i> Use the
  *       <code>height</code> and <code>width</code> properties to set the dimensions
  *        of the Subscriber video; do not set the height and width of the DOM element
  *       (using CSS).</li>
  *
  *    </ul>
  *
  * @signature subscribe(stream, targetElement, properties)
  * @returns {Subscriber} The Subscriber object for this stream. Stream control functions are exposed through the Subscriber object.
  * @method #subscribe
  * @memberOf Session
  */
  this.subscribe = function(stream, targetElement, properties, completionHandler) {
    var errorMsg;

    if (!this.connection || !this.connection.connectionId) {
      errorMsg = "Session.subscribe :: Connection required to subscribe";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!stream) {
      errorMsg = "Session.subscribe :: stream cannot be null";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!stream.hasOwnProperty("streamId")) {
      errorMsg = "Session.subscribe :: invalid stream object";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    var subscriber = new OT.Subscriber(targetElement, OT.$.extend(properties || {}, {
        session: this
    }));

    if (completionHandler && OT.$.isFunction(completionHandler)) subscriber.once('subscribeComplete', completionHandler);

    OT.subscribers.add(subscriber);
    subscriber.subscribe(stream);

    return subscriber;
  };

 /**
  * Stops subscribing to a stream in the session. the display of the audio-video stream is removed from the local web page.
  *
  * <h5>Example</h5>
  * <p>
  * The following code subscribes to available streams at the time that a session is connected. For each stream, the code also
  * adds an Unsubscribe link.
  * </p>
  * <pre>
  * var apiKey = ""; // Replace with your API key. See https://dashboard.tokbox.com/projects
  * var sessionID = ""; // Replace with your own session ID.
  *                     // See https://dashboard.tokbox.com/projects
  * var streams = [];
  *
  * var session = TB.initSession(sessionID);
  * session.addEventListener("sessionConnected", sessionConnectHandler);
  * session.connect(apiKey, token);
  *
  * function sessionConnectHandler(event) {
  *     for (var i = 0; i &lt; event.streams.length; i++) {
  *         var stream = event.streams[i];
  *         displayStream(stream);
  *     }
  * }
  *
  * function displayStream(stream) {
  *     var div = document.createElement('div');
  *     div.setAttribute('id', 'stream' + stream.streamId);
  *
  *
  *
  *     var subscriber = session.subscribe(stream, 'stream' + stream.streamId);
  *     subscribers.push(subscriber);
  *
  *
  *     var aLink = document.createElement('a');
  *     aLink.setAttribute('href', 'javascript: unsubscribe("' + subscriber.id + '")');
  *     aLink.innerHTML = "Unsubscribe";
  *
  *     var streamsContainer = document.getElementById('streamsContainer');
  *     streamsContainer.appendChild(div);
  *     streamsContainer.appendChild(aLink);
  *
  *     streams = event.streams;
  * }
  *
  * function unsubscribe(subscriberId) {
  *     console.log("unsubscribe called");
  *     for (var i = 0; i &lt; subscribers.length; i++) {
  *         var subscriber = subscribers[i];
  *         if (subscriber.id == subscriberId) {
  *             session.unsubscribe(subscriber);
  *         }
  *     }
  * }
  * </pre>
  *
  * @param {Subscriber} subscriber The Subscriber object to unsubcribe.
  *
  * @see <a href="#subscribe">subscribe()</a>
  *
  * @method #unsubscribe
  * @memberOf Session
  */
  this.unsubscribe = function(subscriber) {
    if (!subscriber) {
      var errorMsg = "OT.Session.unsubscribe: subscriber cannot be null";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!subscriber.stream) {
        OT.warn("OT.Session.unsubscribe:: tried to unsubscribe a subscriber that had no stream");
        return false;
    }

    OT.debug("OT.Session.unsubscribe: subscriber " + subscriber.id);

    subscriber.destroy();

    return true;
  };

 /**
  * Returns an array of local Subscriber objects for a given stream.
  *
  * @param {Stream} stream The stream for which you want to find subscribers.
  *
  * @returns {Array} An array of {@link Subscriber} objects for the specified stream.
  *
  * @see <a href="#unsubscribe">unsubscribe()</a>
  * @see <a href="Subscriber.html">Subscriber</a>
  * @see <a href="StreamEvent.html">StreamEvent</a>
  * @method #getSubscribersForStream
  * @memberOf Session
  */
  this.getSubscribersForStream = function(stream) {
    return OT.subscribers.where({streamId: stream.id});
  };

 /**
  * Returns the local Publisher object for a given stream.
  *
  * @param {Stream} stream The stream for which you want to find the Publisher.
  *
  * @returns {Publisher} A Publisher object for the specified stream. Returns <code>null</code> if there is no local Publisher object
  * for the specified stream.
  *
  * @see <a href="#forceUnpublish">forceUnpublish()</a>
  * @see <a href="Subscriber.html">Subscriber</a>
  * @see <a href="StreamEvent.html">StreamEvent</a>
  *
  * @method #getPublisherForStream
  * @memberOf Session
  */
  this.getPublisherForStream = function(stream) {
    var streamId;

    if (typeof(stream) == "string") {
      streamId = stream;
    } else if (typeof(stream) == "object" && stream && stream.hasOwnProperty("id")) {
      streamId = stream.id;
    } else {
      errorMsg = "Session.getPublisherForStream :: Invalid stream type";
      OT.error(errorMsg);
      throw new Error(errorMsg);
    }

    return OT.publishers.where({streamId: streamId})[0];
  };


  // Private Session API: for internal OT use only
  this._ = {
    jsepSubscribe: function(stream, subscribeToVideo, subscribeToAudio) {
      return _socket.jsepSubscribe(stream.connection.id, stream.id, subscribeToVideo, subscribeToAudio);
    }.bind(this),

    jsepUnsubscribe: function(stream) {
      return _socket.jsepUnsubscribe(stream.connection.id, stream.id);
    }.bind(this),

    jsepCandidate: function(toConnectionId, stream, candidate) {
      return _socket.jsepCandidate(toConnectionId, stream.id, candidate);
    }.bind(this),

    jsepOffer: function(toConnectionId, stream, offerSDP) {
      return _socket.jsepOffer(toConnectionId, stream.id, offerSDP);
    }.bind(this),

    jsepAnswer: function(toConnectionId, stream, answerSDP) {
      return _socket.jsepAnswer(toConnectionId, stream.id, answerSDP);
    }.bind(this),

    // session.on("signal", function(SignalEvent))
    // session.on("signal:{type}", function(SignalEvent))
    dispatchSignal: function(fromConnection, type, data) {
      var event = new OT.SignalEvent(type, data, fromConnection);
      event.target = this;

      // signal a "signal" event
      // NOTE: trigger doesn't support defaultAction, and therefore preventDefault.
      this.trigger(OT.Event.names.SIGNAL, event);

      // signal an "signal:{type}" event" if there was a custom type
      if (type) this.dispatchEvent(event);
    }.bind(this),

    modifySubscriber: function(subscriber, key, value) {
      return _socket.modifySubscriber(subscriber, key, value);
    }.bind(this),

    createStream: function(publisherId, name, orientation, encodedWidth, encodedHeight, hasAudio, hasVideo) {
      _socket.createStream(publisherId, name, orientation, encodedWidth, encodedHeight, hasAudio, hasVideo);
    }.bind(this),

    modifyStream: function(streamId, key, value) {
      if (!streamId || !key || value === void 0) {
        OT.error('OT.Session.modifyStream: must provide streamId, key and value to modify a stream property.');
        return;
      }

      _socket.updateStream(streamId, key, value);
    }.bind(this),

    destroyStream: function(streamId) {
      _socket.destroyStream(streamId);
    }.bind(this)
  };


 /**
  * Sends a signal to each client or specified clients in the session. Specify a <code>connections</code> property
  * of the <code>signal</code> parameter to limit the recipients of the signal; otherwise the signal is sent to
  * each client connected to the session.
  * <p>
  * The following example sends a signal of type "foo" with a specified data payload to all clients connected to
  * the session:
  * <pre>
  * session.signal({
  *     type: "foo",
  *     data: {messageString:"hello", scores:[7, 14, 23]},
  *   },
  *   function(error) {
  *     if (error) {
  *       console.log("signal error: " + error.reason);
  *     } else {
  *       console.log("signal sent");
  *     }
  *   }
  * );
  * </pre>
  * <p>
  * Calling this method without limiting the set of recipient clients will result in multiple signals sent (one to
  * each client in the session). For information on charges for signaling, see the <a href="http://tokbox.com/pricing">OpenTok
  * pricing</a> page.
  * <p>
  * The following example sends a signal of type "foo" with a specified data payload to two specific clients
  * connected to the session:
  * <pre>
  * session.signal({
  *     type: "foo",
  *     to: [connection1, connection2]; // connection1 and 2 are Connection objects
  *     data: {messageString:"hello"}
  *   },
  *   function(error) {
  *     if (error) {
  *       console.log("signal error: " + error.reason);
  *     } else {
  *       console.log("signal sent");
  *     }
  *   }
  * );
  * </pre>
  * <p>
  * Each of the properties of the object you pass into the <code>signal()</code> method is optional.
  * <p>
  * Add an event handler for the <code>signal</code> event to listen for all signals sent in the session.
  * Add an event handler for the <code>signal:type</code> event to listen for signals of a specified type
  * only (replace <code>type</code>, in <code>signal:type</code>, with the type of signal to listen for). The
  * Session object dispatches these events. (See <a href="#events">events</a>.)
  * <p>
  * Each property is optional. If you set none of the properties, you will send a signal with no data or type to
  * each client connected to the session.</p>
  *
  * @param {Object} signal An object that contains the following properties defining the signal:
  * <ul>
  *   <li><code>to</code> &mdash; (Array) An array of <a href="Connection.html">Connection</a> objects, corresponding
  *      to clients that the message is to be sent to. If you do not specify this property, the signal is sent to all
  *      clients connected to the session.</li>
  *   <li><code>data</code> &mdash; (Object) The data to send. Valid types for data are a JSON-parsable object,
  *     a JSON-parsable array, a string, a number, a Boolean value, or <code>null</code>. Numbers cannot be NaN or Infinity.
  *     The limit to the size of data is 8kB.</li>
  *   <li><code>type</code> &mdash; (String) The type of the signal. You can use the type to filter signals when setting an
  *     event handler for the <code>signal:type</code> event (where you replace <code>type</code> with the type string).
  *     The maximum length of the <code>type</code> string is 128 characters, and it must contain only letters (A-Z and a-z),
  *     numbers (0-9), '-', '_', and '~'.</li>
  *   </li>
  * </ul>
  *
  * <p>Each property is optional. If you set none of the properties, you will send a signal with no data or type to
  * each client connected to the session.</p>
  *
  * @param {Function} completionHandler A function that is called when sending the signal succeeds or fails. This
  * function takes one parameter, <code>error</code>, which is set to <code>null</code> if sending the signal succeeds;
  * otherwise the <code>error</code> object has the following properties:
  *
  * <ul>
  *   <li><code>code</code> &mdash; (Number) An error code, which can be one of the following:
  *     <table style="width:100%">
  *         <tr>
  *           <td>400</td> <td>One of the signal properties &mdash; data, type, or to &mdash; is invalid.
  *                         Or the data cannot be parsed as JSON.</td>
  *         </tr>
  *         <tr>
  *           <td>404</td> <td>The to connection does not exist.</td>
  *         </tr>
  *         <tr>
  *           <td>413</td> <td>The type string exceeds the maximum length (128 characters),
  *                        or the data property exceeds the maximum size (8kB).</td>
  *         </tr>
  *         <tr>
  *           <td>500</td> <td>The WebSocket connection is down.</td>
  *         </tr>
  *      </table>
  *   </li>
  *   <li><code>reason</code> &mdash; (String) A description of the error.</li>
  *   <li><code>signal</code> &mdash; (Object) An object with properties corresponding to the values passed
  *     into the <code>signal()</code> method &mdash; <code>data</code>, <code>to</code>, and <code>type</code>.
  *   </li>
  * </ul>
  *
  * <p>Note that the <code>completionHandler</code> success result (<code>error == null</code>) indicates that the
  * options passed into the <code>Session.signal()</code> method are valid and the signal was sent. It does
  * <i>not</i> indicate that the signal was successfully received by any of the intended recipients.
  *
  * @method #signal
  * @memberOf Session
  * @see <a href="#event:signal">signal</a> and <a href="#event:signal:type">signal:type</a> events
  */
  this.signal = function(options, completion) {
    _socket.signal(options, completion);
  };

 /**
  * 	Forces a remote connection to leave the session.
  *
  * <p>
  * 	The <code>forceDisconnect()</code> method is normally used as a moderation tool
  *        to remove users from an ongoing session.
  * </p>
  * <p>
  * 	When a connection is terminated using the <code>forceDisconnect()</code>,
  *        <code>sessionDisconnected</code>, <code>connectionDestroyed</code> and
  *        <code>streamDestroyed</code> events are dispatched in the same way as they
  *        would be if the connection had terminated itself using the <code>disconnect()</code> method. However,
  *        the <code>reason</code> property of a {@link ConnectionEvent} or {@link StreamEvent} object specifies
  *        <code>"forceDisconnected"</code> as the reason for the destruction of the connection and stream(s).
  * </p>
  * <p>
  * 	While you can use the <code>forceDisconnect()</code> method to terminate your own connection,
  *        calling the <code>disconnect()</code> method is simpler.
  * </p>
  * <p>
  * 	The TB object dispatches an <code>exception</code> event if the user's role
  * 	does not include permissions required to force other users to disconnect.
  *        You define a user's role when you create the user token using the <code>generate_token()</code>
  *        method using our <a href="/opentok/libraries/server/">server-side libraries</a> or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page.
  * 	See <a href="ExceptionEvent.html">ExceptionEvent</a> and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
  * </p>
  * <p>
  * 	The application throws an error if the session is not connected.
  * </p>
  *
  * <h5>Events dispatched:</h5>
  *
  * <p>
  * 	<code>connectionDestroyed</code> (<a href="ConnectionEvent.html">ConnectionEvent</a>) &#151;
  *     On clients other than which had the connection terminated.
  * </p>
  * <p>
  * 	<code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151;
  *     The user's role does not allow forcing other user's to disconnect (<code>event.code = 1530</code>),
  * 	or the specified stream is not publishing to the session (<code>event.code = 1535</code>).
  * </p>
  * <p>
  * 	<code>sessionDisconnected</code> (<a href="SessionDisconnectEvent.html">SessionDisconnectEvent</a>) &#151;
  *     On the client which has the connection terminated.
  * </p>
  * <p>
  * 	<code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  *     If streams are stopped as a result of the connection ending.
  * </p>
  *
  * @param {Connection} connection The connection to be disconnected from the session.
  * This value can either be a <a href="Connection.html">Connection</a> object or a connection ID (which can be
  * obtained from the <code>connectionId</code> property of the Connection object).
  *
  * @method #forceDisconnect
  * @memberOf Session
  */

  this.forceDisconnect = function(connectionOrConnectionId, completionHandler) {
    var notPermittedErrorMsg = "This token does not allow forceDisconnect. The role must be at least `moderator` to enable this functionality";

    if (permittedTo("forceDisconnect")) {
      var connectionId = typeof(connectionOrConnectionId) === 'string' ? connectionOrConnectionId : connectionOrConnectionId.id;

      if (completionHandler) {
        var work = new RemoteWork(this, completionHandler, {
          timeoutMessage: "Timed out while waiting for connection " + connectionId + " to be force Disconnected."
        });

        work.failsOnExceptionCodes({
          1520: notPermittedErrorMsg
        });

        _callbacks.forceDisconnect[connectionId] = work;
      }

      _socket.forceDisconnect(connectionId);
    } else {
      // if this throws an error the handleJsException won't occur
      if (completionHandler) OT.$.callAsync(completionHandler, new OT.Error(null, notPermittedErrorMsg));

      TB.handleJsException(notPermittedErrorMsg, OT.ExceptionCodes.UNABLE_TO_FORCE_DISCONNECT, {
        session: this
      });
    }
  };

 /**
  * Forces the publisher of the specified stream to stop publishing the stream.
  *
  * <p>
  * Calling this method causes the Session object to dispatch a <code>streamDestroyed</code>
  * event on all clients that are subscribed to the stream (including the client that is
  * publishing the stream). The <code>reason</code> property of the StreamEvent object is
  * set to <code>"forceUnpublished"</code>.
  * </p>
  * <p>
  * The TB object dispatches an <code>exception</code> event if the user's role
  * does not include permissions required to force other users to unpublish.
  * You define a user's role when you create the user token using the <code>generate_token()</code>
  * method using our <a href="/opentok/libraries/server/">server-side libraries</a> or the <a href="https://dashboard.tokbox.com/projects">Dashboard</a> page page.
  * You pass the token string as a parameter of the <code>connect()</code> method of the Session object.
  * See <a href="ExceptionEvent.html">ExceptionEvent</a> and <a href="TB.html#addEventListener">TB.addEventListener()</a>.
  * </p>
  *
  * <h5>Events dispatched:</h5>
  *
  * <p>
  * 	<code>exception</code> (<a href="ExceptionEvent.html">ExceptionEvent</a>) &#151;
  *     The user's role does not allow forcing other users to unpublish.
  * </p>
  * <p>
  * 	<code>streamDestroyed</code> (<a href="StreamEvent.html">StreamEvent</a>) &#151;
  *     The stream has been unpublished. The Session object dispatches this on all clients
  *     subscribed to the stream, as well as on the publisher's client.
  * </p>
  *
  * @param {Stream} stream The stream to be unpublished.
  *
  * @method #forceUnpublish
  * @memberOf Session
  */
  this.forceUnpublish = function(streamOrStreamId, completionHandler) {
    var notPermittedErrorMsg = "This token does not allow forceUnpublish. The role must be at least `moderator` to enable this functionality";

    if (permittedTo("forceUnpublish")) {
      var stream = typeof(streamOrStreamId) === 'string' ? this.streams.get(streamOrStreamId) : streamOrStreamId;

      if (completionHandler) {
        var work = new RemoteWork(this, completionHandler, {
          timeoutMessage: "Timed out while waiting for stream " + stream.id + " to be force unpublished."
        });

        work.failsOnExceptionCodes({
          1530: notPermittedErrorMsg
        });

        _callbacks.forceUnpublish[stream.id] = work;
      }

      _socket.forceUnpublish(stream.id);
    } else {
      // if this throws an error the handleJsException won't occur
      if (completionHandler) OT.$.callAsync(completionHandler, new OT.Error(null, notPermittedErrorMsg));

      TB.handleJsException(notPermittedErrorMsg, OT.ExceptionCodes.UNABLE_TO_FORCE_UNPUBLISH, {
        session: this
      });
    }
  };

  this.getStateManager = function() {
      OT.warn("Fixme: Have not implemented session.getStateManager");
  };

  OT.$.defineGetters(this, {
    apiKey: function() { return _apiKey; },
    token: function() { return _token; },
    connected: function() { return this.is('connected'); },
    connection: function() { return _socket && _socket.id ? this.connections.get(_socket.id) : null; },
    capabilities: function() { return _socket ? _socket.capabilities : new OT.Capabilities([]); },
    sessionId: function() { return _sessionId; },
    id: function() { return _sessionId; }
  }, true);


	/**
	 * A new connection to this session has been created.
	 * @name connectionCreated
	 * @event
	 * @memberof Session
	 * @see ConnectionEvent
	 * @see <a href="TB.html#initSession">TB.initSession()</a>
	 */

	/**
	 * A connection to this session has ended.
	 * @name connectionDestroyed
	 * @event
	 * @memberof Session
	 * @see ConnectionEvent
	 */

	/**
	 * The page has connected to an OpenTok session. This event is dispatched asynchronously in response to
	 * a successful call to the <code>connect()</code> method of a Session object. Before calling the <code>connect()</code>
	 * method, initialize the session by calling the <code>TB.initSession()</code> method. For a code example and more details,
	 * see <a href="#connect">Session.connect()</a>.
	 * @name sessionConnected
	 * @event
	 * @memberof Session
	 * @see SessionConnectEvent
	 * @see <a href="#connect">Session.connect()</a>
	 * @see <a href="TB.html#initSession">TB.initSession()</a>
	 */

	/**
	 * The session has disconnected. This event may be dispatched asynchronously in response to a successful call to the
	 * <code>disconnect()</code> method of the Session object. The event may also be disptached if a session connection is lost
	 * inadvertantly, as in the case of a lost network connection.
	 * @name sessionDisconnected
	 * @event
	 * @memberof Session
	 * @see <a href="#disconnect">Session.disconnect()</a>
	 * @see <a href="#disconnect">Session.forceDisconnect()</a>
	 * @see SessionDisconnectEvent
	 */

	/**
	 * A new stream has been created on this session. For a code example and more details, see {@link StreamEvent}.
	 * @name streamCreated
	 * @event
	 * @memberof Session
	 * @see StreamEvent
	 * @see <a href="Session.html#publish">Session.publish()</a>
	 */

	/**
	 * A stream has closed on this connection. For a code example and more details, see {@link StreamEvent}.
	 * @name streamDestroyed
	 * @event
	 * @memberof Session
	 * @see StreamEvent
	 */

	/**
	 * A stream has started or stopped publishing audio or video (see <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a> and
	 * <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a>); or the <code>videoDimensions</code> property of the Stream
	 * object has changed (see <a href="Stream.html#"videoDimensions>Stream.videoDimensions</a>).
	 * @name streamPropertyChanged
	 * @event
	 * @memberof Session
	 * @see StreamPropertyChangedEvent
	 * @see <a href="Publisher.html#publishAudio">Publisher.publishAudio()</a>
	 * @see <a href="Publisher.html#publishVideo">Publisher.publishVideo()</a>
	 * @see <a href="Stream.html#"hasAudio>Stream.hasAudio</a>
	 * @see <a href="Stream.html#"hasVideo>Stream.hasVideo</a>
	 * @see <a href="Stream.html#"videoDimensions>Stream.videoDimensions</a>
	 */

	/**
	 * A signal was received from the session. The <a href="SignalEvent.html">SignalEvent</a> class defines this event object.
	 * It includes the following properties:
	 * <ul>
	 *   <li><code>data</code> &mdash; (Object) The data payload sent with the signal (if there is one).</li>
	 *   <li><code>from</code> &mdash; (<a href="Connection.html">Connection</a>) The Connection corresponding to the
	 *   client that sent with the signal.</li>
	 *   <li><code>type</code> &mdash; (String) The type assigned to the signal (if there is one).</li>
	 * </ul>
	 * <p>
	 * You can register to receive all signals sent in the session, by adding an event handler for the <code>signal</code>
	 * event. For example, the following code adds an event handler to process all signals sent in the session:
	 * <pre>
	 * session.addEventListener("signal", function(event) {
	 *   console.log("Signal sent from connection " + event.from.id);
	 * });
	 * </pre>
	 * <p>You can register for signals of a specfied type by adding an event handler for the <code>signal:type</code>
	 * event (replacing <code>type</code> with the actual type string to filter on).
	 *
	 * @name signal
	 * @event
	 * @memberof Session
	 * @see <a href="Session.html#signal">Session.signal()</a>
	 * @see SignalEvent
	 * @see <a href="#event:signal:type">signal:type</a> event
	 */

	/**
	 * A signal of the specified type was received from the session. The <a href="SignalEvent.html">SignalEvent</a> class
	 * defines this event object.
	 * It includes the following properties:
	 * <ul>
	 *   <li><code>data</code> &mdash; (Object) The data payload sent with the signal.</li>
	 *   <li><code>from</code> &mdash; (<a href="Connection.html">Connection</a>) The Connection corresponding to the
	 *   client that sent with the signal.</li>
	 *   <li><code>type</code> &mdash; (String) The type assigned to the signal (if there is one).</li>
	 * </ul>
	 * <p>
	 * You can register for signals of a specfied type by adding an event handler for the <code>signal:type</code>
	 * event (replacing <code>type</code> with the actual type string to filter on). For example, the following code adds
	 * an event handler for signals of type "foo":
	 * <pre>
	 * session.addEventListener("signal:foo", function(event) {
	 *   console.log("foo signal sent from connection " + event.from.id);
	 * });
	 * </pre>
	 * <p>
	 * You can register to receive <i>all</i> signals sent in the session, by adding an event handler for the
	 * <code>signal</code> event.
	 *
	 * @name signal:type
	 * @event
	 * @memberof Session
	 * @see <a href="Session.html#signal">Session.signal()</a>
	 * @see SignalEvent
	 * @see <a href="#event:signal">signal</a> event
	 */


};

})(window);
(function(window) {
  var style = document.createElement('link');
  style.type = 'text/css';
  style.media = 'screen';
  style.rel = 'stylesheet';
  style.href = OT.properties.cssURL;
  var head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(style);
})(window);
(function(window){

// Register as a named AMD module, since TokBox could be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Uppercase TB is used because AMD module names are
// derived from file names, and OpenTok is normally delivered in an uppercase
// file name.
if ( typeof define === "function" && define.amd ) {
  define( "TB", [], function () { return TB; } );
}

})(window);
