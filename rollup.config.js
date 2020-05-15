import cleaner from 'rollup-plugin-cleaner';
import commonJS from '@rollup/plugin-commonjs'
import copy from 'rollup-plugin-copy'
import pkg from './package.json';
import resolve from '@rollup/plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

const banner = `/*! ${pkg.name} v${pkg.version} | author:${pkg.author} | license:${pkg.license} */`;

export default [
    {
        input: 'src/waoe.ol.ts',
        external: ['ol', 'ol/geom/Geometry', 'ol/geom/Polygon', 'ol/geom/LinearRing', 'ol/geom/Point', 'ol/format/WKT', 'ol/format/GeoJSON'],
        plugins: [
            cleaner({ targets: ['./dist/'] }),
            copy({ targets: [{ src: 'index.html', dest: 'dist' }] }),
            resolve(),
            commonJS(),
            typescript(),
            sourceMaps(),
            terser({
                mangle: {
                    reserved: ['key', 'value', 'alias', 'func', 'opts']
                },
                output: { comments: new RegExp(`^!${banner}$`) }
            })
        ],
        output: [
            {
                file: pkg.browser, format: 'umd', sourcemap: true, banner: banner, name: 'waoe.ol',
                globals: {
                    'ol': 'ol',
                    'ol/geom/Geometry': 'ol.geom.Geometry',
                    'ol/geom/Polygon': 'ol.geom.Polygon',
                    'ol/geom/LinearRing': 'ol.geom.LinearRing',
                    'ol/geom/Point': 'ol.geom.Point',
                    'ol/format/WKT': 'ol.format.WKT',
                    'ol/format/GeoJSON': 'ol.format.GeoJSON'
                }
            },
            { file: pkg.module, format: 'es', sourcemap: true, banner: banner }
        ],
    }
];