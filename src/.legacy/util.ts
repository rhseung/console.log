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

const formatRegExp = /%[sdj%]/g;

export function format(msg: string, ...format: any[]): string;
export function format(obj: object): string;
export function format(...args: any[]) {
    if (!isString(args[0])) {
        const objects = [];
        for (let i = 0; i < args.length; i++) {
            objects.push(inspect(args[i]));
        }
        return objects.join(" ");
    }

    let i = 1;
    const len = args.length;
    let str = String(args[0]).replace(formatRegExp, x => {
        if (x === "%%") return "%";
        if (i >= len) return x;
        switch (x) {
            case "%s":
                return String(args[i++]);
            case "%d":
                return Number(args[i++]).toString();
            case "%j":
                try {
                    return JSON.stringify(args[i++]);
                }
                catch (_) {
                    return "[Circular]";
                }
            default:
                return x;
        }
    });
    for (let x = args[i]; i < len; x = args[++i]) {
        if (isNull(x) || !isObject(x)) {
            str += " " + x;
        }
        else {
            str += " " + inspect(x);
        }
    }
    return str;
}

type Context = {
    seen: any[];
    stylize: (str: string, styleType: string) => string;
    depth?: number;
    colors?: boolean;
    showHidden?: boolean;
    customInspect?: boolean;
    circular?: Map<any, number>;
};

type Primitive = boolean | number | string | symbol | null | undefined;

type Nullable<T> = T | null;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */

/* legacy: obj, showHidden, depth, colors*/
export function inspect(obj: any, opts?: any): string {
    // default options
    const ctx: Context = {
        seen: [],
        stylize: stylizeNoColor
    };
    // legacy...
    if (arguments.length >= 3) ctx.depth = arguments[2];
    if (arguments.length >= 4) ctx.colors = arguments[3];
    if (isBoolean(opts)) {
        // legacy...
        ctx.showHidden = opts;
    }
    else if (opts) {
        // got an "options" object
        // exports._extend(ctx, opts);
    }
    // set default options
    if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
    if (isUndefined(ctx.depth)) ctx.depth = 2;
    if (isUndefined(ctx.colors)) ctx.colors = false;
    if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
    if (ctx.colors) ctx.stylize = stylizeWithColor;
    return formatValue(ctx, obj, ctx.depth);
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
    "bold": [ 1, 22 ],
    "italic": [ 3, 23 ],
    "underline": [ 4, 24 ],
    "inverse": [ 7, 27 ],
    "white": [ 37, 39 ],
    "grey": [ 90, 39 ],
    "black": [ 30, 39 ],
    "blue": [ 34, 39 ],
    "cyan": [ 36, 39 ],
    "green": [ 32, 39 ],
    "magenta": [ 35, 39 ],
    "red": [ 31, 39 ],
    "yellow": [ 33, 39 ]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
    "special": "cyan",
    "number": "yellow",
    "boolean": "yellow",
    "undefined": "grey",
    "null": "bold",
    "string": "green",
    "symbol": "green",
    "date": "magenta",
    // "name": intentionally not styling
    "regexp": "red"
};

function pad(value: any) {
    return `${value}`.padStart(2, '0');
}

function formatTime(ms: number) {
    let hours = 0;
    let minutes = 0;
    let seconds = 0;

    if (ms >= kSecond) {
        if (ms >= kMinute) {
            if (ms >= kHour) {
                hours = Math.floor(ms / kHour);
                ms = ms % kHour;
            }
            minutes = Math.floor(ms / kMinute);
            ms = ms % kMinute;
        }
        seconds = ms / kSecond;
    }

    if (hours !== 0 || minutes !== 0) {
        let [secondsStr, msStr] = seconds.toFixed(3).split('.');

        const res = hours !== 0 ? `${hours}:${pad(minutes)}` : minutes;
        return `${res}:${pad(secondsStr)}.${msStr} (${hours !== 0 ? 'h:m' : ''}m:ss.mmm)`;
    }

    if (seconds !== 0) {
        return `${seconds.toFixed(3)}s`;
    }

    return `${Number(ms.toFixed(3))}ms`;
}

