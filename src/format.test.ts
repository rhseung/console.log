import { describe, expect, test } from "vitest";
import { format } from './format';
import { format as pretty } from 'pretty-format';

// const oldConsole = globalThis.console;
// const console = { log: (obj: any) => oldConsole.log(format(obj)) };

describe("types", () => {
    test("number", () => {
        console.log(pretty(1));
        expect(format(1)).toBe(pretty(1));
    });

    test("string", () => {
        console.log(pretty("Hello, World!"));
        expect(format("Hello, World!")).toBe(pretty("Hello, World!"));
    });

    test("boolean", () => {
        console.log(pretty(true));
        expect(format(true)).toBe(pretty(true));
    });

    test("null", () => {
        console.log(pretty(null));
        expect(format(null)).toBe(pretty(null));
    });

    test("undefined", () => {
        console.log(pretty(undefined));
        expect(format(undefined)).toBe(pretty(undefined));
    });

    test("object", () => {
        console.log(pretty({a: 3, b: {c: 4}}));
        expect(format({a: 3, b: {c: 4}})).toBe(pretty({a: 3, b: {c: 4}}));
    });

    test("symbol", () => {
        console.log(pretty(Symbol("test")));
        expect(format(Symbol("test"))).toBe(pretty(Symbol("test")));
    });

    test("anonymous function", () => {
        console.log(pretty((a: any, b: any) => a + b));
        expect(format((a: any, b: any) => a + b)).toBe(pretty((a: any, b: any) => a + b));
    });

    test("named function", () => {
        function add(a: any, b: any) { return a + b; }
        console.log(pretty(add));
        expect(format(add)).toBe(pretty(add));
    });

    test("generator function", () => {
        function* gen() { yield 1; }
        console.log(pretty(gen));
        expect(format(gen)).toBe(pretty(gen));
    });

    test("generator", () => {
        function* gen() { yield 1; }
        const generator = gen();
        console.log(pretty(generator));
        expect(format(generator)).toBe(pretty(generator));
    });

    test("iterator", () => {
        const it = [1, 2, 3][Symbol.iterator]();
        console.log(pretty(it));
        expect(format(it)).toBe(pretty(it));
    });

    test("bigint", () => {
        console.log(pretty(1n));
        expect(format(1n)).toBe(pretty(1n));
    });

    test("array", () => {
        // console.log(pretty([1, 2, 3]));
        console.log(format([1, 2, 3]));
        expect(format([1, 2, 3])).toBe(pretty([1, 2, 3]));
    });

    test("date", () => {
        console.log(pretty(new Date()));
        expect(format(new Date())).toBe(pretty(new Date()));

        // FIXME
        // 2024-10-14T10:55:56.087Z
        // Mon Oct 14 2024 19:55:56 GMT+0900 (대한민국 표준시)
    });

    test("regexp", () => {
        console.log(pretty(/test\d+/gi));
        expect(format(/test\d+/gi)).toBe(pretty(/test\d+/gi));
    });

    test("error", () => {
        console.log(pretty(new Error("test")));
        expect(format(new Error("test"))).toBe(pretty(new Error("test")));
    });

    test("type error", () => {
        console.log(pretty(new TypeError("test")));
        expect(format(new TypeError("test"))).toBe(pretty(new TypeError("test")));
    })

    test("globalThis", () => {
        console.log(pretty(globalThis));
        expect(format(globalThis)).toBe(pretty(globalThis));

        // FIXME
        // <ref *1> Object [global] {
        //     global: [Circular *1],
        //     clearImmediate: [Function: clearImmediate],
        //     setImmediate: [Function: setImmediate] {
        //       [Symbol(nodejs.util.promisify.custom)]: [Getter]
        //     },
        //     clearInterval: [Function: clearInterval],
        //     clearTimeout: [Function: clearTimeout],
        //     setInterval: [Function: setInterval],
        //     setTimeout: [Function: setTimeout] {
        //       [Symbol(nodejs.util.promisify.custom)]: [Getter]
        //     },
        //     queueMicrotask: [Function: queueMicrotask],
        //     structuredClone: [Function: structuredClone],
        //     atob: [Getter/Setter],
        //     btoa: [Getter/Setter],
        //     performance: [Getter/Setter],
        //     fetch: [Function: fetch],
        //     crypto: [Getter],
        //     __vitest_required__: {
        //       util: {
        //         _errnoException: [Function: _errnoException],
        //         _exceptionWithHostPort: [Function: _exceptionWithHostPort],
        //         _extend: [Function: _extend],
        //         callbackify: [Function: callbackify],
        //         debug: [Function: debuglog],
        //         debuglog: [Function: debuglog],
        //         deprecate: [Function: deprecate],
        //         format: [Function: format],
        //         styleText: [Function: styleText],
        //         formatWithOptions: [Function: formatWithOptions],
        //         getSystemErrorMap: [Function: getSystemErrorMap],
        //         getSystemErrorName: [Function: getSystemErrorName],
        //         inherits: [Function: inherits],
        //         inspect: [Function],
        //         isArray: [Function: isArray],
        //         isBoolean: [Function: isBoolean],
        //         isBuffer: [Function: isBuffer],
        //         isDeepStrictEqual: [Function: isDeepStrictEqual],
        //         isNull: [Function: isNull],
        //         isNullOrUndefined: [Function: isNullOrUndefined],
        //         isNumber: [Function: isNumber],
        //         isString: [Function: isString],
        //         isSymbol: [Function: isSymbol],
        //         isUndefined: [Function: isUndefined],
        //         isRegExp: [Function: isRegExp],
        //         isObject: [Function: isObject],
        //         isDate: [Function: isDate],
        //         isError: [Function: isError],
        //         isFunction: [Function: isFunction],
        //         isPrimitive: [Function: isPrimitive],
        //         log: [Function: log],
        //         promisify: [Function],
        //         stripVTControlCharacters: [Function: stripVTControlCharacters],
        //         toUSVString: [Function: toUSVString],
        //         transferableAbortSignal: [Getter],
        //         transferableAbortController: [Getter],
        //         aborted: [Getter],
        //         types: [Object],
        //         parseEnv: [Function: parseEnv],
        //         parseArgs: [Function: parseArgs],
        //         TextDecoder: [class TextDecoder],
        //         TextEncoder: [class TextEncoder],
        //         MIMEType: [class MIMEType],
        //         MIMEParams: [class MIMEParams]
        //       },
        //       timers: {
        //         setTimeout: [Function],
        //         clearTimeout: [Function: clearTimeout],
        //         setImmediate: [Function],
        //         clearImmediate: [Function: clearImmediate],
        //         setInterval: [Function: setInterval],
        //         clearInterval: [Function: clearInterval],
        //         _unrefActive: [Function: deprecated],
        //         active: [Function: deprecated],
        //         unenroll: [Function: deprecated],
        //         enroll: [Function: deprecated],
        //         promises: [Getter]
        //       }
        //     },
        //     __vitest_environment__: 'node',
        //     [Symbol(vitest:SAFE_TIMERS)]: {
        //       nextTick: [Function: nextTick],
        //       setTimeout: [Function: setTimeout] {
        //         [Symbol(nodejs.util.promisify.custom)]: [Getter]
        //       },
        //       setInterval: [Function: setInterval],
        //       clearInterval: [Function: clearInterval],
        //       clearTimeout: [Function: clearTimeout],
        //       setImmediate: [Function: setImmediate] {
        //         [Symbol(nodejs.util.promisify.custom)]: [Getter]
        //       },
        //       clearImmediate: [Function: clearImmediate]
        //     }
        //   }
        //
        //   { global: [Circular *1],
        //     clearImmediate: [Function: clearImmediate],
        //     setImmediate: [Function: setImmediate],
        //     clearInterval: [Function: clearInterval],
        //     clearTimeout: [Function: clearTimeout],
        //     setInterval: [Function: setInterval],
        //     setTimeout: [Function: setTimeout],
        //     queueMicrotask: [Function: queueMicrotask],
        //     structuredClone: [Function: structuredClone],
        //     atob: [Getter/Setter],
        //     btoa: [Getter/Setter],
        //     performance: [Getter/Setter],
        //     fetch: [Function: fetch],
        //     crypto: [Getter],
        //     __vitest_required__: 
        //      { util: 0,
        //        timers: 
        //         { setTimeout: [Function: setTimeout],
        //           clearTimeout: [Function: clearTimeout],
        //           setImmediate: [Function: setImmediate],
        //           clearImmediate: [Function: clearImmediate],
        //           setInterval: [Function: setInterval],
        //           clearInterval: [Function: clearInterval],
        //           _unrefActive: [Function: deprecated],
        //           active: [Function: deprecated],
        //           unenroll: [Function: deprecated],
        //           enroll: [Function: deprecated],
        //           promises: [Getter] } },
        //     __vitest_environment__: 'node' }
    });

    test('infinity', () => {
        console.log(pretty(Infinity));
        expect(format(Infinity)).toBe(pretty(Infinity));
    });

    test('nan', () => {
        console.log(pretty(NaN));
        expect(format(NaN)).toBe(pretty(NaN));
    });

    test("map", () => {
        const map = new Map();
        map.set("key", "value");
        map.set(Symbol("key2"), "value2");
        map.set(3, "value3");
        console.log(pretty(map));
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
        console.log(pretty(set));
        expect(format(set)).toBe(pretty(set));

        // FIXME
        // Set(1) { 'value' }
        // {}
    });

    test("weakmap", () => {
        const weakmap = new WeakMap();
        const key = { a: 4 };
        weakmap.set(key, "value");
        console.log(pretty(weakmap));
        expect(format(weakmap)).toBe(pretty(weakmap));

        // FIXME
        // WeakMap { <items unknown> }
        // {}
    });

    test("weakset", () => {
        const weakset = new WeakSet();
        const key = { a: 4 };
        weakset.add(key);
        console.log(pretty(weakset));
        expect(format(weakset)).toBe(pretty(weakset));

        // FIXME
        // WeakSet { <items unknown> }
        // {}
    });

    test("promise", () => {
        const promise = new Promise((resolve, reject) => {
            try {
                resolve([1, 2, 3]);
            } catch (e) {
                reject(e);
            }
        });

        promise.then(r => console.log(r));

        console.log(pretty(promise));
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

        console.log(pretty(new Test()));
        expect(format(new Test())).toBe(pretty(new Test()));

        // FIXME
        // Test { a: 3, b: 4 }
        // { a: 3, b: 4 }
    });

    test("class", () => {
        class A {
            static a = 3;
        }

        console.log(pretty(A));
        expect(format(A)).toBe(pretty(A));
    })

    // typed array
    test("typed array", () => {
        console.log(pretty(new Uint8Array([1, 2, 3])));
        expect(format(new Uint8Array([1, 2, 3]))).toBe(pretty(new Uint8Array([1, 2, 3])));

        // FIXME
        // Uint8Array(3) [ 1, 2, 3 ]
        // { '0': 1, '1': 2, '2': 3 }
    });
})

