import type React from "react";
import ReactDOM from "react-dom/client";
import {mapEventAttribute, mapFunctionAttribute, parseAttributeValue} from "./core";

export interface WrapperProps<P = Record<string, unknown>> {
    shadowRoot: ShadowRoot;
    theme: string | null;
    component: React.ReactNode;
    props?: P;
}

export type AttributeMapper<P> = (el: HTMLElement) => P;

export interface ReactWebComponentOptions<P = Record<string, unknown>> {
    tagName: string;
    observedAttributes: string[];
    functionAttributes?: string[];
    eventAttributes?: string[];
    render: (props: P, shadowRoot: ShadowRoot) => React.ReactNode;
    mapAttributesToProps?: AttributeMapper<P>;
    WrapperComponent: React.ComponentType<WrapperProps<P>>;
}

export function createReactWebComponent({
                                            tagName,
                                            observedAttributes,
                                            eventAttributes = [],
                                            functionAttributes = [],
                                            render,
                                            mapAttributesToProps = (el) => {
                                                const props: Record<string, unknown> = {};
                                                const observedAttrsLowCase = observedAttributes.map(attr => attr.toLowerCase());
                                                const eventAttributesLowCase = eventAttributes.map(attr => attr.toLowerCase());
                                                const functionAttributesLowCase = functionAttributes.map(attr => attr.toLowerCase());

                                                for (const attr of el.getAttributeNames()) {
                                                    if (attr === 'theme') continue;

                                                    const rawValue = el.getAttribute(attr);
                                                    if (observedAttrsLowCase.includes(attr)) {
                                                        const originalAttr = observedAttributes.find(oAttr => oAttr.toLowerCase() === attr) || attr;
                                                        props[originalAttr] = parseAttributeValue(rawValue);
                                                    }
                                                    else if (functionAttributesLowCase.includes(attr)) {
                                                        const originalAttr = functionAttributes.find(oAttr => oAttr.toLowerCase() === attr) || attr;
                                                        props[originalAttr] = mapFunctionAttribute(el, rawValue ?? '');
                                                    }
                                                    else if (eventAttributesLowCase.includes(attr)) {
                                                        const originalAttr = eventAttributes.find(oAttr => oAttr.toLowerCase() === attr) || attr;
                                                        props[originalAttr] = mapEventAttribute(el, attr);
                                                    }
                                                }
                                                return props;
                                            },
                                            WrapperComponent
                                        }: ReactWebComponentOptions) :  CustomElementConstructor {


    class WebComponent extends HTMLElement {
        static get observedAttributes() {
            return [...observedAttributes, ...(eventAttributes ?? [])];
        }

        private props: Record<string, unknown> = {};
        private root: ReactDOM.Root | null = null;
        private theme: string | null = null;

        constructor() {
            super();
            this.attachShadow({mode: 'open'});
        }

        connectedCallback() {
            this.props = mapAttributesToProps(this);
            this.theme = this.getAttribute('theme');
            this.render();
        }

        disconnectedCallback() {
            if (this.root) {
                this.root.unmount();
                this.root = null;
            }
        }

        adoptedCallback() {
            console.log(`${tagName} adopted into new document.`);
        }

        attributeChangedCallback(name: string, oldValue: string, newValue: string) {
            if (newValue !== oldValue) {
                if (name === 'theme') {
                    this.theme = newValue;
                }
                this.props = mapAttributesToProps(this);
                this.render();
            }
        }

        render() {
            if (!this.shadowRoot) return;
            if (!this.root) {
                this.root = ReactDOM.createRoot(this.shadowRoot);
            }

            this.root.render(
                <WrapperComponent
                    shadowRoot={this.shadowRoot}
                    props={this.props}
                    theme={this.theme}
                    component={render(this.props, this.shadowRoot)}
                />
            );
        }
    }

    return WebComponent;
}