function stylizeWithColor(str: string, styleType: string): string {
    // var style = inspect.styles[styleType];
    //
    // if (style) {
    //     return '\u001b[' + inspect.colors[style][0] + 'm' + str +
    //         '\u001b[' + inspect.colors[style][1] + 'm';
    // } else {
    //     return str;
    // }

    // color not supported
    return str;
}

function stylizeNoColor(str: string, styleType: string): string {
    return str;
}

function arrayToHash(array: string[]): { [key: string]: true } {
    const hash: { [key: string]: true } = {};
    array.forEach(val => hash[val] = true);
    return hash;
}

function formatProxy(ctx, proxy, recurseTimes) {
  if (recurseTimes > ctx.depth && ctx.depth !== null) {
    return ctx.stylize('Proxy [Array]', 'special');
  }
  recurseTimes += 1;
  ctx.indentationLvl += 2;
  const res = [
    formatValue(ctx, proxy[0], recurseTimes),
    formatValue(ctx, proxy[1], recurseTimes),
  ];
  ctx.indentationLvl -= 2;
  return reduceToSingleString(
    ctx, res, '', ['Proxy [', ']'], kArrayExtrasType, recurseTimes);
}

function formatValue(ctx: Context, value: Nullable<any>, recurseTimes: Nullable<number>): string {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (ctx.customInspect &&
        value &&
        isFunction(value.inspect) &&
        // Filter out the util module, it's inspect function is special
        value.inspect !== inspect &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)
    ) {
        let ret = value.inspect(recurseTimes, ctx);
        if (!isString(ret)) {
            ret = formatValue(ctx, ret, recurseTimes);
        }
        return ret;
    }

    // Primitive types cannot have properties
    const primitive = formatPrimitive(ctx, value);
    if (primitive) {
        return primitive;
    }

    // Look up the keys of the object.
    let keys = Object.keys(value);
    const visibleKeys = arrayToHash(keys);

    if (ctx.showHidden) {
        keys = Object.getOwnPropertyNames(value);
    }

    // This could be a boxed primitive (new String(), etc.), check valueOf()
    // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
    // a number which, when object has some additional user-stored `keys`,
    // will be printed out.
    let formatted;
    let raw = value;
    try {
        // the .valueOf() call can fail for a multitude of reasons
        if (!isDate(value))
            raw = value.valueOf();
    }
    catch (e) {
        // ignore...
    }

    if (isString(raw)) {
        // for boxed Strings, we have to remove the 0-n indexed entries,
        // since they just noisy up the output and are redundant
        keys = keys.filter(key => !(Number(key) >= 0 && Number(key) < raw.length));
    }

    // Some type of object without properties can be shortcutted.
    if (keys.length === 0) {
        if (isFunction(value)) {
            const name = value.name ? ": " + value.name : "";
            return ctx.stylize("[Function" + name + "]", "special");
        }
        if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        }
        if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), "date");
        }
        if (isError(value)) {
            return formatError(value);
        }
        // now check the `raw` value to handle boxed primitives
        if (isString(raw)) {
            formatted = formatPrimitiveNoColor(ctx, raw);
            return ctx.stylize("[String: " + formatted + "]", "string");
        }
        if (isNumber(raw)) {
            formatted = formatPrimitiveNoColor(ctx, raw);
            return ctx.stylize("[Number: " + formatted + "]", "number");
        }
        if (isBoolean(raw)) {
            formatted = formatPrimitiveNoColor(ctx, raw);
            return ctx.stylize("[Boolean: " + formatted + "]", "boolean");
        }
    }

    let base = "", array = false, braces: [ string, string ] = [ "{", "}" ];

    // Make Array say that they are Array
    if (isArray(value)) {
        array = true;
        braces = [ "[", "]" ];
    }

    // Make functions say that they are functions
    if (isFunction(value)) {
        const n = value.name ? ": " + value.name : "";
        base = " [Function" + n + "]";
    }

    // Make RegExps say that they are RegExps
    if (isRegExp(value)) {
        base = " " + RegExp.prototype.toString.call(value);
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
        base = " " + Date.prototype.toUTCString.call(value);
    }

    // Make error with message first say the error
    if (isError(value)) {
        base = " " + formatError(value);
    }

    // Make boxed primitive Strings look like such
    if (isString(raw)) {
        formatted = formatPrimitiveNoColor(ctx, raw);
        base = " " + "[String: " + formatted + "]";
    }

    // Make boxed primitive Numbers look like such
    if (isNumber(raw)) {
        formatted = formatPrimitiveNoColor(ctx, raw);
        base = " " + "[Number: " + formatted + "]";
    }

    // Make boxed primitive Booleans look like such
    if (isBoolean(raw)) {
        formatted = formatPrimitiveNoColor(ctx, raw);
        base = " " + "[Boolean: " + formatted + "]";
    }

    if (keys.length === 0 && (!array || value.length === 0)) {
        return braces[0] + base + braces[1];
    }

    if (isNumber(recurseTimes) && recurseTimes < 0) {
        if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), "regexp");
        }
        else {
            return ctx.stylize("[Object]", "special");
        }
    }

    ctx.seen.push(value);

    let output;
    if (array) {
        output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
    }
    else {
        output = keys.map(key => formatProperty(ctx, value, recurseTimes, visibleKeys, key, array));
    }

    ctx.seen.pop();

    return reduceToSingleString(output, base, braces);
}

