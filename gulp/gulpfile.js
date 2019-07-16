var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
	minifyJS = require('gulp-minify'),
	gutil = require('gulp-util'),
    uglify = require('gulp-terser'),
	fs = require('fs'),
	map = require('map-stream'),
	async = require('async'),
	argv = require('yargs').argv,
	isProduction = (argv.production === undefined) ? false : true;

	//import server .env file
require("dotenv").config({ path: '../.env' });

var path_to_root = "../";
var compiled_css_directory = path_to_root + "public/dist/css";
var scss_directory = path_to_root + "public/scss/*.scss";
var compiled_webfonts_directory = path_to_root + "public/fonts";
var compiled_font_directory = path_to_root + "public/dist/css/font";
var js_out_directory = path_to_root + "public/dist/javascript/"


// --- Basic Tasks ---
gulp.task('css', function() {
	return gulp.src(scss_directory)
		.pipe( sass({outputStyle: 'nested'}).on('error', sass.logError) )
		.pipe( gulp.dest(compiled_css_directory) )
});

gulp.task('css_fonts', function() {
	return gulp.src(['node_modules/summernote/dist/font/summernote.ttf', 'node_modules/summernote/dist/font/summernote.woff'])
		.pipe( gulp.dest(compiled_font_directory))
});

var client_javascript_page_config = JSON.parse(fs.readFileSync('client_javascript_page_config.json', 'utf8'));
var universal_javascript_files = [
	"node_modules/jquery/dist/jquery.js",
	"node_modules/jquery-lazy/jquery.lazy.js",
	"node_modules/toastr/build/toastr.js",
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
			//console.log(page_name, "start");
			var add_relative_path = function(item){ return path_to_root + item; };
			var specific_js_scripts = client_javascript_page_config[page_name].map(add_relative_path);
			var relative_universal_javascript_files = universal_javascript_files.map(add_relative_path);
			var relevant_js_scripts = relative_universal_javascript_files.concat(specific_js_scripts);

			if(isProduction/*process.env.NODE_ENV == "heroku_production"*/){
				gulp.src(relevant_js_scripts)
					//.pipe(minifyJS())
					.pipe(concat(page_name + ".js"))
					.pipe(uglify())
					.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
					.pipe(gulp.dest(js_out_directory))
					resolve();
			}
			else if(true /*process.env.NODE_ENV == "local_dev"*/){
				var file_string = "";
				if(specific_js_scripts.length > 0){
					//initial file_string content extends jQuery to load dev js scripts as external files so theya re available in the chrome debugger
					file_string = `
// Replace the normal jQuery getScript function with one that supports
// debugging and which references the script files as external resources
// rather than inline.
jQuery.extend({
	getScript: function(url, callback) {
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src = url;

		// Handle Script loading
		{
			var done = false;

			// Attach handlers for all browsers
			script.onload = script.onreadystatechange = function(){
				if ( !done && (!this.readyState ||
					this.readyState == "loaded" || this.readyState == "compvare") ) {
				done = true;
				if (callback)
					callback();

				// Handle memory leak in IE
				script.onload = script.onreadystatechange = null;
				}
			};
		}

		head.appendChild(script);

		// We handle everything using the script element injection
		return undefined;
	},
});


//load dev scripts synchronously`;

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

						file_string += `\n$.getScript("${specific_js_script}"`;

						if(specific_js_scripts_index != specific_js_scripts.length -1){
							file_string += `,\nfunction(){`;
						}
						else{
							file_string += ")"
						}
					}
					file_string += Array(specific_js_scripts.length).join('})');
				}
				async.series([
					function (next) {
						gulp.src(relative_universal_javascript_files)
							//.pipe( uglify() )
							.pipe(concat(page_name + ".js"))
							.pipe(gulp.dest(js_out_directory))
							.on('end', next);
					},
					function (next) {
						//append file_string to dist file
						gulp.src(js_out_directory + page_name + ".js")
							.pipe(map(function(file, cb) {
								if(file_string.length > 0){
									var fileContents = file.contents.toString();
									fileContents = fileContents += file_string;
									file.contents = new Buffer(fileContents);
								}
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
gulp.task('icons', function() {
    return gulp.src('./bower_components/components-font-awesome/webfonts/**.*')
        .pipe(gulp.dest(compiled_webfonts_directory));
});

// Default Task
//gulp.task('build', ['js', 'vendor_js', 'css', 'css_fonts', 'images', 'templates', 'icons']);
gulp.task('build', ['css', 'css_fonts', 'icons', 'js']);
//gulp.task('default', ['js', 'vendor_js', 'css', 'css_fonts', 'images', 'templates', 'icons', 'server','watch']);