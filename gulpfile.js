const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const del = require('del');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const ts = require('gulp-typescript');
const merge = require('merge2');

// Read ts project
const tsProject = ts.createProject('tsconfig.json');

// Delete dist except folder itself
const cleanDist = () => del('dist/*');

// Copy webpage for testing
const copyHtml = () => gulp.src('src/*.html').pipe(gulp.dest('dist'));

// Build for node with typings and sourcemaps
const buildNode = () => {
    const tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.dts
            .pipe(gulp.dest('dist')),
        tsResult.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('dist'))
    ]);
};

// Build for web
const buildWindow = () => {
    return browserify(
        {
            debug: true,
            entries: ['dist/main.js'],
            standalone: 'waoe'
        })
        .transform(babelify, {
            presets: ["@babel/preset-env"]
        })
        .bundle()
        .pipe(source('waoe.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(uglify({ keep_fnames: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
};

exports.dev = gulp.series(cleanDist, buildNode, gulp.parallel(copyHtml, buildWindow));
exports.default = gulp.series(cleanDist, buildNode, buildWindow);