function formatPrimitive(ctx: Context, value: Primitive): string {
    if (isUndefined(value))
        return ctx.stylize("undefined", "undefined");
    else if (isString(value)) {
        const simple = "'" + JSON.stringify(value).replace(/^"|"$/g, "")
            .replace(/'/g, "\\'")
            .replace(/\\"/g, "\"") + "'";
        return ctx.stylize(simple, "string");
    }
    else if (isNumber(value)) {
        // Format -0 as '-0'. Strict equality won't distinguish 0 from -0,
        // so instead we use the fact that 1 / -0 < 0 whereas 1 / 0 > 0 .
        if (value === 0 && 1 / value < 0)
            return ctx.stylize("-0", "number");
        return ctx.stylize("" + value, "number");
    }
    else if (isBoolean(value))
        return ctx.stylize("" + value, "boolean");
    // For some reason typeof null is "object", so special case here.
    else if (isNull(value))
        return ctx.stylize("null", "null");
    // es6 symbol primitive
    else if (isSymbol(value))
        return ctx.stylize(value.toString(), "symbol");
    else {
        // impossible
        // @ts-ignore
        return;
    }
}

function formatPrimitiveNoColor(ctx: Context, value: Primitive): string {
    const stylize = ctx.stylize;
    ctx.stylize = stylizeNoColor;
    const str = formatPrimitive(ctx, value);
    ctx.stylize = stylize;
    return str;
}

function formatError(value: Error): string {
    return "[" + Error.prototype.toString.call(value) + "]";
}

function formatArray(ctx: Context, value: any[], recurseTimes: Nullable<number>, visibleKeys: Record<string, true>, keys: string[]): string[] {
    const output: string[] = [];
    let emptyCount = 0;

    for (let i = 0; i < value.length; ++i) {
        if (hasOwnProperty(value, String(i))) {
            if (emptyCount > 0) {
                output.push(`<${emptyCount} empty items>`);
                emptyCount = 0;
            }

            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true));
        }
        else {
            emptyCount++;
        }
    }

    if (emptyCount > 0) {
        output.push(`<${emptyCount} empty items>`);
        emptyCount = 0;
    }

    keys.forEach(key => {
        if (!key.match(/^\d+$/)) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                key, true));
        }
    });
    return output;
}

