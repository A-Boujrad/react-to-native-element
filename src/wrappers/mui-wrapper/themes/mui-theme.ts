import {createTheme, type PaletteMode} from '@mui/material/styles';
import type {Theme} from "@emotion/react";

export function getCssVarsTheme(shadowRoot: ShadowRoot): Theme {
    return createTheme({
        cssVariables: true,
        colorSchemes: { light: true, dark: true },
        components: {
            MuiPopover: {
                defaultProps: {
                    container: shadowRoot as unknown as Element
                }
            },
            MuiPopper: {
                defaultProps: {
                    container: shadowRoot as unknown as Element
                }
            },
            MuiModal: {
                defaultProps: {
                    container: shadowRoot as unknown as Element
                }
            }
        }
    })
}

export function getMuiTheme(shadowRoot: ShadowRoot, mode: PaletteMode): Theme {
    return createTheme({
        palette: {
            mode: mode,
        },
        components: {
            MuiPopover: {
                defaultProps: {
                    container: shadowRoot as unknown as Element
                }
            },
            MuiPopper: {
                defaultProps: {
                    container: shadowRoot as unknown as Element
                }
            },
            MuiModal: {
                defaultProps: {
                    container: shadowRoot as unknown as Element
                }
            }
        }
    })
}
