import {createPatch, applyPatch as _applyPatch, parsePatch, formatPatch} from 'diff';
import jsonStringify from "safe-stable-stringify";

import * as jp from './lib/json-path.js';

/**
 * @typedef {Object} Patch
 * @property {string} patch - The patch string.
 * @property {Object} options - The options used to create the patch.
 */

/**
 * Diff two objects and produce a patch.
 * @param {any} before - The original JSON.
 * @param {any} after - The modified JSON.
 * @param {Object} [options] - Options for diffing.
 * @param {boolean} [options.noDelete=false] - If true, do not include deletions in the patch. This is useful for merging changes where you want to add or modify items but not remove any existing items.
 * @param {number} [options.context] - The number of context lines to include in the patch. If not provided, it will be calculated based on the size of the input.
 * @param {(obj) => boolean} [options.isAtomic] - A function to determine if an object should be treated as atomic. This will affect whether the entire object will be replaced or the properties of the object will be replaced.
 * @returns {Patch|null} - The patch object or null if no changes.
 */
export function diff(before, after, {noDelete = false, context, ...options} = {}) {
  const str1 = stringify(before, options);
  const str2 = stringify(after, options);
  // FIXME: context should be calculated based on the size of the first hunk
  if (context == null) {
    context = Math.min(1, Math.round(str1.split('\n').length / 2));
  }
  let patch = createPatch('array-diff', str1, str2, null, null, { context });
  // const changes = diffLines(str1, str2);
  if (!/^@@/m.test(patch)) {
    return null;
  }
  if (noDelete) {
    const parsedPatch = parsePatch(patch);
    for (const p of parsedPatch) {
      for (const hunk of p.hunks) {
        hunk.lines = hunk.lines.map(line => {
          if (line.startsWith('-')) {
            hunk.newLines++;
            return ' ' + line.slice(1);
          }
          return line;
        });
      }
    }
    patch = formatPatch(parsedPatch);
  }
  return {patch, options: {noDelete, ...options}};
}

/**
 * Apply a patch to a JSON object
 * @param {Array|Object} obj - A JSON object.
 * @param {Patch} patch - The patch object produced by `diff`.
 * @param {Object} [options] - Options for applying the patch.
 * @param {number} [options.fuzzFactor=20] - The fuzz factor for applying the patch. Higher values allow for more context line mismatches.
 * @returns {any} - The modified JSON object after applying the patch. This is not the same object as the input.
 */
export function applyPatch(obj, patch, {fuzzFactor = 20} = {}) {
  const str = stringify(obj, patch.options);
  // FIXME: how to choose fuzzFactor?
  const patchedStr = _applyPatch(str, patch.patch, { fuzzFactor });
  if (patchedStr === false) {
    throw new Error('Failed to apply patch');
  }
  return parse(patchedStr, patch.options);
}

/**
 * Flatten an object or array to a diff-friendly string representation.
 * @param {any} obj - The object or array to flatten.
 * @param {Object} [options] - Options for stringification.
 * @param {(obj) => boolean} [options.isAtomic] - A function to determine if an object should be treated as atomic. This will affect whether the entire object will be replaced or the properties of the object will be replaced.
 * @returns {string} - The flattened string representation.
 */
export function stringify(obj, {isAtomic} = {}) {
  return Array.from(_stringify(obj)).join('\n');

  function *_stringify(obj, prefix = '') {
    if (typeof obj === "object" && obj !== null && isAtomic?.(obj)) {
      yield `${prefix} = ${jsonStringify(obj)}`;
    } else if (Array.isArray(obj)) {
      // yield `${prefix} = []`;
      for (const item of obj) {
        yield `${prefix}[] = sep`;
        yield* _stringify(item, `${prefix}[]`);
      }
      yield `${prefix}[] = sep`;
    } else if (typeof obj === 'object' && obj !== null) {
      if (Object.keys(obj).length === 0) {
        yield `${prefix} = {}`;
      } else {
        for (const key of Object.keys(obj).sort()) {
          yield* _stringify(obj[key], `${prefix}.${key}`);
        }
      }
    } else if (obj === undefined) {
      yield `${prefix} = undefined`;
    } else {
      if (/\.[^[\]]*$/.test(prefix)) {
        // property of an object
        // keep them separated so changing value will still have one path line unchange
        yield `${prefix} = nol`;
        yield `${prefix} = ${JSON.stringify(obj)}`;
      } else {
        yield `${prefix} = ${JSON.stringify(obj)}`;
      }
    }
  }
}

/**
 * Parse a flattened diff-friendly string representation back to an object or array.
 * @param {string} str - The flattened string representation.
 * @param {Object} [options] - Options for parsing.
 * @param {boolean} [options.noDelete=false] - If true, do not delete existing properties when setting new values. This is useful for merging changes where you want to add or modify items but not remove any existing items.
 * @returns {any} - The reconstructed object or array.
 */
export function parse(str, {noDelete = false} = {}) {
  const lines = str.split('\n');
  return _parse(lines);

  function _parse(lines) {
    let root;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(\S+) = (.*)$/);
      const path = match[1];
      const valueStr = match[2];
      if (valueStr === 'sep') {
        let arr;
        [root, arr] = jp.set(root, path.slice(0, -2), [], "skip");
        arr.length += 1;
        // add a new slot for the next element
        continue;
      }
      let value;
      if (valueStr === 'nol') {
        continue;
        // value = JSON.parse(lines[i]);
      } else {
        value = valueStr === 'undefined' ? undefined : JSON.parse(valueStr);
      }
      [root] = jp.set(root, path, value, noDelete ? "append" : "overwrite");
    }
    // Clean up trailing empty slots in arrays
    jp.traverse(root, obj => {
      if (Array.isArray(obj)) {
        if (obj.length > 0 && obj[obj.length - 1] === undefined) {
          obj.length -= 1;
        }
      }
    });
    return root;
  }
}

