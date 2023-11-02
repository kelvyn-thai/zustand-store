export { default as pick } from 'lodash/pick';
export { default as get } from 'lodash/get';
export { default as omit } from 'lodash/omit';
export { default as debounce } from 'lodash/debounce';
export { default as isEqual } from 'lodash/isEqual';
export { default as isEmpty } from 'lodash/isEmpty';
export { default as capitalize } from 'lodash/capitalize';
export { default as uniqBy } from 'lodash/uniqBy';
export { default as differenceWith } from 'lodash/differenceWith';
export { default as set } from 'lodash/set';
export { default as flatten } from 'lodash/flatten';
export { default as union } from 'lodash/union';
export { default as omitBy } from 'lodash/omitBy';
export { default as orderBy } from 'lodash/orderBy';
export { default as groupBy } from 'lodash/groupBy';
export { default as trim } from 'lodash/trim';
export { default as find } from 'lodash/find';
export { default as isNumber } from 'lodash/isNumber';
export { default as assign } from 'lodash/assign';
export { default as cloneDeep } from 'lodash/cloneDeep';
export { default as toNumber } from 'lodash/toNumber';
export { default as concat } from 'lodash/concat';
export { default as sortBy } from 'lodash/sortBy';
export { default as startCase } from 'lodash/startCase';
export { default as includes } from 'lodash/includes';
export { default as toString } from 'lodash/toString';
export { default as throttle } from 'lodash/throttle';
export { default as isNaN } from 'lodash/isNaN';
export { default as uniqueId } from 'lodash/uniqueId';
export { default as merge } from 'lodash/merge';
export { default as isFinite } from 'lodash/isFinite';
export { default as isPlainObject } from 'lodash/isPlainObject';
export { default as remove } from 'lodash/remove';
export { default as pullAt } from 'lodash/pullAt';
export { default as kebabCase } from 'lodash/kebabCase';
export { default as fill } from 'lodash/fill';
export { default as compact } from 'lodash/compact';
export { default as memoize } from 'lodash/memoize';
export { default as uniq } from 'lodash/uniq';
export { default as sumBy } from 'lodash/sumBy';
export { default as sum } from 'lodash/sum';
export { default as findLastIndex } from 'lodash/findLastIndex';
export { default as xor } from 'lodash/xor';
export { default as findKey } from 'lodash/findKey';
export { default as trimEnd } from 'lodash/trimEnd';
export { default as isBoolean } from 'lodash/isBoolean';
export { default as intersectionBy } from 'lodash/intersectionBy';

/**
 * Gets the first element of array.
 * @param array The array to query.
 * @return  Returns the first element of array.
 */
export const head = <T>(array?: T[] | null): T | undefined => (array?.length ? array[0] : undefined);

/**
 * Gets the last element of array.
 * @param array The array to query.
 * @return Returns the last element of array.
 */
export const last = <T>(array?: T[] | null): T | undefined => (array?.length ? array[array.length - 1] : undefined);

/**
 * Creates an array of the own enumerable property names of object.
 *
 * Note: Non-object values are coerced to objects. See the ES spec for more details.
 * @param object The object to query.
 * @return Returns the array of property names.
 */
export const keys = Object.keys;

/**
 * Checks if value is undefined.
 * @param value The value to check.
 * @return Returns true if value is undefined, else false.
 */
export const isUndefined = <T>(value: T): boolean => typeof value === 'undefined';

/**
 * Checks if `value` is `null` or `undefined`.
 * @param value The value to check.
 * @returns Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */
export const isNil = <T>(value: T): boolean => value == null;

/**
 * Checks if `key` is a direct property of `object`.
 * @param {Object} object The object to query.
 * @param {string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 * @example
 *
 * const object = { 'a': { 'b': 2 } }
 *
 * has(object, 'a')
 * // => true
 */
export const has = <T>(object: T, key: string): boolean => {
  return object != null && Object.prototype.hasOwnProperty.call(object, key);
};

/**
 * Checks if value is classified as an Array object.
 * @param value The value to check.
 * @return Returns true if value is correctly classified, else false.
 */
export const isArray = Array.isArray;

/**
 * Checks if `value` is `null`.
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `null`, else `false`.
 * @example
 *
 * isNull(null)
 * // => true
 *
 * isNull(void 0)
 * // => false
 */
export const isNull = <T>(value: T): boolean => value === null;
