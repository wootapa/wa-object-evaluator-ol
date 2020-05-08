import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy'
import pkg from './package.json';
import sourceMaps from 'rollup-plugin-sourcemaps';
import cleaner from 'rollup-plugin-cleaner';
import { terser } from "rollup-plugin-terser";

const banner = `/*! ${pkg.name} v${pkg.version} | author:${pkg.author} | license:${pkg.license} */`;

export default [
    {
        input: 'src/waoe.ts',
        plugins: [
            cleaner({ targets: ['./dist/'] }),
            copy({ targets: [{ src: 'index.html', dest: 'dist' }] }),
            typescript(),
            sourceMaps(),
            terser({
                keep_classnames: true,
                keep_fnames: true,
                output: { comments: new RegExp(`^!${banner}$`) }
            })
        ],
        output: [
            { file: pkg.browser, format: 'umd', sourcemap: true, banner: banner, name: 'waoe' },
            { file: pkg.module, format: 'es', sourcemap: true, banner: banner }
        ],
    }
];