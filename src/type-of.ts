export type Constructor<T> = { new (...args: any[]): T };

export type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array;

function isConstructor(fn: any): fn is Constructor<any> {
    if (typeof fn !== 'function')
        return false;
    
    if (/^class[\s{]/.test(fn.toString()))
        return true;

    // babel.js classCallCheck() & inlined
    const body = fn.toString().replace(/^[^{]*{\s*/, '').replace(/\s*}[^}]*$/, '');
    return /classCallCheck\(/.test(body) || /TypeError\("Cannot call a class as a function"\)/.test(body);
}

function isGeneratorFunction(value: any): value is GeneratorFunction {
    return value.constructor.name === 'GeneratorFunction';
}

function isFunction(value: any): value is Function {
    return value.constructor.name === 'Function';
}

export function isIterator(value: any): value is Iterator<any> {
    return getNamespace(value).endsWith('Iterator');
}

export function isTypedArray(value: any): value is TypedArray {
    return value instanceof Int8Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray ||
           value instanceof Int16Array || value instanceof Uint16Array || value instanceof Int32Array ||
           value instanceof Uint32Array || value instanceof Float32Array || value instanceof Float64Array ||
           value instanceof BigInt64Array || value instanceof BigUint64Array;
}

export function getNamespace(thing: any) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}

export function typename(value: any) {
    if (value === null)
        return 'null';
    else if (typeof value === 'undefined')
        return 'undefined';
    else if (typeof value === 'number')
        return 'number';
    else if (typeof value === 'object' && value.constructor === Number)
        return 'number object';
    else if (typeof value === 'string')
        return 'string';
    else if (typeof value === 'object' && value.constructor === String)
        return 'string object';
    else if (typeof value === 'boolean')
        return 'boolean';
    else if (typeof value === 'object' && value.constructor === Boolean)
        return 'boolean object';
    else if (typeof value === 'symbol')
        return 'symbol';
    else if (typeof value === 'bigint')
        return 'bigint';
    // NOTE: 이건 formatter에 들어가야지
    // if ('format' in value && typeof value.format === 'function')
    //     return value.format();
    else if (typeof value === 'function') {
        if (isConstructor(value))
            return `constructor`;
        else if (isGeneratorFunction(value))
            return 'generator function';
        else if (isFunction(value))
            return 'function';
        else
            throw new Error(`Unknown function type: ${value}`);
    }
    else if (Array.isArray(value))
        return 'array';
    else if (value instanceof Date)
        return 'date';
    else if (value instanceof RegExp)
        return 'regexp';
    else if (value instanceof EvalError)
        return 'evalerror';
    else if (value instanceof RangeError)
        return 'rangeerror';
    else if (value instanceof ReferenceError)
        return 'referenceerror';
    else if (value instanceof SyntaxError)
        return 'syntaxerror';
    else if (value instanceof TypeError)
        return 'typeerror';
    else if (value instanceof URIError)
        return 'urierror';
    else if (value instanceof Error)
        return 'error';
    else if (value instanceof Map)
        return 'map';
    else if (value instanceof Set)
        return 'set';
    else if (value instanceof WeakMap)
        return 'weakmap';
    else if (value instanceof WeakSet)
        return 'weakset';
    else if (value instanceof Promise)
        return 'promise';
    else if (isTypedArray(value))
        return value.constructor.name.toLowerCase();
    else if (isIterator(value))
        return 'iterator';
    else if (Object.prototype.toString.call(value) === '[object Object]')
        return 'object';
    else
        return getNamespace(value);
}

export class TypeOf {
    private static constructors: Record<string, Constructor<any> | Function | null | undefined> = {};

    static register(typename: string, constructor: Constructor<any> | Function | null | undefined) {
        TypeOf.constructors[typename] = constructor;
    }

    static get(typename: string) {
        return TypeOf.constructors[typename];
    }
}

function* generator() {
    yield;
}

TypeOf.register('null', null);
TypeOf.register('undefined', undefined);
TypeOf.register('number', Number);
TypeOf.register('number object', Number);
TypeOf.register('string', String);
TypeOf.register('string object', String);
TypeOf.register('boolean', Boolean);
TypeOf.register('boolean object', Boolean);
TypeOf.register('symbol', Symbol);
TypeOf.register('bigint', BigInt);
TypeOf.register('generator function', generator.constructor);
TypeOf.register('function', Function);
TypeOf.register('array', Array);
TypeOf.register('date', Date);
TypeOf.register('regexp', RegExp);
TypeOf.register('evalerror', EvalError);
TypeOf.register('rangeerror', RangeError);
TypeOf.register('referenceerror', ReferenceError);
TypeOf.register('syntaxerror', SyntaxError);
TypeOf.register('typeerror', TypeError);
TypeOf.register('urierror', URIError);
TypeOf.register('error', Error);
TypeOf.register('map', Map);
TypeOf.register('set', Set);
TypeOf.register('weakmap', WeakMap);
TypeOf.register('weakset', WeakSet);
TypeOf.register('promise', Promise);
TypeOf.register('object', Object);
TypeOf.register('int8array', Int8Array);
TypeOf.register('uint8array', Uint8Array);
TypeOf.register('uint8clampedarray', Uint8ClampedArray);
TypeOf.register('int16array', Int16Array);
TypeOf.register('uint16array', Uint16Array);
TypeOf.register('int32array', Int32Array);
TypeOf.register('uint32array', Uint32Array);
TypeOf.register('float32array', Float32Array);
TypeOf.register('float64array', Float64Array);
TypeOf.register('bigint64array', BigInt64Array);
TypeOf.register('biguint64array', BigUint64Array);
TypeOf.register('arraylike', { length: 0 }.constructor);

export function type(value: any) {
    return TypeOf.get(typename(value));
}