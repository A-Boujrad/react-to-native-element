import {createReactWebComponent, type ReactWebComponentOptions} from "./create-react-web-component";

export function defineReactWebComponent({
                                            tagName,
                                            observedAttributes,
                                            eventAttributes,
                                            functionAttributes,
                                            render,
                                            mapAttributesToProps,
                                            WrapperComponent
                                        }: ReactWebComponentOptions) {

    const WebComponent = createReactWebComponent({
            tagName,
            observedAttributes,
            eventAttributes,
            functionAttributes,
            render,
            mapAttributesToProps,
            WrapperComponent
        }
    )

    customElements.define(tagName, WebComponent);
}