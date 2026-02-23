import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './index.ts';

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
