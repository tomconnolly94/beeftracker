var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    uglify = require('gulp-uglify'),
	fs = require('fs'),
	file = require('gulp-file'),
	footer = require('gulp-footer'),
	map = require('map-stream'),
	async = require('async');

	//import server .env file
require("dotenv").config({ path: '../.env' });

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

gulp.task('js', function(done) {

	var page_names = Object.keys(client_javascript_page_config);
	var page_promises = [];

	for(var page_name_index = 0; page_name_index < page_names.length; page_name_index++){

		var page_promise = new Promise(function(resolve, reject){
			var page_name = page_names[page_name_index];
			console.log(page_name, "start");
			var add_relative_path = function(item){ return path_to_root + item; };
			var specific_js_scripts = client_javascript_page_config[page_name].map(add_relative_path);
			var relative_universal_javascript_files = universal_javascript_files.map(add_relative_path);
			var relevant_js_scripts = relative_universal_javascript_files.concat(specific_js_scripts);

			if(process.env.NODE_ENV == "heroku_production"){
				gulp.src(relevant_js_scripts)
					// .pipe( uglify() )
					.pipe(concat(page_name + ".js"))
					.pipe(gulp.dest(js_out_directory))
					//.pipe(connect.reload());
			}
			else if(process.env.NODE_ENV == "local_dev"){
		
				var file_string = "\n";//"$(function(){";

				for(var specific_js_scripts_index = 0; specific_js_scripts_index < specific_js_scripts.length; specific_js_scripts_index++){

					var specific_js_script = specific_js_scripts[specific_js_scripts_index];

					//declare route replacement mappings
					var path_replacement_mappings = {
						"public/javascript": "dev-js",
						//"views/templates": "views",
						"views/templates/components": "dev-component-js",
						"views/templates/layouts": "dev-layout-js",
						"views/templates/pages": "dev-page-js",
						"..": ""
					}

					var path_replacement_mappings_keys = Object.keys(path_replacement_mappings);

					//modify each path to use the available server route, not the directory structure
					for(var mapping_index = 0; mapping_index < path_replacement_mappings_keys.length; mapping_index++){

						var mapping_key = path_replacement_mappings_keys[mapping_index];

						if(specific_js_script.includes(mapping_key)){
							specific_js_script = specific_js_script.replace(mapping_key, path_replacement_mappings[mapping_key]);
						}
					}

					// file_string += `\n	jQuery.ajax({
					// 	url: "${specific_js_script}",
					// 	dataType: 'script',
					// 	success: function(){ console.log("Indirectly loaded script: ${specific_js_script}")},
					// 	async: true
					// });
					
					// `

					file_string += `\n$.getScript("${specific_js_script}"); `;
				}
				//file_string += `});`; //close initial $(function(){ 

				async.series([
					function (next) {
						gulp.src(relative_universal_javascript_files)
							// .pipe( uglify() )
							.pipe(concat(page_name + ".js"))
							.pipe(gulp.dest(js_out_directory))
							.on('end', next);
					},
					function (next) {
						//write ajax call to `page_name + ".js"` file to indirectly load specific_js_script
						gulp.src(js_out_directory + page_name + ".js")
							.pipe(map(function(file, cb) {
								var fileContents = file.contents.toString();
								// --- do any string manipulation here ---
								fileContents = fileContents += file_string;
								file.contents = new Buffer(fileContents);
								cb(null, file);
							}))
							.pipe(gulp.dest(js_out_directory))
							.on('end', next);
					}
				], resolve);
			}
		});

		page_promises.push(page_promise);
	}

	Promise.all(page_promises).then(function(values){
		done();
	});

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