function isCircular(
    obj: { [key: PropertyKey]: any },
    visited: Set<typeof obj> = new Set(),
    key?: PropertyKey
): { is: boolean, what?: typeof obj, key?: PropertyKey } {
    if (obj != null && typeof obj === 'object') {
        if (visited.has(obj))
            return { is: true, what: obj, key: key };

        visited.add(obj);

        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const result = isCircular(obj[key], visited, key);
                if (result.is)
                    return result;
            }
        }

        visited.delete(obj);
    }

    return { is: false };
}

function formatCircularReferences(
    obj: { [key: PropertyKey]: any },
    visited: Map<any, string> = new Map(),
    refCount: { current: number } = { current: 1 }
): any {
    if (obj != null && typeof obj === 'object') {
        // 이미 방문한 객체는 순환 참조로 표시
        if (visited.has(obj)) {
            return `[Circular ${visited.get(obj)}]`;
        }

        // 새 객체는 고유 참조 번호 부여
        const refLabel = `<ref *${refCount.current}>`;
        visited.set(obj, `*${refCount.current}`);
        refCount.current++;

        // 새 객체의 속성을 순환하며 순환 참조를 추적 및 표시
        const copy: { [key: PropertyKey]: any } = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = formatCircularReferences(obj[key], visited, refCount);
            }
        }

        // refLabel 은 처음 생성된 객체에만 추가
        copy.refLabel = refLabel;
        return copy;
    }
    return obj;
}

// 사용 예시
const a: any = { a: 1 };
const b: any = { b: 2 };
a.b = b;
b.a = a;
a.self = a;

console.log(a);
console.log(isCircular(a));
// console.log(formatCircularReferences(a));

// const obj = {};
// // @ts-ignore
// obj["obj"] = obj;
//
// const obj2 = {};
// // @ts-ignore
// obj2["obj"] = obj2;
//
// // @ts-ignore
// obj["obj2"] = obj2;
//
// // obj = { obj: { obj: ... }, obj2: { obj: ... } }
// console.log(obj);
// console.log(isCircular(obj)); // { is: true, what: { a: 3, b: [Circular] } }
// // console.log()
