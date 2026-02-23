/** @darrenkuro/utils — Universal utilities (tree-shakable, no Node.js dependencies) */

// Re-export neverthrow
export {
    ok,
    err,
    Ok,
    Err,
    Result,
    ResultAsync,
    okAsync,
    errAsync,
    fromPromise,
    fromSafePromise,
    fromThrowable,
    safeTry,
} from 'neverthrow';
export type { Result as ResultType } from 'neverthrow';

// Re-export radashi - commonly used utilities
export {
    // Arrays
    alphabetical,
    boil,
    cluster,
    counting,
    diff,
    first,
    flat,
    fork,
    group,
    intersects,
    iterate,
    last,
    list,
    max,
    merge,
    min,
    objectify,
    range,
    replaceOrAppend,
    replace,
    select,
    shift,
    sift,
    sort,
    sum,
    toggle,
    unique,
    zipToObject,
    zip,
    // Async
    all,
    defer,
    guard,
    map,
    parallel,
    reduce,
    retry,
    sleep,
    tryit,
    // Object
    assign,
    clone,
    construct,
    crush,
    get,
    invert,
    keys,
    listify,
    lowerize,
    mapEntries,
    mapKeys,
    mapValues,
    omit,
    pick,
    set,
    shake,
    upperize,
    // String
    camel,
    capitalize,
    dash,
    pascal,
    snake,
    template,
    title,
    trim,
    // Number
    clamp,
    inRange,
    toFloat,
    toInt,
    // Typed
    isArray,
    isDate,
    isEmpty,
    isEqual,
    isFloat,
    isFunction,
    isInt,
    isNumber,
    isObject,
    isPrimitive,
    isPromise,
    isString,
    isSymbol,
    // Function
    debounce,
    memo,
    partial,
    partob,
    proxied,
    throttle,
    // Random
    draw,
    random,
    shuffle,
    uid,
    // Series
    series,
} from 'radashi';

// Re-export tempo - date utilities
// Note: range -> dateRange, isEqual -> dateIsEqual (avoid radashi conflicts)
export {
    // Creation
    date,
    tzDate,
    parse,
    parseParts,
    // Formatting
    format,
    formatStr,
    parts,
    iso8601,
    // Add/Subtract
    addDay,
    addMonth,
    addYear,
    addHour,
    addMinute,
    addSecond,
    addMillisecond,
    // Boundaries
    dayStart,
    dayEnd,
    monthStart,
    monthEnd,
    yearStart,
    yearEnd,
    weekStart,
    weekEnd,
    hourStart,
    hourEnd,
    minuteStart,
    minuteEnd,
    // Comparison
    isBefore,
    isAfter,
    isEqual as dateIsEqual,
    isPast,
    isFuture,
    sameDay,
    sameHour,
    sameMinute,
    sameSecond,
    sameMillisecond,
    sameYear,
    // Diff
    diffMilliseconds,
    diffSeconds,
    diffMinutes,
    diffHours,
    diffDays,
    diffWeeks,
    diffMonths,
    diffYears,
    // Utilities
    dayOfYear,
    monthDays,
    yearDays,
    fourDigitYear,
    nearestDay,
    range as dateRange,
    // Timezone
    offset,
    applyOffset,
    removeOffset,
    ap,
} from '@formkit/tempo';
export type {
    DateInput,
    Format,
    FormatOptions,
    FormatStyle,
    ParseOptions,
    Part,
} from '@formkit/tempo';

// ─────────────────────────────────────────────────────────────────────────────
// Custom Utilities (universal — no Node.js dependencies)
// ─────────────────────────────────────────────────────────────────────────────

/** Safely extracts error message from unknown error type. */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return 'unknown_error';
};
