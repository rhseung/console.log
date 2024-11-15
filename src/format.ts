export const options = Object.seal({
    breakLength: 30,
    maxDepth: 3,
    maxArrayLength: 100,
    maxStringLength: 10000,
    showHidden: false,
});

type CodeLine = (string | CodeLine)[];

function remainingTrailer(remaining: number, unit: string): string {
    return `... ${remaining} more ${unit}${remaining > 1 ? 's' : ''}`;
}

function listToString(value: CodeLine, separator: string = ', ', indent: number = 0): string[] {
    let ret: string[] = [];

    for (let i = 0, width = 0; i < value.length; i++) {
        const add = value[i] + (i === value.length - 1 ? '' : separator);
        width += add.length;

        if (width > options.breakLength) {
            ret += (i === 0 ? '' : '\n') + '  '.repeat(indent);
            width = add.length;
        }

        ret += add;
    }

    return ret;
}

function bracket(value: string[], indent: number = 0, braces: [string, string] = ['{', '}'], separator: string = ', '): string {
    if (value.length === 0)
        return braces[0] + braces[1];

    let str = listToString(value, separator, indent);
    if (str.includes('\n') || indent > 0) {
        str = listToString(value, separator, indent + 1);
        return `${braces[0]}\n${str}\n${'  '.repeat(indent)}${braces[1]}`;
    } else {
        return `${braces[0]} ${str} ${braces[1]}`;
    }
}

function bracketEmpty(value: string[], indent: number = 0, braces: [string, string] = ['{', '}'], separator: string = ', '): string {
    if (value.length === 0)
        return '';

    let str = listToString(value, separator, indent);
    if (str.includes('\n') || indent > 0) {
        str = listToString(value, separator, indent + 1);
        return `${braces[0]}\n${str}\n${'  '.repeat(indent)}${braces[1]}`;
    } else {
        return `${braces[0]} ${str} ${braces[1]}`;
    }
}

function getProperties(value: object): PropertyKey[] {
    return [
        ...Object.getOwnPropertySymbols(value),
        ...(options.showHidden ? Object.getOwnPropertyNames(value) : Object.keys(value))
    ];
}

function getPropertiesWithoutIndex(value: any[]): PropertyKey[] {
    return getProperties(value).filter(k => typeof k === 'string' ? !/\d+/.test(k) : k);
}

function getPropertiesString(
    value: any,
    depth: number = 0,
    getter: (value: any) => PropertyKey[] = getProperties,
    more: Record<PropertyKey, unknown> = {}
): string[] {
    const entries: [PropertyKey, unknown][] = getter(value).map(key => {
        const val = value[key];
        return [key, val];
    });
    entries.push(...Object.entries(more));

    return entries.map(([key, value]) => {
        const keyStr = typeof key === 'symbol' ? `[${formatSymbol(key, depth + 1)}]` : format(key, depth + 1);
        const valueStr = format(value, depth + 1);

        return keyStr + ': ' + valueStr;
    });
}

function getIteratorEntries(value: Iterator<[unknown, unknown]>, length: number, depth: number = 0): string[] {
    let ret: string[] = [];
    let current = value.next();

    if (current.done) return ret;

    // TODO: 많아지면 줄 넘기기
    while (!current.done) {
        if (ret.length === options.maxArrayLength) {
            const remaining = length - ret.length;
            ret.push(remainingTrailer(remaining, 'item'));
            break;
        }

        ret.push(`${format(current.value[0], depth + 1)} => ${format(current.value[1], depth + 1)}`);

        current = value.next();
    }

    return ret;
}

function getIteratorValues(value: Iterator<unknown>, length: number, depth: number = 0): string[] {
    let ret: string[] = [];
    let current = value.next();

    if (current.done) return ret;

    while (!current.done) {
        if (ret.length === options.maxArrayLength) {
            const remaining = length - ret.length;
            ret.push(remainingTrailer(remaining, 'item'));
            break;
        }

        ret.push(format(current.value, depth + 1));

        current = value.next();
    }

    return ret;
}


// TODO: circular

