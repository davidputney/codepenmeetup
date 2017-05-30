
var gulp = require('gulp'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream');

//scripts
var concat = require('gulp-concat'),
    minifyJS = require('gulp-uglify'),
    // jshint = require('gulp-jshint'),
    eslint = require('gulp-eslint'),
    sourcemaps = require("gulp-sourcemaps");
;

//css
var sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    scsslint = require('gulp-scss-lint'),
    autoprefixer = require('autoprefixer'),
    cssbeautify = require('gulp-cssbeautify');

//images
var imagemin = require('gulp-imagemin'),
    jpegtran = require('imagemin-jpegtran'),
    gm = require('gulp-gm');

//fonts
var cssBase64 = require('gulp-css-base64');

//utility
var rename = require('gulp-rename'),
    fileinclude = require('gulp-file-include');

//var copy = require('gulp-copy');
var clean = require('gulp-rimraf');

//var filter = require('gulp-filter');
var stylish = require('jshint-stylish'),
    rename = require('gulp-rename'),
    watch = require('gulp-watch'),
    livereload = require('gulp-livereload');

//svg
var svgstore = require('gulp-svgstore'),
    svgmin = require('gulp-svgmin');

// posts css
var postcss = require('gulp-postcss'),
    gradient = require('postcss-easing-gradients'),
    cssnano = require('cssnano');
//bower
// var mainBowerFiles = require('main-bower-files');

// markdown
var markdown = require('gulp-markdown');

// html
var htmltidy = require('gulp-htmltidy'),
    htmlmin = require('gulp-html-minifier');

// web server
var webserver = require('gulp-webserver');

var paths = {
  pageTemplates : {
    input : 'source/templates/**/{*.html,*shtml}',
    testing: 'test/',
    dist : 'public/'
  },
  scripts : {
    input : 'source/scripts/*.js',
    exclude : 'source/scripts/exclude/*.js',
    // bower : 'bower_components/**/*.js',
    vendor : 'source/scripts/vendor/*.js',
    testing : 'test/scripts/',
    dist : 'public/scripts/'
  },
  // bower : {
  //  components : 'bower_components',
  //  json : 'bower.json',
  //  vendor : 'source/scripts/vendor/'
  // },
  styles : {
    input : 'source/sass/*.scss',
    exclude : '!source/sass/partials/*scss',
    testing : 'test/css',
    dist : 'public/css',
    watch : 'source/sass/**/*.scss'
  },
  images : {
    input : 'source/photos_in/{*.jpg, *.tiff, *png}',
    output : 'source/photos_out/',
    testing : 'test/siteart/',
    dist : 'public/siteart/'
  },
  svg : {
    input : 'source/svg/SVG_in/*.svg',
    output : 'source/svg/',
  },
  fonts: {
    input: 'src/fonts/*.css',
    testing: 'test/fonts/',
    dist: 'dist/fonts/'
  },
  markdown : {
    input: 'source/markdown_in/**/*.md',
    output: 'source/content/'
  },
  html_partials : {
    input: 'source/html_partials/**/*.html',
  },
  data: {
    input: 'source/data/**/*.*',
    output: 'test/data/',
    dist: 'public/data/'
  },
  appIcons: {
    input: "source/appIcons/**/*.*",
    dist: 'public/'
  },
  siteart: {
    input: 'source/siteart/*',
    test:'test/siteart/',
    dist: 'public/siteart/'
  },
  // bowerCSS: {
  //   bourbon: 'bower_components/bourbon/app/assets/stylesheets/**/*',
  //   bitters: 'bower_components/bitters/core/*.scss',
  //   css: 'source/sass/vendor/'
  // }
};

// tasks
// moves page templates from src to testing and dist
gulp.task('templates', function() {
   gulp.src(paths.pageTemplates.input)
   .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(htmltidy({doctype: 'html5',
                  hideComments: false,
                  indent: true}))
   .pipe(gulp.dest(paths.pageTemplates.testing))
   .pipe(htmlmin({collapseWhitespace: true}))
   .pipe(gulp.dest(paths.pageTemplates.dist));
});
// concatenates scripts, but not items in exclude folder. includes vendor folder
gulp.task('concat', function() {
  gulp.src([paths.scripts.vendor, paths.scripts.input,'!' + paths.scripts.exclude])
   .pipe(sourcemaps.init())
   .pipe(concat('main.js'))
   .pipe(minifyJS())
   .pipe(sourcemaps.write("."))
   .pipe(gulp.dest(paths.scripts.testing))
   .pipe(gulp.dest(paths.scripts.dist));
});
gulp.task('exclude', function() {
  gulp.src(paths.scripts.exclude)
   .pipe(sourcemaps.init())
   .pipe(minifyJS())
   .pipe(sourcemaps.write("."))
   .pipe(gulp.dest(paths.scripts.testing))
   .pipe(gulp.dest(paths.scripts.dist));
});
// lints main javascript file for site
gulp.task('lint', function() {
  return gulp.src('source/scripts/functions.js')
  .pipe(eslint(
    {
      "parser": "babel-eslint",
      rules: {
            'no-alert': 0,
            'no-bitwise': 0,
            'camelcase': 1,
            'curly': 1,
            'eqeqeq': 0,
            'no-eq-null': 0,
            'guard-for-in': 1,
            'no-empty': 1,
            'no-use-before-define': 1,
            'no-obj-calls': 2,
            'no-unused-vars': 1,
            'new-cap': 1,
            'no-shadow': 0,
            'strict': 1,
            'no-invalid-regexp': 2,
            'comma-dangle': 2,
            'no-undef': 1,
            'no-new': 1,
            'no-extra-semi': 1,
            'no-debugger': 2,
            'no-caller': 1,
            'semi': 1,
            'quotes': 1,
            'no-unreachable': 2,
            'jsx-quotes': 1
          },
      envs: [
        'browser', 'es6', 'react'
      ],
      plugins: ["react"],
      extends: {
        eslint: "recommended"
      }
  }
  ))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError());
    // .pipe(jshint())
    // .pipe(jshint.reporter(stylish))
    // .pipe(jshint.reporter('fail'));
});
// lints and minifies css, moves to testing and dist
gulp.task('css', function() {
  var plugins = [
    autoprefixer({browsers: ['last 2 versions']}),
    cssnano(),
    gradient()
  ];
  gulp.src([paths.styles.input, paths.styles.exclude])
   .pipe(scsslint())
   .pipe(sourcemaps.init())
   .pipe(sass({
     includePaths: require('node-bourbon').includePaths
   }))
   .pipe(postcss(plugins))
   .pipe(cssbeautify({
        indent: '  ',
        openbrace: 'end-of-line',
        autosemicolon: true
    }))
    .pipe(cleanCSS())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest(paths.styles.testing))
    .pipe(gulp.dest(paths.styles.dist));
});
// creates svg sprite from folder of SVGs and moves it to testing and dist
gulp.task('svg', function () {
    return gulp
        .src(paths.svg.input)
        .pipe(svgmin())
        .pipe(svgstore())
        .pipe(rename ({
            basename: 'svgsprite',
            extname: '.svg'
        }))
        .pipe(gulp.dest(paths.svg.output));
});
// gulp.task('bitters', function () {
//     return gulp.src(paths.bowerCSS.bitters)
//         .pipe(gulp.dest(paths.bowerCSS.css));
// });
//
// gulp.task('bourbon', function() {
//   return gulp.src(paths.bowerCSS.bourbon)
//     .pipe(gulp.dest(paths.bowerCSS.css));
// });

