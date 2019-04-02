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
	connect = require('gulp-connect'),
	fs = require('fs');

let path_to_root = "../";
let compiled_css_directory = path_to_root + "public/dist/css";
let scss_directory = path_to_root + "public/scss/*.scss";
let compiled_webfonts_directory = path_to_root + "public/fonts";
let compiled_font_directory = path_to_root + "public/dist/css/font";
let js_out_directory = path_to_root + "public/dist/javascript/"


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

var client_javascript_page_config = JSON.parse(fs.readFileSync('client_javascript_page_config.json', 'utf8'));
var universal_javascript_files = [
	"node_modules/jquery/dist/jquery.min.js",
	"node_modules/jquery-lazy/jquery.lazy.min.js",
	"node_modules/toastr/build/toastr.min.js",
	"bower_components/bootstrap/dist/js/bootstrap.bundle.js",
	"bower_components/hammerjs/hammer.js",
	"public/javascript/service_worker/service_worker_init.js",
	"public/javascript/globals.js",
	"views/templates/components/login/login_form_controller.js",
	"views/templates/components/inline_beef_search/inline_beef_search_controller.js"
]

gulp.task('js', function() {

	var pages = Object.keys(client_javascript_page_config);

	for(var i = 0; i < pages.length; i++){
		var page = pages[i];
		var add_relative_path = function(item){ return path_to_root + item; };
		var specific_js_scripts = client_javascript_page_config[page].map(add_relative_path);
		var relevant_js_scripts = universal_javascript_files.map(add_relative_path).concat(specific_js_scripts);

    gulp.src(relevant_js_scripts)
			// .pipe( uglify() )
			.pipe(concat(page + ".js"))
			.pipe(gulp.dest(js_out_directory))
			.pipe(connect.reload());
	}
});

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
gulp.task('build', ['css', 'css_fonts', 'icons', 'js']);
//gulp.task('default', ['js', 'vendor_js', 'css', 'css_fonts', 'images', 'templates', 'icons', 'server','watch']);