// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

"use strict";

var util = require("./util");

function Console(logObj) {
    if (!(this instanceof Console)) {
        return new Console(logObj);
    }
    if (!logObj || !util.isFunction(logObj.info) || !util.isFunction(logObj.error) || !util.isFunction(logObj.debug)) {
        throw new TypeError("Console expects a writable stream instance");
    }

    var prop = {
        writable: true,
        enumerable: false,
        configurable: true
    };
    prop.value = logObj;
    Object.defineProperty(this, "_logObj", prop);
    prop.value = Object.create(null);
    Object.defineProperty(this, "_times", prop);

    // bind the prototype functions to this Console instance
    var keys = Object.keys(Console.prototype);
    for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        this[k] = this[k].bind(this);
    }
}

Console.prototype.stringify = function () {
    return util.format.apply(this, arguments) + "\n";
};

Console.prototype.info = function () {
    this._logObj.info(util.format.apply(this, arguments));
};

Console.prototype.log = Console.prototype.info;

Console.prototype.error = function () {
    this._logObj.error(util.format.apply(this, arguments));
};

Console.prototype.warn = Console.prototype.error;

Console.prototype.debug = function () {
    this._logObj.debug(util.format.apply(this, arguments));
};

Console.prototype.time = function (label) {
    this._times[label] = Date.now();
};

Console.prototype.timeLog = function (label) {
    var time = this._times[label];
    if (!time) {
        throw new Error("No such label: " + label);
    }

    var duration = Date.now() - time;

    var day = Math.floor(duration / 86400000);
    duration -= day * 86400000;
    var hour = Math.floor(duration / 3600000);
    duration -= hour * 3600000;
    var minute = Math.floor(duration / 60000);
    duration -= minute * 60000;
    var second = Math.floor(duration / 1000);
    duration -= second * 1000;
    var ms = duration;

    if (duration < 1000)    // < 1s
        this.log("%s: %dms", label, ms);
    else if (duration < 60000)  // < 1m
        this.log("%s: %ds", label, duration / 1000);
    else if (duration < 3600000)    // < 1h
        this.log("%s: %s:%s.%s (m:ss.mmm)", label, String(minute), String(second).padStart(2, "0"), String(ms).padStart(3, "0"));
    else if (duration < 86400000)   // < 1d
        this.log("%s: %s:%s:%s.%s (h:mm:ss.mmm)", label, String(hour), String(minute).padStart(2, "0"), String(second).padStart(2, "0"), String(ms).padStart(3, "0"));
    else
        this.log("%s: %s days, %s:%s:%s.%s (d:h:mm:ss.mmm)", label, String(day), String(hour).padStart(2, "0"), String(minute).padStart(2, "0"), String(second).padStart(2, "0"), String(ms).padStart(3, "0"));
};

Console.prototype.timeEnd = function timeEnd(label) {
    this.timeLog.apply(this, arguments);
    delete this._times[label];
}

Console.prototype.trace = function trace() {
    // TODO probably can to do this better with V8's debug object once that is
    // exposed.
    var err = new Error;
    err.name = "Trace";
    err.message = util.format.apply(this, arguments);
    Error.captureStackTrace(err, trace);
    this.error(err.stack);
};

module.exports = log => new Console(log);