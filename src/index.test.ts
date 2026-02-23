import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    getErrorMessage,
    suppressConsole,
    verifyEnvs,
    gracefulShutdown,
    createLogger,
} from './index.ts';

// ─────────────────────────────────────────────────────────────────────────────
// getErrorMessage
// ─────────────────────────────────────────────────────────────────────────────
describe('getErrorMessage', () => {
    it('should extract message from an Error instance', () => {
        expect(getErrorMessage(new Error('boom'))).toBe('boom');
    });

    it('should extract message from a TypeError', () => {
        expect(getErrorMessage(new TypeError('type issue'))).toBe('type issue');
    });

    it('should return the string directly when given a string', () => {
        expect(getErrorMessage('something went wrong')).toBe('something went wrong');
    });

    it('should return empty string when given an empty string', () => {
        expect(getErrorMessage('')).toBe('');
    });

    it('should extract message from an object with a message property', () => {
        expect(getErrorMessage({ message: 'obj error' })).toBe('obj error');
    });

    it('should stringify non-string message property on an object', () => {
        expect(getErrorMessage({ message: 42 })).toBe('42');
    });

    it('should return unknown_error for null', () => {
        expect(getErrorMessage(null)).toBe('unknown_error');
    });

    it('should return unknown_error for undefined', () => {
        expect(getErrorMessage(undefined)).toBe('unknown_error');
    });

    it('should return unknown_error for a number', () => {
        expect(getErrorMessage(123)).toBe('unknown_error');
    });

    it('should return unknown_error for a plain object without message', () => {
        expect(getErrorMessage({ code: 500 })).toBe('unknown_error');
    });

    it('should return unknown_error for a boolean', () => {
        expect(getErrorMessage(true)).toBe('unknown_error');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// suppressConsole
// ─────────────────────────────────────────────────────────────────────────────
describe('suppressConsole', () => {
    it('should suppress console.log and console.error during sync init', async () => {
        const captured: string[] = [];
        const origLog = console.log;
        const origError = console.error;

        // Override console temporarily to capture calls
        console.log = (...args: unknown[]) => captured.push(`log:${args.join('')}`);
        console.error = (...args: unknown[]) => captured.push(`error:${args.join('')}`);

        const result = await suppressConsole(async () => {
            // These should be suppressed (called during sync init phase)
            console.log('should be suppressed');
            console.error('should be suppressed');
            return 42;
        });

        // Restore originals
        console.log = origLog;
        console.error = origError;

        expect(result).toBe(42);
        // During fn() invocation, console is replaced with no-ops.
        // Since console.log/error inside fn() run during the sync init,
        // they call the no-op versions, so nothing should be captured.
        expect(captured).toEqual([]);
    });

    it('should restore console methods after the sync phase', async () => {
        const origLog = console.log;
        const origError = console.error;

        await suppressConsole(async () => 'done');

        // Console methods should be restored
        expect(console.log).toBe(origLog);
        expect(console.error).toBe(origError);
    });

    it('should return the resolved value of the async function', async () => {
        const result = await suppressConsole(async () => ({ key: 'value' }));
        expect(result).toEqual({ key: 'value' });
    });

    it('should propagate errors from the async function', async () => {
        await expect(
            suppressConsole(async () => {
                throw new Error('async failure');
            }),
        ).rejects.toThrow('async failure');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// verifyEnvs (returns neverthrow Result)
// ─────────────────────────────────────────────────────────────────────────────
describe('verifyEnvs', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        process.env.TEST_VAR_A = 'alpha';
        process.env.TEST_VAR_B = 'beta';
    });

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('should return Ok with env values when all keys are present', () => {
        const result = verifyEnvs(['TEST_VAR_A', 'TEST_VAR_B'] as const);
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value).toEqual({ TEST_VAR_A: 'alpha', TEST_VAR_B: 'beta' });
        }
    });

    it('should return Err when a required env var is missing', () => {
        const result = verifyEnvs(['TEST_VAR_A', 'NONEXISTENT_VAR'] as const);
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
            expect(result.error).toBe('Missing required environment variables: NONEXISTENT_VAR');
        }
    });

    it('should return Err listing all missing vars', () => {
        const result = verifyEnvs(['MISSING_1', 'MISSING_2'] as const);
        expect(result.isErr()).toBe(true);
        if (result.isErr()) {
            expect(result.error).toBe('Missing required environment variables: MISSING_1, MISSING_2');
        }
    });

    it('should return Ok with empty record for an empty keys array', () => {
        const result = verifyEnvs([] as const);
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value).toEqual({});
        }
    });

    it('should return Ok for a single present key', () => {
        const result = verifyEnvs(['TEST_VAR_A'] as const);
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
            expect(result.value).toEqual({ TEST_VAR_A: 'alpha' });
        }
    });

    it('should return Err for a single missing key', () => {
        const result = verifyEnvs(['DOES_NOT_EXIST'] as const);
        expect(result.isErr()).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// gracefulShutdown
// ─────────────────────────────────────────────────────────────────────────────
describe('gracefulShutdown', () => {
    afterEach(() => {
        process.removeAllListeners('SIGINT');
        process.removeAllListeners('SIGTERM');
    });

    it('should register SIGINT handler', () => {
        const initialCount = process.listenerCount('SIGINT');
        gracefulShutdown(() => {});
        expect(process.listenerCount('SIGINT')).toBe(initialCount + 1);
    });

    it('should register SIGTERM handler', () => {
        const initialCount = process.listenerCount('SIGTERM');
        gracefulShutdown(() => {});
        expect(process.listenerCount('SIGTERM')).toBe(initialCount + 1);
    });

    it('should register handlers for both signals', () => {
        const sigintBefore = process.listenerCount('SIGINT');
        const sigtermBefore = process.listenerCount('SIGTERM');

        gracefulShutdown(async () => {});

        expect(process.listenerCount('SIGINT')).toBe(sigintBefore + 1);
        expect(process.listenerCount('SIGTERM')).toBe(sigtermBefore + 1);
    });

    it('should accept sync cleanup functions', () => {
        expect(() => gracefulShutdown(() => {})).not.toThrow();
    });

    it('should accept async cleanup functions', () => {
        expect(() => gracefulShutdown(async () => {})).not.toThrow();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// createLogger
// ─────────────────────────────────────────────────────────────────────────────
describe('createLogger', () => {
    it('should create a logger with the given name', () => {
        const log = createLogger('test-app');
        expect(log.bindings().name).toBe('test-app');
    });

    it('should default to info level', () => {
        const log = createLogger('default-level');
        expect(log.level).toBe('info');
    });

    it('should respect a custom level', () => {
        const log = createLogger('debug-app', { level: 'debug' });
        expect(log.level).toBe('debug');
    });

    it('should accept the pretty option without throwing', () => {
        expect(() => createLogger('pretty-app', { pretty: true })).not.toThrow();
    });

    it('should merge additional pino options', () => {
        const log = createLogger('custom', {
            options: { level: 'warn' },
        });
        // The spread puts `options` last, so its level should override the default
        expect(log.level).toBe('warn');
    });

    it('should have standard pino methods', () => {
        const log = createLogger('methods-test');
        expect(typeof log.info).toBe('function');
        expect(typeof log.warn).toBe('function');
        expect(typeof log.error).toBe('function');
        expect(typeof log.debug).toBe('function');
        expect(typeof log.trace).toBe('function');
        expect(typeof log.fatal).toBe('function');
    });
});
