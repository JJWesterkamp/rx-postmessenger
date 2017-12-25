// Ramda functions are imported from deep paths within the ramda package, which is the only way
// to prevent the entire library from being included by webpack. Caveat is that these imports
// must be done from withing a JS file, since the @types/ramda package does not provide type
// definitions for these deep folder locations.
//
// We'll need to provide typescript with a declaration file for the ramda tree-shaking JS file.
// These exports should be kept in sync with exports within the ramda.js file.

// export { F } from 'ramda';
// export { T } from 'ramda';
// export { __ } from 'ramda';
// export { add } from 'ramda';
// export { addIndex } from 'ramda';
// export { adjust } from 'ramda';
// export { all } from 'ramda';
export { allPass } from 'ramda';
// export { always } from 'ramda';
// export { and } from 'ramda';
// export { any } from 'ramda';
// export { anyPass } from 'ramda';
// export { ap } from 'ramda';
// export { aperture } from 'ramda';
// export { append } from 'ramda';
// export { apply } from 'ramda';
// export { applySpec } from 'ramda';
// export { applyTo } from 'ramda';
// export { ascend } from 'ramda';
// export { assoc } from 'ramda';
// export { assocPath } from 'ramda';
// export { binary } from 'ramda';
// export { bind } from 'ramda';
// export { both } from 'ramda';
// export { call } from 'ramda';
// export { chain } from 'ramda';
// export { clamp } from 'ramda';
// export { clone } from 'ramda';
// export { comparator } from 'ramda';
// export { complement } from 'ramda';
// export { compose } from 'ramda';
// export { composeK } from 'ramda';
// export { composeP } from 'ramda';
// export { concat } from 'ramda';
// export { cond } from 'ramda';
// export { construct } from 'ramda';
// export { constructN } from 'ramda';
export { contains } from 'ramda';
// export { converge } from 'ramda';
// export { countBy } from 'ramda';
// export { curry } from 'ramda';
// export { curryN } from 'ramda';
// export { dec } from 'ramda';
// export { defaultTo } from 'ramda';
// export { descend } from 'ramda';
// export { difference } from 'ramda';
// export { differenceWith } from 'ramda';
// export { dissoc } from 'ramda';
// export { dissocPath } from 'ramda';
// export { divide } from 'ramda';
// export { drop } from 'ramda';
// export { dropLast } from 'ramda';
// export { dropLastWhile } from 'ramda';
// export { dropRepeats } from 'ramda';
// export { dropRepeatsWith } from 'ramda';
// export { dropWhile } from 'ramda';
// export { either } from 'ramda';
// export { empty } from 'ramda';
// export { endsWith } from 'ramda';
// export { eqBy } from 'ramda';
// export { eqProps } from 'ramda';
export { equals } from 'ramda';
// export { evolve } from 'ramda';
// export { filter } from 'ramda';
// export { find } from 'ramda';
// export { findIndex } from 'ramda';
// export { findLast } from 'ramda';
// export { findLastIndex } from 'ramda';
// export { flatten } from 'ramda';
export { flip } from 'ramda';
// export { forEach } from 'ramda';
// export { forEachObjIndexed } from 'ramda';
// export { fromPairs } from 'ramda';
// export { groupBy } from 'ramda';
// export { groupWith } from 'ramda';
// export { gt } from 'ramda';
// export { gte } from 'ramda';
export { has } from 'ramda';
// export { hasIn } from 'ramda';
// export { head } from 'ramda';
// export { identical } from 'ramda';
// export { identity } from 'ramda';
// export { ifElse } from 'ramda';
// export { inc } from 'ramda';
// export { indexBy } from 'ramda';
// export { indexOf } from 'ramda';
// export { init } from 'ramda';
// export { innerJoin } from 'ramda';
// export { insert } from 'ramda';
// export { insertAll } from 'ramda';
// export { intersection } from 'ramda';
// export { intersperse } from 'ramda';
// export { into } from 'ramda';
// export { invert } from 'ramda';
// export { invertObj } from 'ramda';
// export { invoker } from 'ramda';
// export { is } from 'ramda';
// export { isEmpty } from 'ramda';
export { isNil } from 'ramda';
// export { join } from 'ramda';
// export { juxt } from 'ramda';
// export { keys } from 'ramda';
// export { keysIn } from 'ramda';
// export { last } from 'ramda';
// export { lastIndexOf } from 'ramda';
// export { length } from 'ramda';
// export { lens } from 'ramda';
// export { lensIndex } from 'ramda';
// export { lensPath } from 'ramda';
// export { lensProp } from 'ramda';
// export { lift } from 'ramda';
// export { liftN } from 'ramda';
// export { lt } from 'ramda';
// export { lte } from 'ramda';
// export { map } from 'ramda';
// export { mapAccum } from 'ramda';
// export { mapAccumRight } from 'ramda';
// export { mapObjIndexed } from 'ramda';
// export { match } from 'ramda';
// export { mathMod } from 'ramda';
// export { max } from 'ramda';
// export { maxBy } from 'ramda';
// export { mean } from 'ramda';
// export { median } from 'ramda';
// export { memoize } from 'ramda';
// export { memoizeWith } from 'ramda';
// export { merge } from 'ramda';
// export { mergeAll } from 'ramda';
// export { mergeDeepLeft } from 'ramda';
export { mergeDeepRight } from 'ramda';
// export { mergeDeepWith } from 'ramda';
// export { mergeDeepWithKey } from 'ramda';
// export { mergeWith } from 'ramda';
// export { mergeWithKey } from 'ramda';
// export { min } from 'ramda';
// export { minBy } from 'ramda';
// export { modulo } from 'ramda';
// export { multiply } from 'ramda';
// export { nAry } from 'ramda';
// export { negate } from 'ramda';
// export { none } from 'ramda';
export { not } from 'ramda';
// export { nth } from 'ramda';
// export { nthArg } from 'ramda';
// export { o } from 'ramda';
// export { objOf } from 'ramda';
// export { of } from 'ramda';
// export { omit } from 'ramda';
// export { once } from 'ramda';
// export { or } from 'ramda';
// export { over } from 'ramda';
// export { pair } from 'ramda';
// export { partial } from 'ramda';
// export { partialRight } from 'ramda';
// export { partition } from 'ramda';
// export { path } from 'ramda';
// export { pathEq } from 'ramda';
// export { pathOr } from 'ramda';
// export { pathSatisfies } from 'ramda';
// export { pick } from 'ramda';
// export { pickAll } from 'ramda';
// export { pickBy } from 'ramda';
export { pipe } from 'ramda';
// export { pipeK } from 'ramda';
// export { pipeP } from 'ramda';
// export { pluck } from 'ramda';
// export { prepend } from 'ramda';
// export { product } from 'ramda';
// export { project } from 'ramda';
export { prop } from 'ramda';
export { propEq } from 'ramda';
// export { propIs } from 'ramda';
// export { propOr } from 'ramda';
// export { propSatisfies } from 'ramda';
// export { props } from 'ramda';
// export { range } from 'ramda';
// export { reduce } from 'ramda';
// export { reduceBy } from 'ramda';
// export { reduceRight } from 'ramda';
// export { reduceWhile } from 'ramda';
// export { reduced } from 'ramda';
// export { reject } from 'ramda';
// export { remove } from 'ramda';
// export { repeat } from 'ramda';
// export { replace } from 'ramda';
// export { reverse } from 'ramda';
// export { scan } from 'ramda';
// export { sequence } from 'ramda';
// export { set } from 'ramda';
// export { slice } from 'ramda';
// export { sort } from 'ramda';
// export { sortBy } from 'ramda';
// export { sortWith } from 'ramda';
// export { split } from 'ramda';
// export { splitAt } from 'ramda';
// export { splitEvery } from 'ramda';
// export { splitWhen } from 'ramda';
// export { startsWith } from 'ramda';
// export { subtract } from 'ramda';
// export { sum } from 'ramda';
// export { symmetricDifference } from 'ramda';
// export { symmetricDifferenceWith } from 'ramda';
// export { tail } from 'ramda';
// export { take } from 'ramda';
// export { takeLast } from 'ramda';
// export { takeLastWhile } from 'ramda';
// export { takeWhile } from 'ramda';
// export { tap } from 'ramda';
// export { test } from 'ramda';
// export { times } from 'ramda';
// export { toLower } from 'ramda';
// export { toPairs } from 'ramda';
// export { toPairsIn } from 'ramda';
// export { toString } from 'ramda';
// export { toUpper } from 'ramda';
// export { transduce } from 'ramda';
// export { transpose } from 'ramda';
// export { traverse } from 'ramda';
// export { trim } from 'ramda';
// export { tryCatch } from 'ramda';
// export { type } from 'ramda';
// export { unapply } from 'ramda';
// export { unary } from 'ramda';
// export { uncurryN } from 'ramda';
// export { unfold } from 'ramda';
// export { union } from 'ramda';
// export { unionWith } from 'ramda';
// export { uniq } from 'ramda';
// export { uniqBy } from 'ramda';
// export { uniqWith } from 'ramda';
// export { unless } from 'ramda';
// export { unnest } from 'ramda';
// export { until } from 'ramda';
// export { update } from 'ramda';
// export { useWith } from 'ramda';
// export { values } from 'ramda';
// export { valuesIn } from 'ramda';
// export { view } from 'ramda';
// export { when } from 'ramda';
// export { where } from 'ramda';
// export { whereEq } from 'ramda';
// export { without } from 'ramda';
// export { xprod } from 'ramda';
// export { zip } from 'ramda';
// export { zipObj } from 'ramda';
// export { zipWith } from 'ramda';