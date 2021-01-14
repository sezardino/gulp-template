// const gulp = require('gulp');
// const plumber = require('gulp-plumber');
// const sourcemap = require('gulp-sourcemaps');
// const sass = require('gulp-sass');
// const postcss = require('gulp-postcss');
// const autoprefixer = require('autoprefixer');
// const browserSync = require('browser-sync').create();

// const styles = () => {
//   return gulp
//     .src('/src/scss/styles.scss')
//     .pipe(plumber())
//     .pipe(sourcemap.init())
//     .pipe(sass())
//     .pipe(postcss([autoprefixer()]))
//     .pipe(sourcemap.write('.'))
//     .pipe(gulp.dest('/src/styles'))
//     .pipe(browserSync.stream());
// };

// exports.styles = styles;

// const server = () => {
//   browserSync.init({
//     server: {
//       baseDir: 'src',
//     },
//     cors: true,
//     notify: false,
//     ui: false,
//   });
// };

// exports.server = server;

// const watcher = () => {
//   gulp.watch('/src/scss/**/*.scss', gulp.series('styles'));
//   gulp.watch('/src/*.scss').on('change', browserSync.reload);
// };

// exports.default = gulp.series(styles, server, watcher);

const browserSync = require('browser-sync');
const {src, dest} = require('gulp');
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const fileInclude = require('gulp-file-include');
const del = require('del');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const imageMin = require('gulp-imagemin');
const webp = require('gulp-webp');

const srcPath = 'src';
const buildPath = 'dist';

const path = {
  build: {
    html: `${buildPath}/`,
    styles: `${buildPath}/styles/`,
    scripts: `${buildPath}/scripts/`,
    images: `${buildPath}/images/`,
    fonts: `${buildPath}/fonts/`,
  },
  src: {
    html: [`${srcPath}/*.html`, `!${srcPath}/_*.html`],
    styles: `${srcPath}/scss/styles.scss`,
    scripts: `${srcPath}/scripts/scripts.js`,
    images: `${srcPath}/images/**/*.{jpg,png,svg,gif,ico,webp}`,
    fonts: `${srcPath}/*.{ttf,woff,woff2}`,
  },
  watch: {
    html: `${srcPath}/**/*.html`,
    scripts: `${srcPath}/scripts/**/*.js`,
    styles: `${srcPath}/scss/**/*.scss`,
    images: `${srcPath}/images/**/*.{jpg,png,svg,gif,ico,webp}`,
  },
  clean: `${buildPath}/`,
};

const server = () => {
  browserSync.init({
    server: {
      baseDir: `${buildPath}/`,
    },
    port: 3000,
    cors: true,
    notify: false,
    ui: false,
  });
};

const html = () => {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
};

const styles = () => {
  return src(path.src.styles)
    .pipe(
      scss({
        outputStyle: 'expanded',
      })
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        cascade: true,
      })
    )
    .pipe(groupMedia())
    .pipe(cleanCss())
    .pipe(dest(path.build.styles))
    .pipe(browsersync.stream());
};

const images = () => {
  return src(path.src.images)
    .pipe(
      webp({
        quality: 70,
      })
    )
    .pipe(dest(path.build.images))
    .pipe(src(path.src.images))
    .pipe(
      imageMin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        interlaced: true,
        optimizationLevel: 3,
      })
    )
    .pipe(dest(path.build.images))
    .pipe(browsersync.stream());
};

const fonts = () => {
  return src(path.src.fonts).pipe(dest(path.build.fonts));
};

const watchFiles = () => {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.styles], styles);
  gulp.watch([path.watch.images], images);
};

const clean = () => {
  return del(path.clean);
};

const build = gulp.series(clean, gulp.parallel(styles, html, images));
const watch = gulp.parallel(build, watchFiles, server);

exports.html = html;
exports.styles = styles;
exports.images = images;
exports.build = build;
exports.watch = watch;
exports.default = watch;
