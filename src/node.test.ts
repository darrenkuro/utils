import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
    suppressConsole,
    verifyEnvs,
    gracefulShutdown,
    createLogger,
} from './node.ts';

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
