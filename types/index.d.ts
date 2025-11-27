declare module 'flat-json-diff' {
	/**
	 * Diff two objects and produce a patch.
	 * @param before - The original JSON.
	 * @param after - The modified JSON.
	 * @param {Object} options - Options for diffing.
	 * @returns - The patch object or null if no changes.
	 */
	export function diff(before: any, after: any, { noDelete, context, ...options }?: {
		noDelete?: boolean;
		context?: number;
		isAtomic?: (obj: any) => boolean;
	}): Patch | null;
	/**
	 * Apply a patch to a JSON object
	 * @param obj - A JSON object.
	 * @param patch - The patch object produced by `diff`.
	 * @param {Object} options - Options for applying the patch.
	 * @returns - The modified JSON object after applying the patch. This is not the same object as the input.
	 */
	export function applyPatch(obj: any[] | any, patch: Patch, { fuzzFactor }?: {
		fuzzFactor?: number;
	}): any;
	/**
	 * Flatten an object or array to a diff-friendly string representation.
	 * @param obj - The object or array to flatten.
	 * @param {Object} options - Options for stringification.
	 * @returns - The flattened string representation.
	 */
	export function stringify(obj: any, { isAtomic }?: {
		isAtomic?: (obj: any) => boolean;
	}): string;
	/**
	 * Parse a flattened diff-friendly string representation back to an object or array.
	 * @param str - The flattened string representation.
	 * @param {Object} options - Options for parsing.
	 * @returns - The reconstructed object or array.
	 */
	export function parse(str: string, { noDelete }?: {
		noDelete?: boolean;
	}): any;
	export type Patch = {
		/**
		 * - The patch string.
		 */
		patch: string;
		/**
		 * - The options used to create the patch.
		 */
		options: any;
	};

	export {};
}

//# sourceMappingURL=index.d.ts.map