function formatProperty(ctx: Context, value: any, recurseTimes: Nullable<number>, visibleKeys: Record<string, true>, key: string, array: boolean): string {
    let name: string | undefined,
        str: string | undefined,
        desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };

    if (desc.get) {
        if (desc.set) {
            str = ctx.stylize("[Getter/Setter]", "special");
        }
        else {
            str = ctx.stylize("[Getter]", "special");
        }
    }
    else {
        if (desc.set) {
            str = ctx.stylize("[Setter]", "special");
        }
    }
    if (!hasOwnProperty(visibleKeys, key)) {
        name = "[" + key + "]";
    }
    if (!str) {
        const found = ctx.seen.indexOf(desc.value);

        if (found < 0) {
            if (isNull(recurseTimes)) {
                str = formatValue(ctx, desc.value, null);
            }
            else {
                str = formatValue(ctx, desc.value, recurseTimes - 1);
            }
            if (str.indexOf("\n") > -1) {
                if (array) {
                    str = str.split("\n").map(line => "  " + line).join("\n").substr(2);
                }
                else {
                    str = "\n" + str.split("\n").map(line => "   " + line).join("\n");
                }
            }
        }
        else {
            str = ctx.stylize(`[Circular *${found + 1}]`, "special");
        }
    }
    if (isUndefined(name)) {
        if (array && key.match(/^\d+$/)) {
            return str;
        }
        name = JSON.stringify("" + key);
        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2);
            name = ctx.stylize(name, "name");
        }
        else {
            name = name.replace(/'/g, "\\'")
                .replace(/\\"/g, "\"")
                .replace(/(^"|"$)/g, "'")
                .replace(/\\\\/g, "\\");
            name = ctx.stylize(name, "string");
        }
    }

    return name + ": " + str;
}

function reduceToSingleString(output: string[], base: string, braces: [ string, string ]) {
    const length = output.reduce((prev, cur) => prev + cur.replace(/\u001b\[\d\d?m/g, "").length + 1, 0);

    if (length > 60) {
        return braces[0] +
            (base === "" ? "" : base + "\n ") +
            " " +
            output.join(",\n  ") +
            " " +
            braces[1];
    }

    return braces[0] + base + " " + output.join(", ") + " " + braces[1];
}

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
export const isArray = Array.isArray;

export function isBoolean(arg: any): arg is boolean {
    return typeof arg === "boolean";
}

export function isNull(arg: any): arg is null {
    return arg === null;
}

export function isNullOrUndefined(arg: any): arg is null | undefined {
    return arg == null;
}

export function isNumber(arg: any): arg is number {
    return typeof arg === "number";
}

export function isString(arg: any): arg is string {
    return typeof arg === "string";
}

export function isSymbol(arg: any): arg is symbol {
    return typeof arg === "symbol";
}



export function isUndefined(arg: any): arg is undefined {
    return arg === void 0;
}

export function isRegExp(arg: any): arg is RegExp {
    return isObject(arg) && objectToString(arg) === "[object RegExp]";
}

export function isObject(arg: any): arg is object {
    return typeof arg === "object" && arg !== null;
}

export function isDate(arg: any): arg is Date {
    return isObject(arg) && objectToString(arg) === "[object Date]";
}

export function isError(arg: any): arg is Error {
    return isObject(arg) &&
        (objectToString(arg) === "[object Error]" || arg instanceof Error);
}

export function isFunction(arg: any): arg is Function {
    return typeof arg === "function";
}

export function isPrimitive(arg: any): arg is boolean | number | string | symbol | null | undefined {
    return arg === null ||
        typeof arg === "boolean" ||
        typeof arg === "number" ||
        typeof arg === "string" ||
        typeof arg === "symbol" ||  // ES6 symbol
        typeof arg === "undefined";
}

export function objectToString(o: object): string {
    return Object.prototype.toString.call(o);
}

const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
    "Oct", "Nov", "Dec" ];

// 26 Feb 16:19:34
export function timestamp(): string {
    const d = new Date();
    const time = [ pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds()) ].join(":");
    return [ d.getDate(), months[d.getMonth()], time ].join(" ");
}

export function hasOwnProperty(obj: object, prop: PropertyKey) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
