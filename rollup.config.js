import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'
import pkg from './package.json';
import sourceMaps from 'rollup-plugin-sourcemaps';
import cleaner from 'rollup-plugin-cleaner';
import { terser } from "rollup-plugin-terser";

export default [
    // UMD for browser
    {
        input: 'src/waoe.ts',
        plugins: [
            cleaner({ targets: ['./dist/'] }),
            copy({ targets: [{ src: 'index.html', dest: 'dist' }] }),
            typescript(),
            sourceMaps(),
            terser({
                keep_classnames: true,
                keep_fnames: true
            })
        ],
        output: [
            { file: pkg.browser, format: 'umd', sourcemap: true, name: 'waoe' }
        ],
    },
    // CommonJS for Node and ES for bundlers.
    {
        input: 'src/waoe.ts',
        plugins: [
            typescript(),
            terser({
                keep_classnames: true,
                keep_fnames: true
            })
        ],
        output: [
            { file: pkg.main, format: 'cjs', sourcemap: true },
            { file: pkg.module, format: 'es', sourcemap: true }
        ]
    }
];