// This file imports and re-exports a subset of the Lodash library
// to allow for a smaller bundle. The standard lodash library can not
// be tree-shaken, resulting in a bundle size increase of approx. 100kb.
// Therefore, lodash-es is used:

export { default as get } from "lodash-es/get";
export { default as isElement } from "lodash-es/isElement";
export { default as isFunction } from "lodash-es/isFunction";
export { default as isObject } from "lodash-es/isObject";
export { default as isPlainObject } from "lodash-es/isPlainObject";
export { default as isString } from "lodash-es/isString";
