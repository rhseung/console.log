
type strings = (string | strings)[];

/**
 * Map(1) {
 *   "key" => Map(1) {
 *     "key" => "value"
 *   },
 *   "key2" => "value2"
 * }
 *
 * value:
 * [
 *     [
 *         "key => Map(1) {",
 *         "  key => \"value\"",
 *         "}"
 *     ],
 *     "key2 => \"value2\""
 * ]
 *
 * ->
 * [
 *
 * ]
 */
function ex(value: string | strings, depth: number = 0): string[] {
    const indent = '  '.repeat(depth);
    if (Array.isArray(value)) {
        return value.map(v => ex(v, depth + 1)).join('\n');
    }
    return `${indent}${value}`;
}

console.log(ex(
    [
        [
            "key => Map(1) {",
            "  key => \"value\"",
            "}"
        ],
        "key2 => \"value2\""
    ]
));