describe("tricky", () => {
    test("custom error", () => {
        class CustomError extends Error {
            constructor() {
                super("test");
                this.name = "CustomError";
            }
        }

        console.log(pretty(new CustomError()));
        expect(format(new CustomError())).toBe(pretty(new CustomError()));
    });

    test("symbol, string, number key object", () => {
        const obj = { [Symbol("test")]: 1, "test": 2, 3: 3 };
        console.log(pretty(obj));
        expect(format(obj)).toBe(pretty(obj));
    });

    test("empty array", () => {
        console.log(pretty([1, , , 3]));
        expect(format([1, , , 3])).toBe(pretty([1, , , 3]));
    });

    test("empty array 2", () => {
        console.log(pretty([, 1, , 3, ]));
        expect(format([, 1, , 3, ])).toBe(pretty([, 1, , 3, ]));
    });

    test("long array", () => {
        // console.log(pretty(new Array(1000).fill(1)));
        console.log(format(new Array(1000).fill(1)));
        expect(format(new Array(1000))).toBe(pretty(new Array(1000).fill(1)));
    });

    test("long object", () => {
        // FIXME: object 는 array와 다르게 listToString이 \n을 포함하면 모든 요소가 전부 개행하게 하자
        const o = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: (a: any, b: any) => a + b, [Symbol('hi')]: 'test', n: Number };
        console.log(format(o));
        expect(format(o)).toBe(pretty(o));
    });

    // TEST
    test("complex object", () => {
        const o = {
            a: 1,
            b: 2,
            c: {
                d: 3,
                e: 4,
                f: {
                    g: 5,
                    h: 6,
                    i: {
                        j: 7,
                        k: 8,
                        l: {
                            m: 9,
                            n: 10,
                            o: {
                                p: 11,
                                q: 12,
                                r: {
                                    s: 13,
                                    t: 14,
                                    u: {
                                        v: 15,
                                        w: 16,
                                        x: {
                                            y: 17,
                                            z: 18,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        console.log(pretty(o));
        expect(format(o)).toBe(pretty(o));
    });

    test("nested map", () => {
        const map = new Map();
        map.set("key", new Map([["key", "value"]]));
        map.set("key2", "value2");
        console.log(pretty(map));
        console.log(format(map));   // FIXME
        expect(format(map)).toBe(pretty(map));
    });

    // TEST
    test("circular reference", () => {
        const obj = {};
        // @ts-ignore
        obj["obj"] = obj;
        console.log(pretty(obj));
        expect(format(obj)).toBe(pretty(obj));
    });

    test("double circular reference", () => {
        const obj = {};
        // @ts-ignore
        obj["obj"] = obj;

        const obj2 = {};
        // @ts-ignore
        obj2["obj"] = obj2;

        // @ts-ignore
        obj["obj2"] = obj2;

        console.log(pretty(obj));
        expect(format(obj)).toBe(pretty(obj));
    });

    test("circular each other", () => {
        const a = {a:4};
        const b = {b:3};
        // @ts-ignore
        a.thing = b;
        // @ts-ignore
        b.thing = a;

        console.log(a, b);
        expect(format(a)).toBe(pretty(a));
        expect(format(b)).toBe(pretty(b));
    })

    test("null prototype", () => {
        const obj = Object.create(null);
        obj.a = 3;
        console.log(pretty(obj));
        expect(format(obj)).toBe(pretty(obj));

        // FIXME
        // [Object: null prototype] { a: 3 }
        // { a: 3 }
    });

    // TEST
    test("arguments", () => {
        function test() {
            console.log(pretty(arguments));
        expect(format(arguments)).toBe(pretty(arguments));
        }

        // @ts-ignore
        test(1, 2, 3);

        // FIXME
        // [Arguments] { '0': 1, '1': 2, '2': 3 }
        // { '0': 1, '1': 2, '2': 3 }
    });

    // TEST
    test("number literal vs constructor", () => {
        console.log(pretty(new Number(3)));
        expect(format(new Number(3))).toBe(pretty(new Number(3)));
        console.log(pretty(3));
        expect(format(3)).toBe(pretty(3));
    });

    test("string literal vs constructor", () => {
        console.log(pretty(new String("test")));
        expect(format(new String("test"))).toBe(pretty(new String("test")));
        console.log(pretty("test"));
        expect(format("test")).toBe(pretty("test"));
    });

    test("boolean literal vs constructor", () => {
        console.log(pretty(new Boolean(true)));
        expect(format(new Boolean(true))).toBe(pretty(new Boolean(true)));
        console.log(pretty(true));
        expect(format(true)).toBe(pretty(true));
    });

    // TEST
    test("namespace", () => {
        console.log(pretty(Math));
        expect(format(Math)).toBe(pretty(Math));

        const m = new Map([['a', 1], ['b', 2]]);
        console.log(pretty(m.entries()));
        expect(format(m.entries())).toBe(pretty(m.entries()));
    });

    test("function with properties", () => {
        function test() {
            return 1;
        }

        test.a = 3;
        test.b = (a: any, b: any) => a + b;
        console.log(pretty(test));
        expect(format(test)).toBe(pretty(test));
    });

    test("array with properties", () => {
        const arr = [1, 2, 3];
        // @ts-ignore
        arr.a = 3;
        console.log(pretty(arr));
        expect(format(arr)).toBe(pretty(arr));
    });

    test("toRepr", () => {
        class Point {
            constructor(public x: number, public y: number) {}

            toRepr() {
                return `Point(x=${this.x}, y=${this.y})`;
            }
        }

        const p = new Point(1, 2);
        console.log(p.toRepr());
        expect(format(p)).toBe(p.toRepr());
    })
});

// TODO: 커스텀 클래스는 toString으로 출력하게 할까? 아니면 그냥 console.log처럼 모든 프로퍼티 출력할까? 나는 모든 프로퍼티 출력하는게 맞다고 봄. 대신 toRepr 메서드가 정의되어 있으면 쓰게 ㄱㄱ.

describe("showToast", () => {
    test("toast", () => {
        console.showToast.log("Hello, World!");
        console.log(1);
        expect(1).toBe(1);
    })
});

describe("time", () => {
    test("time", () => {
        console.time("test");
        console.timeLog("test");
        console.timeEnd("test");
        console.log(1);
        expect(1).toBe(1);
    });
});

describe("count", () => {
    test("count", () => {
        console.count("test");
        console.count("test");
        console.count("test");
        console.log(1);
        expect(1).toBe(1);
    });

    test("countReset", () => {
        console.count("test");
        console.countReset("test");
        console.count("test");
        console.log(1);
        expect(1).toBe(1);
    });
});