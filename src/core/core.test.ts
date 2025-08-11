// core.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    isBoolean,
    parseBoolean,
    isJSON,
    parseJSON,
    mapEventAttribute,
    mapFunctionAttribute,
    parseAttributeValue
} from './core';

describe('core utils', () => {
    describe('isBoolean', () => {
        it('recognizes booleans encoded in attribute', () => {
            expect(isBoolean('')).toBe(true);
            expect(isBoolean('true')).toBe(true);
            expect(isBoolean('false')).toBe(true);
            expect(isBoolean('True')).toBe(false);
            expect(isBoolean(null)).toBe(false);
            expect(isBoolean('0')).toBe(false);
        });
    });

    describe('parseBoolean', () => {
        it('parses "" and "true" as true, "false" as false', () => {
            expect(parseBoolean('')).toBe(true);
            expect(parseBoolean('true')).toBe(true);
            expect(parseBoolean('false')).toBe(false);
        });
    });

    describe('isJSON', () => {
        it('naively detects JSON object/array strings via boundaries', () => {
            expect(isJSON('{"a":1}')).toBe(true);
            expect(isJSON('[1,2,3]')).toBe(true);
            expect(isJSON('{')).toBe(false);
            expect(isJSON('["]')).toBe(true);
            expect(isJSON('true')).toBe(false);
            expect(isJSON(null)).toBe(false);
        });
    });

    describe('parseJSON', () => {
        it('returns the parsed object/array when valid', () => {
            expect(parseJSON('{"a":1}')).toEqual({ a: 1 });
            expect(parseJSON('[1,2]')).toEqual([1, 2]);
        });
        it('in case of failure, returns the input value as is', () => {
            expect(parseJSON('not-json')).toBe('not-json');
            expect(parseJSON('{invalid}')).toBe('{invalid}');
            expect(parseJSON(null)).toBe(null);
        });
    });

    describe('parseAttributeValue', () => {
        it('handles booleans, JSON, numbers and defaults to string', () => {
            // booleans (via isBoolean/parseBoolean)
            expect(parseAttributeValue('')).toBe(true);
            expect(parseAttributeValue('true')).toBe(true);
            expect(parseAttributeValue('false')).toBe(false);

            // JSON
            expect(parseAttributeValue('{"x":2}')).toEqual({ x: 2 });
            expect(parseAttributeValue('[3,4]')).toEqual([3, 4]);

            // number
            const n = parseAttributeValue('42');
            expect(n).toBe(42);
            expect(typeof n).toBe('number');

            const f = parseAttributeValue('3.14');
            expect(f).toBeCloseTo(3.14);
            expect(typeof f).toBe('number');

            // string (NaN => keeps the value)
            const s = parseAttributeValue('42px');
            expect(s).toBe('42px');
            expect(typeof s).toBe('string');
        });
    });

    describe('mapEventAttribute', () => {
        it('converts onXxx to eventName camelCase -> lower first char and emits CustomEvent with detail', () => {
            const el = document.createElement('div');
            const handler = mapEventAttribute(el, 'onChange') as (...args: unknown[]) => void;

            const received: Array<unknown> = [];
            el.addEventListener('change', (e) => {
                const ce = e as CustomEvent;
                received.push(ce.detail, ce.bubbles, ce.composed);
            });

            handler('payload-1');
            expect(received[0]).toBe('payload-1');
            expect(received[1]).toBe(true);
            expect(received[2]).toBe(true);
        });

        it('if there is no "on" prefix, the attribute is used as is', () => {
            const el = document.createElement('div');
            const handler = mapEventAttribute(el, 'customEvent') as (...args: unknown[]) => void;

            let got: unknown = undefined;
            el.addEventListener('customEvent', (e) => {
                got = (e as CustomEvent).detail;
            });

            handler({ a: 1 }, 2);
            expect(got).toEqual([{ a: 1 }, 2]);
        });
    });

    describe('mapFunctionAttribute', () => {
        const originalOnWindow = (globalThis as any).myGlobalFn;
        const originalOther = (globalThis as any).otherFn;

        beforeEach(() => {
            // reset globals between tests
            delete (globalThis as any).myGlobalFn;
            delete (globalThis as any).otherFn;
        });

        afterEach(() => {
            // restore if necessary
            if (originalOnWindow) (globalThis as any).myGlobalFn = originalOnWindow;
            if (originalOther) (globalThis as any).otherFn = originalOther;
            vi.restoreAllMocks();
        });

        it('resolves and calls a function exposed on globalThis/window with the correct this + args', () => {
            const spy = vi.fn(function (this: unknown, ...args: unknown[]) {
                // will check via expect
            });
            (globalThis as any).myGlobalFn = spy;

            const el = document.createElement('div');
            const fn = mapFunctionAttribute(el, 'myGlobalFn') as (...args: unknown[]) => void;

            const args = [{ x: 1 }, 2, 'z'];
            fn(...args);

            expect(spy).toHaveBeenCalledTimes(1);
            expect(spy).toHaveBeenCalledWith(...args);

            // Vitest does not store this automatically; we test via mock.instances
            expect(spy.mock.instances[0]).toBe(el);
        });

        it("does nothing if the name does not exist on global", () => {
            const el = document.createElement('div');
            const fn = mapFunctionAttribute(el, 'doesNotExist') as (...args: unknown[]) => void;

            // No error, no possible call to check. We just ensure the invocation does not throw.
            expect(() => fn(1, 2, 3)).not.toThrow();
        });
    });
});