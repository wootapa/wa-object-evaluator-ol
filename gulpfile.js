var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var del = require('del');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');

function cleanDist() {
    return del('dist/*');
};

function buildNode() {
    return gulp.src('src/**/*.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('dist'));
};

function copyHtml() {
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'));
};

function buildWindow() {
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
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist'));
};

exports.default = gulp.series(cleanDist, buildNode, gulp.parallel(copyHtml, buildWindow));