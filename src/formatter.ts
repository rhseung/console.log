import { Constructor, getNamespace, isTypedArray, TypedArray, typename } from "./type-of";

/**
 * formatting 규약.
 * 1. literal 값은 `그대로` 출력.
 *      - null, undefined, number, string, boolean, symbol, bigint, regexp
 * 2. class instance는 `[ClassName: value]` 형태로 출력.
 * 3. array, map, set 등의 collection들은 `ClassName(length) [ ... ]` 형태로 출력.
 * 4. object 들은 namespace가 존재하면 `[Object: namespace] { ... }` 형태로 출력.
 */

function bracketOrEmpty(header: string, content: string) {
    return content ? `${header} { ${content} }` : header;
}

function bracketOr(thing: string, properties: string) {
    return properties ? `${thing} { ${properties} }` : thing;
}

function remainer(remain: number, unit: string): string {
    return `... ${remain} more ${unit}${remain > 1 ? 's' : ''}`;
}

function array(thing: TypedArray | any[], properties: string, depth: number) {
    const len = Math.min(thing.length, Formatter.config.maxElementSize);
    const remain = thing.length - len;

    const arr = isTypedArray(thing) ? Array.from<number | bigint>(thing.slice(0, len)) : thing.slice(0, len);
    const output = arr.map(v => format(v, depth + 1));
    if (remain > 0)
        output.push(remainer(remain, 'item'));

    if (isTypedArray(thing))
        return bracketOrEmpty(`${thing.constructor.name}(${thing.length}) [ ${output.join(', ')} ]`, properties);
    else
        return bracketOrEmpty(`[ ${output.join(', ')} ]`, properties);
}

class Formatter {
    private static formatter: Record<string, (thing: any, properties: string, depth: number) => string> = {};
    private static shortFormatter: Record<string, (thing: any) => string> = {};
    
    private static defaultFormatter = (thing: any, properties: string = '', depth: number = 0) => {
        // object에 format 메서드가 있으면 그걸 사용 -> 사용자 정의 클래스에서 원하는 포매팅을 할 수 있게
        if ('format' in thing && typeof thing.format === 'function')
            return thing.format();

        return bracketOrEmpty(typename(thing), properties);
    }

    static config = Object.seal({
        // breakLength: 30,
        showHidden: false,
        maxDepth: 3,
        maxElementSize: 100,
        maxStringLength: 10000
    });

    static register<T>(typename: string, formatter: (thing: T, properties: string, depth: number) => string, shortFormatter?: (thing: T) => string) {
        Formatter.formatter[typename] = formatter;
        if (shortFormatter)
            Formatter.shortFormatter[typename] = shortFormatter;
    }

    static getFromName(typename: string) {
        return Formatter.formatter[typename] || Formatter.defaultFormatter;
    }

    static getShortFromName(typename: string) {
        return Formatter.shortFormatter[typename] || ((thing: string) => Formatter.getFromName(typename)(thing, '', 0));
    }

    static get(thing: any, properties: string = '', depth: number = 0) {
        return Formatter.getFromName(typename(thing))(thing, properties, depth);
    }

    static getShort(thing: any) {
        return Formatter.getShortFromName(typename(thing))(thing);
    }
}

