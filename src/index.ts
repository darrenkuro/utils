/** @darrenlu/utils — Personal utility package */

import { execFile } from 'child_process';
import { ok, err, type Result } from 'neverthrow';

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

// Re-export pino
import pinoLib, { type LoggerOptions } from 'pino';
export { pinoLib as pino };

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface CreateLoggerOptions {
    level?: LogLevel;
    pretty?: boolean;
    options?: LoggerOptions;
}

/**
 * Create a named logger.
 * @param name - Logger name
 * @param opts - { level?: LogLevel, pretty?: boolean, options?: LoggerOptions }
 */
export const createLogger = (name: string, opts: CreateLoggerOptions = {}): Logger => {
    const { level = 'info', pretty = false, options } = opts;
    return pinoLib({
        name,
        level,
        transport: pretty ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
        ...options,
    });
};

/** Default pino logger with pino-pretty console output. */
export const logger = pinoLib({
    level: 'debug',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname,module',
            messageFormat: '{if module}[{module}] {end}{msg}',
        },
    },
});

export type Logger = typeof logger;

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
// Note: range -> dateRange, isEqual -> dateIsEqual (avoid radash conflicts)
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
// Custom Utilities
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Suppress console output during synchronous initialization of an async function.
 * Console is only suppressed during fn() call, NOT during the await.
 */
export const suppressConsole = async <T>(fn: () => Promise<T>): Promise<T> => {
    const origLog = console.log;
    const origError = console.error;
    console.log = () => {};
    console.error = () => {};
    const promise = fn();
    console.log = origLog;
    console.error = origError;
    return await promise;
};

/** Safely extracts error message from unknown error type. */
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return 'unknown_error';
};

/** macOS notification via Notification Center. No-op on non-macOS. */
export const sendNotification = (title: string, message: string): void => {
    if (process.platform !== 'darwin') return;
    const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    const script = `display notification "${esc(message)}" with title "${esc(title)}"`;
    execFile('osascript', ['-e', script], () => {});
};

/** Play a macOS system sound. Accepts a sound name (e.g. 'Glass', 'Ping') or file path. No-op on non-macOS. */
export const playSound = (sound = 'Glass'): void => {
    if (process.platform !== 'darwin') return;
    const path = sound.includes('/') ? sound : `/System/Library/Sounds/${sound}.aiff`;
    execFile('afplay', [path], () => {});
};

/** Validates that all required environment variables are set. Returns Result with typed record or error message. */
export const verifyEnvs = <T extends string>(keys: readonly T[]): Result<Record<T, string>, string> => {
    const missing = keys.filter(k => !process.env[k]);
    if (missing.length > 0) {
        return err(`Missing required environment variables: ${missing.join(', ')}`);
    }
    return ok(Object.fromEntries(keys.map(k => [k, process.env[k]!])) as Record<T, string>);
};

/** Registers SIGINT/SIGTERM handlers that run cleanup once, then exit. */
export const gracefulShutdown = (cleanup: () => Promise<void> | void): void => {
    let shuttingDown = false;
    const handler = async () => {
        if (shuttingDown) return;
        shuttingDown = true;
        try {
            await cleanup();
        } catch {
            process.exit(1);
        }
        process.exit(0);
    };
    process.on('SIGINT', handler);
    process.on('SIGTERM', handler);
};
