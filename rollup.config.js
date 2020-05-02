import cleaner from 'rollup-plugin-cleaner';
import commonJS from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import { terser } from "rollup-plugin-terser";

export default [
    // UMD for browser
    {
        input: 'src/waoe.ol.ts',
        external: ['ol', 'ol/geom/Geometry', 'ol/geom/Polygon', 'ol/geom/LinearRing', 'ol/geom/Point', 'ol/format/WKT', 'ol/format/GeoJSON'],
        plugins: [
            cleaner({ targets: ['./dist/'] }),
            copy({ targets: [{ src: 'index.html', dest: 'dist' }] }),
            resolve(),
            commonJS({
                include: 'node_modules/**'
            }),
            typescript(),
            sourceMaps(),
            terser({
                keep_classnames: true,
                keep_fnames: true
            })
        ],
        output: [
            {
                file: pkg.browser, format: 'umd', sourcemap: true, name: 'waoe.ol',
                globals: {
                    'ol': 'ol',
                    'ol/geom/Geometry': 'ol.geom.Geometry',
                    'ol/geom/Polygon': 'ol.geom.Polygon',
                    'ol/geom/LinearRing': 'ol.geom.LinearRing',
                    'ol/geom/Point': 'ol.geom.Point',
                    'ol/format/WKT': 'ol.format.WKT',
                    'ol/format/GeoJSON': 'ol.format.GeoJSON'
                }
            }
        ],
    },
    // CommonJS for Node and ES for bundlers.
    {
        input: 'src/waoe.ol.ts',
        external: ['ol', 'ol/geom/Geometry', 'ol/geom/Polygon', 'ol/geom/LinearRing', 'ol/geom/Point', 'ol/format/WKT', 'ol/format/GeoJSON'],
        plugins: [
            resolve(),
            commonJS({
                include: 'node_modules/**'
            }),
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