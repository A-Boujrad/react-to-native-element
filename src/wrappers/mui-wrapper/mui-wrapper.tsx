import React, {useEffect} from 'react';
import {CacheProvider} from '@emotion/react';
import {ThemeProvider} from '@mui/material/styles';
import createCache from "@emotion/cache";
import type {WrapperProps} from "../../core/create-react-web-component";
import {getCssVarsTheme, getMuiTheme} from "./themes/mui-theme";


export function MuiWrapper({shadowRoot, theme, component}: WrapperProps) {

    const cache = createCache({key: 'mui-shadow', container: shadowRoot});
    useEffect(() => {
        if (!shadowRoot.querySelector('style[data-injected="true"]')) {
            const style = document.createElement('style');
            style.textContent = `
            :host {
              all: initial;
              display: inline-block;
            }
          `;
            style.setAttribute('data-injected', 'true');
            shadowRoot.appendChild(style);
        }
    }, [shadowRoot]);

    let appliedTheme = getCssVarsTheme(shadowRoot);
    if (typeof theme === 'string') {
        switch (theme) {
            case 'mui-light':
                appliedTheme = getMuiTheme(shadowRoot, 'light');
                break;
            case 'mui-dark':
                appliedTheme = getMuiTheme(shadowRoot, 'dark');
                break;
        }
    }

    return (
        <React.StrictMode>
            <CacheProvider value={cache}>
                <ThemeProvider theme={appliedTheme} >
                    {component}
                </ThemeProvider>
            </CacheProvider>
        </React.StrictMode>
    );
}