export function format(value: any, depth: number = 0): string {
    if (value === null)
        return formatNull(value, depth);
    else if (typeof value === 'undefined')
        return formatUndefined(value, depth);
    else if (typeof value === 'number')
        return formatNumber(value, depth);
    else if (typeof value === 'string')
        return formatString(value, depth);
    else if (typeof value === 'boolean')
        return formatBoolean(value, depth);
    else if (typeof value === 'symbol')
        return formatSymbol(value, depth);
    else if (typeof value === 'bigint')
        return formatBigInt(value, depth);

    if ('toRepr' in value && typeof value.toRepr === 'function')
        return value.toRepr();
    else if (typeof value === 'function') {
        if (isConstructor(value))
            return formatConstructor(value, depth);
        else if (isGeneratorFunction(value))
            return formatGeneratorFunction(value, depth);
        else if (isFunction(value))
            return formatFunction(value, depth);
        else
            throw TypeError(`Unknown function type: ${value}`);
    }
    else if (Array.isArray(value))
        return formatArray(value, depth);
    else if (value instanceof Date)
        return formatDate(value, depth);
    else if (value instanceof RegExp)
        return formatRegExp(value, depth);
    else if (value instanceof Error)
        return formatError(value, depth);
    else if (value instanceof Map)
        return formatMap(value, depth);
    else if (value instanceof Set)
        return formatSet(value, depth);
    else if (value instanceof WeakMap)
        return formatWeakMap(value, depth);
    else if (value instanceof WeakSet)
        return formatWeakSet(value, depth);
    else if (value instanceof Promise)
        return formatPromise(value, depth);
    else if (isTypedArray(value))
        return formatTypedArray(value, depth);
    else if (value instanceof Number)
        return formatNumberObject(value, depth);
    else if (value instanceof String)
        return formatStringObject(value, depth);
    else if (value instanceof Boolean)
        return formatBooleanObject(value, depth);
    else
        return formatObject(value, depth);
}

export function formatNumber(value: number, depth: number = 0): string {
    if (Object.is(value, -0))
        return "-0";
    else
        return value.toString();
}

export function formatNumberObject(value: Number, depth: number = 0): string {
    return `[Number: ${formatNumber(value.valueOf(), depth)}]`;
}

