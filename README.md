flat-json-diff
==============

[![test](https://github.com/eight04/flat-json-diff/actions/workflows/test.yml/badge.svg)](https://github.com/eight04/flat-json-diff/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/eight04/flat-json-diff/branch/master/graph/badge.svg)](https://codecov.io/gh/eight04/flat-json-diff)

An experimental library to diff JSON objects/arrays by flattening them. It can create a patch between two JSON objects/arrays, and apply the patch to another JSON object/array. Use by [bookmark-to-gist](https://github.com/eight04/bookmark-to-gist).

Installation
------------

```
npm install flat-json-diff
```

Usage
-----

```JavaScript
import {createPatch, applyPatch} from "flat-json-diff";

const a = [
  {title: "foo", tags: ["a", "b"]},
  {title: "bar", tags: ["b", "c"]},
];
const b = [
  {title: "foo", tags: ["a", "b", "d"]},
  {title: "bar", tags: ["c"]},
  {title: "baz", tags: []},
];
const patch = createPatch(a, b);
const c = applyPatch([
  {title: "bak", tags: ["x"]},
  {title: "foo", tags: []},
  {title: "bar", tags: ["b"]},
], patch);
console.log(c);
// [
//   { title: 'bak', tags: ["x"] }
//   { title: 'foo', tags: ["d"] },
//   { title: 'bar', tags: [] },
//   { title: 'baz', tags: [] }
// ]
```

How it works
------------

The library flattens the JSON objects/arrays to diff-friendly lines, [diffs](https://www.npmjs.com/package/diff) the lines to create a patch.

When applying the patch, it flattens the target object/array to lines, apply the patch to the lines, and finally unflattens it back to JSON.

Limitations
-----------

There are some limitations: https://github.com/kpdecker/jsdiff

> Regardless of fuzzFactor, lines to be deleted in the hunk must be present for a hunk to match, and the context lines immediately before and after an insertion must match exactly.

1. Modifying a deleted line/Deleting a modified line will always fail.
2. When adding property, the property before/after the changed property must be the same. Ideally, adding an object property should always succeed.

API references
--------------

Check the [.d.ts file](./types/index.d.ts) for TypeScript type definitions.

Alternatives
------------

Because I'm working with bookmark JSON diff, it is crucial to detect move operations. Also bookmarks don't have an object ID, so most of the simple solutions won't work well.

* [diff](https://www.npmjs.com/package/diff): The underlying diff library used in this project. It is designed for text diff.

Other json diff tools:

* [rfc6902](https://www.npmjs.com/package/rfc6902): Support remove, add, replace.
* [mini-rfc6902](https://www.npmjs.com/package/mini-rfc6902/v/0.0.1): A minimal RFC6902 implementation.
* [json-diff-ts](https://www.npmjs.com/package/json-diff-ts?activeTab=readme): Support object ID. No move operation.
* [diffptch](https://www.npmjs.com/package/dffptch): Treats arrays as non-ordered set.
* [json-diff-kit](https://www.npmjs.com/package/json-diff-kit?activeTab=readme): Support multiple array diff methods. No move operation.
* [jsondiffpatch](https://github.com/benjamine/jsondiffpatch): Probably the most robust JSON diff library. Uses object hash to detect move operations.

The best solution should be something like:

1. Suppose we have three versions: A -> B, A -> C, and we need a merge of B and C.
2. Diff A -> B to get a patch P1.
3. Diff A -> C to get a patch P2.
4. According the information on A, merge P1 and P2 to get P3.
5. Apply P3 to A to get the merged result.

When diffing arrays, it should calculate the smallest changes between two arrays, considering move, add, delete, and modify operations, with [munkres](https://www.npmjs.com/package/munkres) or similar algorithms.

Changelog
---------

* 0.1.0 (Nov 28, 2025)

  - First release
