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

The library flattens the JSON objects/arrays to diff-friendly lines, [diffs](https://www.npmjs.com/package/diff) the lines, creates a patch.

When applying the patch, it flattens the target object/array to lines, apply the patch to the lines, and finally unflattens it back to JSON.

Limitations
-----------

There are some limitations: https://github.com/kpdecker/jsdiff

> Regardless of fuzzFactor, lines to be deleted in the hunk must be present for a hunk to match, and the context lines immediately before and after an insertion must match exactly.

1. Modifying a deleted line/Deleting a modified line will always fail.
2. When adding property, the property before/after the changed property must be the same. Ideally, adding an object property should always succeed.

In the future, we should use DP with a "least change" strategy.

API references
--------------

Check the [.d.ts file](./types/index.d.ts) for TypeScript type definitions.

Changelog
---------

* 0.1.0 (Nov 27, 2025)

  - First release
