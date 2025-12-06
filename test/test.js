import test from "node:test";
import assert from "node:assert/strict";

import {diff, applyPatch} from "../index.js";

test("simple test", () => {
  const before = [1, 2, 3];
  const after = [1, 2, 4, 5];
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const result = applyPatch([3], changes);
  assert.deepEqual(result, [4, 5]);
});

test("diff object", {skip: false}, () => {
  const before = {a: 1, b: 2, c: 3};
  const after = {a: 1, b: 2, c: 4, d: 5};
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const result = applyPatch(
    {a: 9, b: 8, c: 3},
    changes
  );
  assert.deepEqual(result, {a: 9, b: 8, c: 4, d: 5});
});

test("diff object context line unchange", () => {
  const before = {a: 1, b: 2, c: 3};
  const after = {a: 1, b: 2, c: 4, d: 5};
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const result = applyPatch(
    {a: 9, b: 2, c: 3},
    changes
  );
  assert.deepEqual(result, {a: 9, b: 2, c: 4, d: 5});
});

test("object prop insertion doesn't work", () => {
  const before = {a: 1, b: 2};
  const after = {a: 1, b: 2, c: 3};
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  assert.throws(() => {
    applyPatch(
      {a: 9, b: 8},
      changes
    );
  });
});

test("no change", () => {
  const changes = diff([1, 2, 3], [1, 2, 3]);
  assert(!changes);
});

test("remove a bookmark", () => {
  const before = [
    {title: "A", url: "a"},
    {title: "B", url: "b"},
    {title: "C", url: "c"},
  ];
  const after = [
    {title: "A", url: "a"},
    {title: "C", url: "c"},
  ];
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const remote = [
    {title: "A", url: "X"},
    {title: "B", url: "b"},
    {title: "C", url: "c"},
  ]
  const expected = [
    {title: "A", url: "X"},
    {title: "C", url: "c"},
  ];
  const result = applyPatch(remote, changes);
  assert.deepEqual(result, expected);
});

test("remove a modified bookmark", () => {
  const before = [
    {title: "A", url: "a"},
    {title: "B", url: "b"},
    {title: "C", url: "c"},
  ];
  const after = [
    {title: "A", url: "a"},
    {title: "C", url: "c"},
  ];
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const remote = [
    {title: "A", url: "a"},
    {title: "B", url: "X"},
    {title: "C", url: "c"},
  ]
  // const expected = [
  //   {title: "A", url: "a"},
  //   {title: "C", url: "c"},
  // ];
  assert.throws(() => {
    applyPatch(remote, changes);
  });
});

test("add a bookmark", () => {
  const before = [
    {title: "A", url: "a"},
    {title: "C", url: "c"},
  ];
  const after = [
    {title: "A", url: "a"},
    {title: "B", url: "b"},
    {title: "C", url: "c"},
  ];
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const remote = [
    {title: "A", url: "X"},
    {title: "C", url: "c"},
  ]
  const expected = [
    {title: "A", url: "X"},
    {title: "B", url: "b"},
    {title: "C", url: "c"},
  ];
  const result = applyPatch(remote, changes);
  assert.deepEqual(result, expected);
});

test("add a bookmark while new remote", () => {
  const before = [
    {title: "A", url: "a"},
    {title: "C", url: "c"},
  ];
  const after = [
    {title: "A", url: "a"},
    {title: "B", url: "b"},
    {title: "C", url: "c"},
  ];
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const remote = [
    {title: "O", url: "o"},
    {title: "A", url: "a"},
    {title: "C", url: "c"},
  ]
  const expected = [
    {title: "O", url: "o"},
    {title: "A", url: "a"},
    {title: "B", url: "b"},
    {title: "C", url: "c"},
  ];
  const result = applyPatch(remote, changes);
  assert.deepEqual(result, expected);
});

test("add with move", () => {
  const before = [
    {title: "A", url: "a"},
    {title: "C", url: "c"},
  ];
  const after = [
    {title: "C", url: "c"},
    {title: "B", url: "b"},
    {title: "A", url: "a"},
  ];
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const remote = [
    {title: "X", url: "x"},
    {title: "A", url: "a"},
    {title: "C", url: "c"},
  ]
  const expected = [
    {title: "X", url: "x"},
    {title: "C", url: "c"},
    {title: "B", url: "b"},
    {title: "A", url: "a"},
  ];
  const result = applyPatch(remote, changes);
  assert.deepEqual(result, expected);
});

test("add children with change", () => {
  const before = [
    {title: "A", url: "a"},
    {title: "B", url: "b", children: []}
  ];
  const after = [
    {title: "A", url: "a"},
    {title: "B", url: "b", children: [
      {title: "B1", url: "b1"},
      {title: "B2", url: "b2"},
    ]}
  ];
  const changes = diff(before, after);
  assert.deepEqual(applyPatch(before, changes), after);

  const remote = [
    {title: "C", url: "c"},
    {title: "A", url: "a"},
    {title: "B", url: "x", children: []}
  ]
  const expected = [
    {title: "C", url: "c"},
    {title: "A", url: "a"},
    {title: "B", url: "x", children: [
      {title: "B1", url: "b1"},
      {title: "B2", url: "b2"},
    ]},
  ];
  const result = applyPatch(remote, changes);
  assert.deepEqual(result, expected);
});

test("no delete", () => {
  const before = [
    {title: "B", url: "b"},
    {title: "D", url: "d"},
  ];
  const after = [
    {title: "A", url: "u"},
    {title: "C", url: "c"},
  ];
  const changes = diff(before, after, {noDelete: true});
  // FIXME: does this really make sense?
  const expected = [
    {title: "BA", url: "bu"},
    {title: "DC", url: "dc"},
  ];
  const result = applyPatch(before, changes);
  assert.deepEqual(result, expected);
})

test("no delete + isAtomic", () => {
  const before = [
    {title: "B", url: "b"},
    {title: "D", url: "d"},
    {title: "G", url: "g"},
  ]
  const after = [
    {title: "A", url: "u"},
    {title: "C", url: "c"},
    {title: "G", url: "g"},
  ];
  const expected = [
    {title: "B", url: "b"},
    {title: "A", url: "u"},
    {title: "D", url: "d"},
    {title: "C", url: "c"},
    {title: "G", url: "g"},
  ];
  const changes = diff(before, after, {noDelete: true, isAtomic: obj => obj.title && obj.url && !obj.children});
  const result = applyPatch(before, changes);
  assert.deepEqual(result, expected);
});