Formatter.register<null>('null', thing =>
    'null'
);
Formatter.register<undefined>('undefined', thing =>
    'undefined'
);
Formatter.register<number>('number', thing =>
    Object.is(thing, -0) ? '-0' : thing.toString()
);
Formatter.register<string>('string', thing => {
    const len = Math.min(thing.length, Formatter.config.maxStringLength);
    const remain = thing.length - len;
    const str = thing.slice(0, len);

    return "\"" + JSON.stringify(str)
            .replace(/^"|"$/g, "")
            .replace(/'/g, "\\'")
            .replace(/\\"/g, "\"") + "\"" + (remain > 0 ? remainer(remain, 'character') : '');
});
Formatter.register<boolean>('boolean', thing =>
    thing.toString()
);
Formatter.register<symbol>('symbol', thing =>
    thing.toString()
);
Formatter.register<bigint>('bigint', thing =>
    `${thing}n`
);
Formatter.register<RegExp>('regexp', thing =>
    thing.toString()
);
Formatter.register<Number>('number object', (thing, properties, depth) =>
    bracketOrEmpty(`[Number: ${Formatter.getFromName('number')(thing, properties, depth)}]`, properties)
);
Formatter.register<String>('string object', (thing, properties, depth) =>
    bracketOrEmpty(`[String: ${Formatter.getFromName('string')(thing, properties, depth)}]`, properties)
);
Formatter.register<Boolean>('boolean object', (thing, properties, depth) =>
    bracketOrEmpty(`[Boolean: ${Formatter.getFromName('boolean')(thing, properties, depth)}]`, properties)
);
Formatter.register<GeneratorFunction>('generator function', (thing, properties) =>
    bracketOrEmpty(`[GeneratorFunction${thing.name ? `: ${thing.name}` : ' (anonymous)'}]`, properties)
);
Formatter.register<Function>('function', (thing, properties) =>
    bracketOrEmpty(`[Function${thing.name ? `: ${thing.name}` : ' (anonymous)'}]`, properties)
);
Formatter.register<Constructor<any>>('constructor', (thing, properties) =>
    bracketOrEmpty(`[class ${thing.name}]`, properties)
);
Formatter.register<Date>('date', (thing, properties) =>
    bracketOrEmpty(`[Date: ${thing.toISOString()}]`, properties)
);
Formatter.register<EvalError>('evalerror', (thing, properties) =>
    bracketOrEmpty(`[EvalError: ${thing.message}]`, properties)
);
Formatter.register<RangeError>('rangeerror', (thing, properties) =>
    bracketOrEmpty(`[RangeError: ${thing.message}]`, properties)
);
Formatter.register<ReferenceError>('referenceerror', (thing, properties) =>
    bracketOrEmpty(`[ReferenceError: ${thing.message}]`, properties)
);
Formatter.register<SyntaxError>('syntaxerror', (thing, properties) =>
    bracketOrEmpty(`[SyntaxError: ${thing.message}]`, properties)
);
Formatter.register<TypeError>('typeerror', (thing, properties) =>
    bracketOrEmpty(`[TypeError: ${thing.message}]`, properties)
);
Formatter.register<URIError>('urierror', (thing, properties) =>
    bracketOrEmpty(`[URIError: ${thing.message}]`, properties)
);
Formatter.register<Error>('error', (thing, properties) =>
    bracketOrEmpty(`[${thing.name}: ${thing.message}]`, properties)
);
Formatter.register<WeakMap<object, any>>('weakmap', (thing, properties) =>
    `WeakMap { <items unknown>${properties ? ', ' + properties : ''} }`,
    () => '[WeakMap]'
);
Formatter.register<WeakSet<object>>('weakset', (thing, properties) =>
    `WeakSet { <items unknown>${properties ? ', ' + properties : ''} }`,
    () => '[WeakSet]'
);
Formatter.register<Promise<any>>('promise', (thing, properties) =>
    `Promise { <pending>${properties ? ', ' + properties : ''} }`,
    () => '[Promise]'
);
Formatter.register<Object>('object', (thing, properties) => {
    const namespace = getNamespace(thing);
    const className = thing.constructor.name;

    let header = '';
    
    if (!Object.prototype.isPrototypeOf(thing))
        header = '[Object: null prototype]';
    else if (className !== 'Object')
        header = className;
    else if (namespace !== undefined)
        header = `Object [${namespace}]`;

    return header + ' ' + (properties ? `{ ${properties} }` : '{}');
}, () => '[Object]');
Formatter.register<Iterator<any>>('iterator', (thing, properties) =>
    `${getNamespace(thing)} {${properties ? ' ' + properties + ' ' : ''}}`,
    (thing) => `[${getNamespace(thing)}]`
);
Formatter.register<Map<any, any>>('map', (thing, properties, depth) => {
    let ret: string[] = [];
    let entries = thing.entries();
    let current = entries.next();

    // TODO: 많아지면 줄 넘기기
    while (!current.done) {
        if (ret.length === Formatter.config.maxElementSize) {
            const remain = length - ret.length;
            ret.push(remainer(remain, 'item'));
            break;
        }

        ret.push(`${format(current.value[0], depth + 1)} => ${format(current.value[1], depth + 1)}`);

        current = entries.next();
    }

    const content = ret.join(', ') + (properties ? ', ' + properties : '');
    return `Map(${thing.size}) {${content ? ' ' + content + ' ' : ''}}`;
}, () => '[Map]');
Formatter.register<Set<any>>('set', (thing, properties, depth) => {
    let ret: string[] = [];
    let entries = thing.values();
    let current = entries.next();

    while (!current.done) {
        if (ret.length === Formatter.config.maxElementSize) {
            const remain = length - ret.length;
            ret.push(remainer(remain, 'item'));
            break;
        }

        ret.push(format(current.value, depth + 1));

        current = entries.next();
    }

    const content = ret.join(', ') + (properties ? ', ' + properties : '');
    return `Set(${thing.size}) {${content ? ' ' + content + ' ' : ''}}`;
}, () => '[Set]');
Formatter.register<any[]>('array', array, () => '[Array]');
Formatter.register<Int8Array>('int8array', array, () => '[Int8Array]');
Formatter.register<Uint8Array>('uint8array', array, () => '[Uint8Array]');
Formatter.register<Uint8ClampedArray>('uint8clampedarray', array, () => '[Uint8ClampedArray]');
Formatter.register<Int16Array>('int16array', array, () => '[Int16Array]');
Formatter.register<Uint16Array>('uint16array', array, () => '[Uint16Array]');
Formatter.register<Int32Array>('int32array', array, () => '[Int32Array]');
Formatter.register<Uint32Array>('uint32array', array, () => '[Uint32Array]');
Formatter.register<Float32Array>('float32array', array, () => '[Float32Array]');
Formatter.register<Float64Array>('float64array', array, () => '[Float64Array]');
Formatter.register<BigInt64Array>('bigint64array', array, () => '[BigInt64Array]');
Formatter.register<BigUint64Array>('biguint64array', array, () => '[BigUint64Array]');

export function format(thing: any, depth: number = 0): string {
    if (depth > Formatter.config.maxDepth)
        return Formatter.getShort(thing);

    const propertyKeys = thing != null ? [
        ...Object.getOwnPropertySymbols(thing),
        ...(Formatter.config.showHidden ? Object.getOwnPropertyNames(thing) : Object.keys(thing))
    ] : [];

    const properties = propertyKeys.map(key => {
        const value = thing[key];
        return `${format(key, depth + 1)}: ${format(value, depth + 1)}`;
    }).join(', ');

    return Formatter.get(thing, properties);
}