import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import dts from "vite-plugin-dts";
import {viteStaticCopy} from "vite-plugin-static-copy";

export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: "src/wrappers/mui-wrapper/themes/mui-theme.css",
                    dest: ""
                },
            ],
        }),
        dts({
            tsconfigPath: './tsconfig.base.json',
            exclude: ["src/**/*.test.*", 'src/**/*.stories.*'],
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'ReactToNativeElement',
            fileName: (format) => `react-to-native-element.${format}.js`,
            formats: ['es', 'umd']
        },
        rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM'
                }
            }
        }
    },
    test: {
        environment: 'jsdom',
        restoreMocks: true,
        mockReset: true,
    },
});