// TODO: 평소에는 따옴표 없다가, 키 값 같은 경우에 생기게 하기
export function formatString(value: string, depth: number = 0): string {
    let trailer = '';
    if (value.length > options.maxStringLength) {
        const remaining = value.length - options.maxStringLength;
        value = value.slice(0, options.maxStringLength);
        trailer = remainingTrailer(remaining, 'character');
    }

    return "\"" + JSON.stringify(value)
            .replace(/^"|"$/g, "")
            .replace(/'/g, "\\'")
            .replace(/\\"/g, "\"") + "\"" + trailer;
}

export function formatStringObject(value: String, depth: number = 0): string {
    return `[String: ${formatString(value.valueOf(), depth)}]`;
}

export function formatBoolean(value: boolean, depth: number = 0): string {
    return value.toString();
}

export function formatBooleanObject(value: Boolean, depth: number = 0): string {
    return `[Boolean: ${formatBoolean(value.valueOf(), depth)}]`;
}

export function formatNull(value: null, depth: number = 0): string {
    return "null";
}

export function formatUndefined(value: undefined, depth: number = 0): string {
    return "undefined";
}

export function formatSymbol(value: symbol, depth: number = 0): string {
    return value.toString();
}

export function formatFunction(value: Function, depth: number = 0): string {
    const name = value.name ? ": " + value.name : " (anonymous)";
    return (`[Function${name}] ` + bracketEmpty(getPropertiesString(value, depth), depth)).trimEnd();
}

export function formatGeneratorFunction(value: GeneratorFunction, depth: number = 0): string {
    const name = value.name ? ": " + value.name : " (anonymous)";
    return `[GeneratorFunction${name}]`;
}

export function formatBigInt(value: bigint, depth: number = 0): string {
    return `${value.toString()}n`;
}

export function formatDate(value: Date, depth: number = 0): string {
    return value.toISOString();
}

export function formatRegExp(value: RegExp, depth: number = 0): string {
    return value.toString();
}

export function formatError(value: Error, depth: number = 0): string {
    return `[${value.name}: ${value.message}]`;
}

export function formatPromise(value: Promise<unknown>, depth: number = 0): string {
    return 'Promise ' + bracket(getPropertiesString(value, depth), depth);
}

export function formatObject(value: any, depth: number = 0): string {
    if (depth === options.maxDepth)
        return `[Object]`;

    let prefix;

    if (!Object.prototype.isPrototypeOf(value)) {
        prefix = `[Object: null prototype] `;
    }
    else {
        const namespace = Object.prototype.toString.call(value).slice(8, -1);
        const classname = value.constructor.name;

        if (classname !== 'Object')
            prefix = `${classname} `;
        else if (namespace !== undefined)
            prefix = `Object [${namespace}] `;
        else if (!Object.prototype.isPrototypeOf(value))
            prefix = `[Object: null prototype] `;
        else
            prefix = '';
    }

    return prefix + bracket(getPropertiesString(value, depth), depth);
}

export function formatConstructor<T> (value: Constructor<T>, depth: number = 0): string {
    return (`[class ${value.name}] ` + bracketEmpty(getPropertiesString(value, depth), depth)).trimEnd();
}

export function formatArray(value: unknown[], depth: number = 0): string {
    if (depth === options.maxDepth)
        return '[Array]';

    // TODO: special array (sparse and/or has extra keys)
    // TODO: typed array

    const len = Math.min(value.length, options.maxArrayLength);
    const remaining = value.length - len;
    const output = [];

    for (let i = 0; i < len; i++) {
        output.push(format(value[i], depth + 1));
    }

    if (remaining > 0)
        output.push(remainingTrailer(remaining, 'item'));

    output.push(...getPropertiesString(value, depth, getPropertiesWithoutIndex));

    return bracket(output, depth, ['[', ']']);
    // TODO: 줄 넘기기, 들여쓰기 하기 등
}

export function formatTypedArray(value: TypedArray, depth: number = 0): string {
    if (depth === options.maxDepth)
        return `[${value.constructor.name}]`;

    const length = value.length;
    // @ts-ignore
    const entries = formatArray(Array.from(value), depth + 1);
    return `${value.constructor.name}(${length}) ${entries}`;
}

// FIXME: depth, options.maxDepth가 작동 안하는 이유: 유틸 함수에서 depth를 더하기 때문에. 즉, 모든 유틸 함수는 depth를 그대로 사용하도록 하고, depth의 변화는 format 함수에서만.

export function formatIteratorEntries(value: Iterator<[unknown, unknown]>, length: number, depth: number = 0): string {
    if (depth === options.maxDepth)
        return '[Iterator]';
    
    return listToString(getIteratorEntries(value, length, depth), ', ', depth);
}

export function formatIteratorValues(value: Iterator<unknown>, length: number, depth: number = 0): string {
    if (depth === options.maxDepth)
        return '[Iterator]';
    
    return listToString(getIteratorValues(value, length, depth), ', ', depth);
}

export function formatMap(value: Map<unknown, unknown>, depth: number = 0): string {
    if (depth === options.maxDepth)
        return '[Map]';

    const length = value.size;
    const entries = getIteratorEntries(value.entries(), length, depth);
    entries.push(...getPropertiesString(value, depth));

    return (`Map(${length}) ` + bracket(entries, depth)).trimEnd();
}

export function formatSet(value: Set<unknown>, depth: number = 0): string {
    if (depth === options.maxDepth)
        return '[Set]';

    const length = value.size;
    const entries = getIteratorValues(value.values(), length, depth);
    entries.push(...getPropertiesString(value, depth));

    return (`Set(${length}) ` + bracket(entries, depth)).trimEnd();
}

export function formatWeakMap(value: WeakMap<WeakKey, unknown>, depth: number = 0): string {
    if (depth === options.maxDepth)
        return '[WeakMap]';

    return `WeakMap { <items unknown> }`;
}

export function formatWeakSet(value: WeakSet<WeakKey>, depth: number = 0): string {
    if (depth === options.maxDepth)
        return '[WeakSet]';

    return `WeakSet { <items unknown> }`;
}