// converts fonts css into styles with Base 64 fonts embedded
gulp.task('fonts', function () {
    return gulp.src(paths.fonts.input)
    .pipe(cssBase64({
      maxImageSize: 8*10024 // bytes
    }))
    .pipe(gulp.dest(paths.fonts.testing))
    .pipe(minifyCSS({
      keepBreaks:false
    }))
    .pipe(gulp.dest(paths.fonts.dist));
});
// markdown converter
gulp.task('markdown', function () {
    return gulp.src(paths.markdown.input)
        .pipe(markdown())
        .pipe(gulp.dest(paths.markdown.output));
});
// moves bower dependencies to vendor folder
// gulp.task('bower', function() {
//    return gulp.src(mainBowerFiles({
//     paths: {
//         bowerDirectory: paths.bower.components,
//         bowerJson: paths.bower.json
//     }
// }))
//     .pipe(gulp.dest(paths.bower.vendor))
// });
// copies conents of the src siteart folder
gulp.task('siteart', function() {
  return gulp.src(paths.siteart.input)
      .pipe(gulp.dest(paths.siteart.test))
      .pipe(gulp.dest(paths.siteart.dist));
});
// webserver with live reload
gulp.task('webserver', function() {
  gulp.src('test')
    .pipe(webserver({
      livereload: true,
      directoryListing: false,
      open: true
    }));
});
// creates blog images in four sizes, minifies, moves to testing and dist
gulp.task('images', function () {

  // Medium images
  gulp.src(paths.images.input)
    .pipe(gm(function (gmfile){
      return gmfile.setFormat('jpg'),
      		 gmfile.resample(72, 72),
             gmfile.thumbnail(450, '265!'),
             gmfile.quality(82),
             gmfile.filter('triangle'),
             gmfile.unsharp('0.25x0.25+8+0.065'),
             gmfile.interlace('none'),
             gmfile.colorspace('sRGB'),
             gmfile.crop(450, 265, 0, 0);
    }, {
      imageMagick: true
    }))

    // Crunches images
    .pipe(imagemin({
      progressive: true,
      use: [jpegtran()]
    }))

    // Renames images
    .pipe(rename({
      prefix: 'med_'
    }))

    .pipe(gulp.dest(paths.images.testing))
    .pipe(gulp.dest(paths.images.dist));

    gulp.src(paths.images.input)
   .pipe(clean())
   .pipe(gulp.dest(paths.images.output));
});

gulp.task('appIcons', function() {
  gulp.src(paths.appIcons.input)
    .pipe(gulp.dest(paths.appIcons.dist));
});

// gulp watches
// Spin up livereload server and listen for file changes
gulp.task('listen', function () {
    // page templates
    gulp.watch(paths.pageTemplates.input).on('change', function(file) {
      gulp.start('templates');
    });
    // scripts
      gulp.watch(paths.scripts.input).on('change', function(file) {
      gulp.start('lint');
      gulp.start('concat');
    });
    // css
      gulp.watch(paths.styles.watch).on('change', function(file) {
      gulp.start('css');
    });
    // markdown
    gulp.watch(paths.markdown.input).on('change', function(file) {
      gulp.start('markdown');
      gulp.start('templates');
    });
    gulp.watch(paths.html_partials.input).on('change', function(file) {
      gulp.start('templates');
    });
    gulp.watch(paths.siteart.input).on('change', function(file) {
      gulp.start('siteart');
    });
    gulp.watch(paths.scripts.exclude).on('change', function(file) {
      gulp.start('exclude');
    });
});

gulp.task('prebuild', [
	// 'bourbon',
	// 'bitters',
  'svg',
  'markdown'
]);

// Compile files
gulp.task('default', [
	'templates',
	'css',
	'svg',
	// 'bower',
  'lint',
  'siteart',
  'concat',
  'markdown',
  'exclude',
  'listen',
  'webserver'
]);
