
export function isBoolean(value: string | null): boolean {
    return value === '' || value === 'true' || value === 'false';
}

export function parseBoolean(value: string | null): boolean {
    return value === 'true' || value === '';
}

export function isJSON(value: string | null): boolean {
    return typeof value === 'string' && (
        (value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']'))
    );
}

export function parseJSON(value: string | null): unknown {
    try {
        return JSON.parse(value ?? '');
    } catch {
        return value;
    }
}

export function mapEventAttribute(el: HTMLElement, attr: string): unknown {
    let eventName = attr;
    if (attr.startsWith('on')) {
        eventName = attr.slice(2);
        eventName = eventName.charAt(0).toLowerCase() + eventName.slice(1);
    }

    return function (this: unknown, ...args: unknown[]) {
        const event = new CustomEvent(eventName, {
            detail: args.length > 1 ? args : args[0],
            bubbles: true,
            composed: true
        });
        el.dispatchEvent(event);
    }.bind(el);
}

export function mapFunctionAttribute(el: HTMLElement, value: string): unknown {
    const fnName = value;
    return function (this: unknown, ...args: unknown[]) {
        if (typeof window !== "undefined" && fnName in window) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fn = (window as any)[fnName];
            if (typeof fn === 'function') {
                fn.apply(this, args);
                return;
            }
        } else if (typeof globalThis !== "undefined" && fnName in globalThis) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const fn = (globalThis as any)[fnName];
            if (typeof fn === 'function') {
                fn.apply(this, args);
                return;
            }
        }
    }.bind(el);
}

export function parseAttributeValue(value: string | null): unknown {
    if (isBoolean(value)) return parseBoolean(value);
    if (isJSON(value)) return parseJSON(value);
    const num = Number(value);
    return isNaN(num) ? value : num;
}