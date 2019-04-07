// GULP
// -----------------------------------------------------------------------------
const { src, dest, series, parallel, watch } = require('gulp');
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const postcss = require('gulp-postcss');
const imagemin = require('gulp-imagemin');
const svgo = require('gulp-svgo');

// ROLLUP
// -----------------------------------------------------------------------------
const rollup = require('gulp-better-rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const babel = require('rollup-plugin-babel');
const { terser } = require('rollup-plugin-terser');

// OTHER
// -----------------------------------------------------------------------------
const del = require('del');
const { stream, reload } = require('browser-sync').create();

// ENV
// -----------------------------------------------------------------------------
const checkEnv = (variable) => process.env.NODE_ENV === variable;

const isDev = checkEnv('development');
const isProd = checkEnv('production');

// HELPERS
// -----------------------------------------------------------------------------
const serve = (path, task) => watch(path, task).on('change', reload);

// SINGLE TASKS
// -----------------------------------------------------------------------------
const clean = () => del(['dist', 'templates']);

const static = () =>
  src('public/**')
    .pipe(dest('dist'))
    .pipe(gulpif(isDev, stream()));

const fonts = () =>
  src('src/assets/fonts/**')
    .pipe(dest('dist/fonts'))
    .pipe(gulpif(isDev, stream()));

const img = () =>
  src('src/assets/img/**')
    .pipe(
      gulpif(
        isProd,
        imagemin([
          imagemin.jpegtran({ progressive: true }),
          imagemin.optipng({ optimizationLevel: 5 }),
        ]),
      ),
    )
    .pipe(gulpif(isProd, svgo()))
    .pipe(dest('dist/img'))
    .pipe(gulpif(isDev, stream()));

const html = () =>
  src('src/**/*.html')
    .pipe(gulpif(isProd, htmlmin({ collapseWhitespace: true })))
    .pipe(dest('templates'))
    .pipe(gulpif(isDev, stream()));

const css = () =>
  src('src/index.css')
    .pipe(postcss({ env: process.env.NODE_ENV }))
    .pipe(dest('dist'))
    .pipe(gulpif(isDev, stream()));

const js = () =>
  src('src/index.js')
    .pipe(
      rollup(
        {
          plugins: [resolve(), commonjs(), babel(), isProd && terser()],
        },
        {
          format: 'iife',
        },
      ),
    )
    .pipe(dest('dist'))
    .pipe(gulpif(isDev, stream()));

// FINAL TASKS
// -----------------------------------------------------------------------------
const start = () => {
  serve('src/public/**', static);
  serve('src/fonts/**', fonts);
  serve('src/img/**', img);
  serve('src/**/*.html', html);
  serve('src/**/*.css', css);
  serve('src/**/*.js', js);

  series(clean, parallel(static, fonts, img, html, css, js))();
};

const build = series(clean, static, fonts, img, html, css, js);

// EXPORTS
// -----------------------------------------------------------------------------
exports.start = start;
exports.build = build;
