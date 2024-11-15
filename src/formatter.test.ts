import { describe, test, expect } from 'vitest';
import { format } from './formatter';
import { format as pretty } from 'pretty-format';

function show(value: any) {
    console.log(pretty(value));
    // console.log(value);
    console.log('-'.repeat(15));
    console.log(format(value));
    console.log('\n');
}

describe('literal types', () => {
    test('null', () => {
        show(null);
        expect(format(null)).toBe(pretty(null));
    });

    test('undefined', () => {
        show(undefined);
        expect(format(undefined)).toBe(pretty(undefined));
    });

    test('boolean', () => {
        show(true);
        expect(format(true)).toBe(pretty(true));
    });

    test('number', () => {
        show(1);
        expect(format(1)).toBe(pretty(1));
    });

    test('string', () => {
        show('Hello, World!');
        expect(format('Hello, World!')).toBe(pretty('Hello, World!'));
    });

    test('regexp', () => {
        show(/test\d+/gi);
        expect(format(/test\d+/gi)).toBe(pretty(/test\d+/gi));
    });

    test('bigint', () => {
        show(123424n);
        expect(format(123424n)).toBe(pretty(123424n));
    });
});

describe("instance types", () => {
    test("symbol", () => {
        show(Symbol("test"));
        expect(format(Symbol("test"))).toBe(pretty(Symbol("test")));
    });

    test("anonymous function", () => {
        show((a: any, b: any) => a + b);
        expect(format((a: any, b: any) => a + b)).toBe(pretty((a: any, b: any) => a + b));
    });

    test("named function", () => {
        function add(a: any, b: any) { return a + b; }
        show(add);
        expect(format(add)).toBe(pretty(add));
    });

    test("generator function", () => {
        function* gen() { yield 1; }
        show(gen);
        expect(format(gen)).toBe(pretty(gen));
    });

    test("generator", () => {
        function* gen() { yield 1; }
        const generator = gen();
        show(generator);
        expect(format(generator)).toBe(pretty(generator));
    });

    test("iterator", () => {
        const it = [1, 2, 3][Symbol.iterator]();
        show(it);
        expect(format(it)).toBe(pretty(it));
    });

    test("date", () => {
        show(new Date());
        expect(format(new Date())).toBe(pretty(new Date()));

        // FIXME
        // 2024-10-14T10:55:56.087Z
        // Mon Oct 14 2024 19:55:56 GMT+0900 (대한민국 표준시)
    });

    test("error", () => {
        show(new Error("test"));
        expect(format(new Error("test"))).toBe(pretty(new Error("test")));
    });

    test("type error", () => {
        show(new TypeError("test"));
        expect(format(new TypeError("test"))).toBe(pretty(new TypeError("test")));
    });

    test("custom error", () => {
        class CustomError extends Error {
            constructor(message: string) {
                super(message);
                this.name = this.constructor.name;
            }
        }

        show(new CustomError("test"));
        expect(format(new CustomError("test"))).toBe(pretty(new CustomError("test")));
    });

    test('infinity', () => {
        show(Infinity);
        expect(format(Infinity)).toBe(pretty(Infinity));
    });

    test('nan', () => {
        show(NaN);
        expect(format(NaN)).toBe(pretty(NaN));
    });

    test("promise", () => {
        const promise = new Promise((resolve, reject) => {
            try {
                resolve([1, 2, 3]);
            } catch (e) {
                reject(e);
            }
        });

        show(promise);
        expect(format(promise)).toBe(pretty(promise));

        // FIXME
        // Promise { 1 }
        // {} 
    });

    test("custom class", () => {
        class Test {
            a = 3;
            b: number;

            constructor() {
                this.b = 4;
            }

            c() {
                return this.a + this.b;
            }
        }

        show(new Test());
        expect(format(new Test())).toBe(pretty(new Test()));

        // FIXME
        // Test { a: 3, b: 4 }
        // { a: 3, b: 4 }
    });

    test("class", () => {
        class A {
            static a = 3;
        }

        show(A);
        expect(format(A)).toBe(pretty(A));
    });

    test("Map constructor", () => {
        show(Map);
        expect(format(Map)).toBe(pretty(Map));
    });

    // typed array
    test("typed array", () => {
        show(new Uint8Array([1, 2, 3]));
        expect(format(new Uint8Array([1, 2, 3]))).toBe(pretty(new Uint8Array([1, 2, 3])));

        // FIXME
        // Uint8Array(3) [ 1, 2, 3 ]
        // { '0': 1, '1': 2, '2': 3 }
    });
});


test("globalThis", () => {
    show(globalThis);
    expect(format(globalThis)).toBe(pretty(globalThis));
});

test("object", () => {
    show({a: 3, b: {c: 4}});
    expect(format({a: 3, b: {c: 4}})).toBe(pretty({a: 3, b: {c: 4}}));
});

test("array", () => {
    // show([1, 2, 3]);
    console.log(format([1, 2, 3]));
    expect(format([1, 2, 3])).toBe(pretty([1, 2, 3]));
});

test("map", () => {
    const map = new Map();
    map.set("key", "value");
    map.set(Symbol("key2"), "value2");
    map.set(3, "value3");
    show(map);
    expect(format(map)).toBe(pretty(map));

    // FIXME
    // Map(1) { 'key' => 'value' }
    // {}
});

test("set", () => {
    const set = new Set();
    set.add("value");
    set.add(3);
    set.add(Symbol("value2"));
    show(set);
    expect(format(set)).toBe(pretty(set));

    // FIXME
    // Set(1) { 'value' }
    // {}
});

test("weakmap", () => {
    const weakmap = new WeakMap();
    const key = { a: 4 };
    weakmap.set(key, "value");
    show(weakmap);
    expect(format(weakmap)).toBe(pretty(weakmap));

    // FIXME
    // WeakMap { <items unknown> }
    // {}
});

test("weakset", () => {
    const weakset = new WeakSet();
    const key = { a: 4 };
    weakset.add(key);
    show(weakset);
    expect(format(weakset)).toBe(pretty(weakset));

    // FIXME
    // WeakSet { <items unknown> }
    // {}
});
