var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    sass        = require('gulp-sass'),
    uglify      = require('gulp-uglify'),
    jade        = require('gulp-jade'),
    concat      = require('gulp-concat'),
    livereload  = require('gulp-livereload'),
    marked      = require('marked'), // For :markdown filter in jade
    path        = require('path'),
    gulpCopy        = require('gulp-copy'),
    connect = require('gulp-connect');

let compiled_css_directory = "public/css";
let scss_directory = "public/scss/*.scss";
let compiled_webfonts_directory = "public/fonts";
let compiled_font_directory = "public/css/font";
let js_out_directory = "public/javascript/"


// --- Basic Tasks ---
gulp.task('css', function() {
  return gulp.src(scss_directory)
    .pipe( sass({outputStyle: 'nested'}).on('error', sass.logError) )
    .pipe( gulp.dest(compiled_css_directory) )
    .pipe( connect.reload() );

});

gulp.task('css_fonts', function() {
  return gulp.src(['node_modules/summernote/dist/font/summernote.ttf', 'node_modules/summernote/dist/font/summernote.woff'])
    .pipe( gulp.dest(compiled_font_directory))
    .pipe( connect.reload() );

});
/*

gulp.task('js', function() {
  return gulp.src('src/scripts/*.js')
    // .pipe( uglify() )
    // .pipe( concat('all.min.js'))
    .pipe( gulp.dest(js_out_directory))
    .pipe( connect.reload());
});
*/

/*
gulp.task('templates', function() {

  return gulp.src('src/jade/*.jade')
    .pipe( jade({ pretty: true }).on('error', function(error) {
      gutil.log(error);
      this.emit('end');
    }) )
    .pipe( gulp.dest('./build/'));
});*/


//gulp.task('images', function() {
//  return gulp.src('./src/images/**/*')
//    .pipe( gulp.dest('./build/images/'))
//    .pipe( connect.reload() );
//});

gulp.task('icons', function() {
    return gulp.src('./bower_components/components-font-awesome/webfonts/**.*')
        .pipe(gulp.dest(compiled_webfonts_directory));
});
/*
gulp.task('vendor_js', function() {
 gulp.src([
    './bower_components/jquery/dist/jquery.js'
    ])
    .pipe( uglify() )
    .pipe( concat('jquery.min.js'))
    .pipe( gulp.dest('build/scripts/'));
  return gulp.src([
    //Bootstrap
    './bower_components/bootstrap/dist/js/bootstrap.bundle.js',
    // './bower_components/bootstrap/js/dist/collapse.js',
    // './bower_components/bootstrap/js/dist/modal.js',
    // './bower_components/bootstrap/js/dist/tooltip.js',
    // './bower_components/bootstrap/assets/js/vendor/popper.min.js',
    //Swiper
    './bower_components/swiper/dist/js/swiper.js',
    //Masonry
    './bower_components/shufflejs/dist/shuffle.js',
    //Fancybox
    './bower_components/fancybox/dist/jquery.fancybox.js',
    //Select2
    './bower_components/select2/dist/js/select2.full.js',
    //Dropzone
    './bower_components/dropzone/dist/dropzone.js',
    //Summernote
    './node_modules/summernote/dist/summernote-lite.js',
    //Smartwizard
    './bower_components/smartwizard/dist/js/jquery.smartWizard.js',
    //Hammer
    './bower_components/hammerjs/hammer.js'
    ])
    .pipe( uglify() )
    .pipe( concat('vendor.min.js'))
    .pipe( gulp.dest('build/scripts/'))
    .pipe( connect.reload());
});*/
/*
gulp.task('server', function() {
  connect.server({
    root: 'build',
    livereload: true
  });
});*/
/*

gulp.task('html', function () {
  gulp.src('./build/*.html')
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload());
});
*/


//gulp.task('watch', function () {
//  gulp.watch(['./build/*.html'], ['html']);
//  gulp.watch('src/scss/**/*.scss',['css']);
//  gulp.watch('src/scripts/**/*.js',['js']);
//  gulp.watch('images/**/*',['images']);
//  gulp.watch('src/jade/**/*.jade',['templates']);
//});


// Default Task
//gulp.task('build', ['js', 'vendor_js', 'css', 'css_fonts', 'images', 'templates', 'icons']);
gulp.task('build', ['css', 'css_fonts', 'icons']);
//gulp.task('default', ['js', 'vendor_js', 'css', 'css_fonts', 'images', 'templates', 'icons', 'server','watch']);