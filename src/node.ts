/** @darrenkuro/utils/node — Node.js-specific utilities */

import { execFile } from 'child_process';
import { ok, err, type Result } from 'neverthrow';
import pinoLib, { type LoggerOptions } from 'pino';

// Re-export pino
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
