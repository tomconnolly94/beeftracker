var gulp = require('gulp'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
	gutil = require('gulp-util'),
	uglify = require('gulp-terser'),
	gulpif = require('gulp-if'),
	fs = require('fs'),
	map = require('map-stream'),
	jade = require('gulp-jade'),
	async = require('async'),
	argv = require('yargs').argv,
	production_arg = (argv.production === undefined) ? false : true;


var is_production = production_arg || process.env.NODE_ENV == "heroku_production"
var path_to_root = "../";
var css_out_directory = path_to_root + "public/dist/css";
var compiled_webfonts_directory = path_to_root + "public/fonts";
var compiled_font_directory = path_to_root + "public/dist/css/font";
var js_out_directory = path_to_root + "public/dist/javascript/";
var file_string_base = `
/* Include calls to individual javascript files so they appear in the debugger 
as separate files, increasing the ease of file navigation */
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
var add_relative_root_path = function(item){
	if(item.indexOf("https://") >= 0){
		return `url("${item}")`;
	}
	else if(item.indexOf(".js") >= 0){
		return `${path_to_root}${item}`;
	}
	return `"${path_to_root}${item}"`;
};


gulp.task('css', function(done) {

	var client_css_page_config = JSON.parse(fs.readFileSync('client_css_page_config.json', 'utf8'));
	var page_names = Object.keys(client_css_page_config);
	var universal_css_files = client_css_page_config["all"];
	var tmp_page_scss_config_folder = `${path_to_root}public/scss/tmp/`;
	var page_promises = [];
	var delete_tmp_folder = true;
	
	//if it doesnt exist, create tmp folder to hold page scss config files
	if (!fs.existsSync(tmp_page_scss_config_folder)) { fs.mkdirSync(tmp_page_scss_config_folder); }

	//for(var page_name_index = 1; page_name_index < page_names.length; page_name_index++){
	for(var page_name_index = 1; page_name_index < page_names.length; page_name_index++){

		page_promises.push(new Promise(function(resolve, reject){
			var page_name = page_names[page_name_index];
			var specific_css_scripts = client_css_page_config[page_name].map(add_relative_root_path);
			var relative_universal_css_files = universal_css_files.map(add_relative_root_path);
			var relevant_css_scripts = relative_universal_css_files.concat(specific_css_scripts);
			var tmp_scss_config_file = `${tmp_page_scss_config_folder}${page_name}.scss`;
			var tmp_scss_config_file_content = "@charset \"UTF-8\";\n";

			for(var script_index = 0; script_index < relevant_css_scripts.length; script_index++){
				tmp_scss_config_file_content += `@import ${relevant_css_scripts[script_index]};\n`;
			}
			
			//write an scss file with all the relevant imports for that page
			fs.writeFile(tmp_scss_config_file, tmp_scss_config_file_content, (err) => {
				if (err) throw err;

				gulp.src(tmp_scss_config_file)
					.pipe(
						gulpif(is_production, 
							sass({outputStyle: 'compressed'}).on('error', sass.logError), 
							sass({outputStyle: 'nested'}).on('error', sass.logError)
						)
					)
					.pipe( gulp.dest(css_out_directory) )
					.on('end', function(){
						if(delete_tmp_folder){
							fs.unlink(tmp_scss_config_file, function (err) { //delete tmp file
								if (err) throw err;
								resolve();
							});
						}
						resolve();
					});
			});
		}));
	}

	Promise.all(page_promises).then(function(values){
		if(delete_tmp_folder){
			fs.rmdirSync(tmp_page_scss_config_folder); //delete the tmp scss config folder
		}
		done();
	});
});


gulp.task('css_fonts', function() {
	return gulp.src(['node_modules/summernote/dist/font/summernote.ttf', 'node_modules/summernote/dist/font/summernote.woff'])
		.pipe( gulp.dest(compiled_font_directory))
});

gulp.task('js', function(done) {

	var client_javascript_page_config = JSON.parse(fs.readFileSync('client_javascript_page_config.json', 'utf8'))
	var page_names = Object.keys(client_javascript_page_config);
	var universal_javascript_files = client_javascript_page_config["all"];
	var page_promises = [];

	for(var page_name_index = 1; page_name_index < page_names.length; page_name_index++){

		page_promises.push(new Promise(function(resolve, reject){
			var page_name = page_names[page_name_index];
			var specific_js_scripts = client_javascript_page_config[page_name].map(add_relative_root_path);
			var relative_universal_javascript_files = universal_javascript_files.map(add_relative_root_path);
			var relevant_js_scripts = relative_universal_javascript_files.concat(specific_js_scripts);

			if(is_production){
				gulp.src(relevant_js_scripts)
					//.pipe(minifyJS())
					.pipe(concat(page_name + ".js"))
					.pipe(uglify())
					.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
					.pipe(gulp.dest(js_out_directory))
					resolve();
			}
			else{
				var file_string = "";
				if(specific_js_scripts.length > 0){

					file_string = file_string_base;

					for (var specific_js_scripts_index = 0; specific_js_scripts_index < specific_js_scripts.length; specific_js_scripts_index++) {

						var specific_js_script = specific_js_scripts[specific_js_scripts_index];

						//declare route replacement mappings
						var path_replacement_mappings = {
							"public/javascript": "dev-js",
							"node_modules": "modules",
							"views/templates/components": "dev-component-js",
							"views/templates/layouts": "dev-layout-js",
							"views/templates/pages": "dev-page-js",
							"..": ""
						}

						var path_replacement_mappings_keys = Object.keys(path_replacement_mappings);

						//modify each path to use the available server route, not the directory structure
						for (var mapping_index = 0; mapping_index < path_replacement_mappings_keys.length; mapping_index++) {

							var mapping_key = path_replacement_mappings_keys[mapping_index];

							if (specific_js_script.includes(mapping_key)) {
								specific_js_script = specific_js_script.replace(mapping_key, path_replacement_mappings[mapping_key]);
							}
						}

						file_string += `\n$.getScript("${specific_js_script}"`;

						if (specific_js_scripts_index != specific_js_scripts.length - 1) {
							file_string += `,\nfunction(){`;
						} else {
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
							.pipe(map(function (file, cb) {
								if (file_string.length > 0) {
									var fileContents = file.contents.toString();
									fileContents = fileContents += file_string;
									file.contents = Buffer.from(fileContents);
								}
								cb(null, file);
							}))
							.pipe(gulp.dest(js_out_directory))
							.on('end', next);
					}
				], resolve);
			}
		}));
	}

	Promise.all(page_promises).then(function (values) {
		done();
	});
});


gulp.task('default', function() {
	console.log("Usage:");
	console.log("	--production - production build, minify javascript and collapse each views required scripts into one master js file.")
	return;
});


gulp.task('icons', function() {
    return gulp.src('./bower_components/components-font-awesome/webfonts/**.*')
        .pipe(gulp.dest(compiled_webfonts_directory));
});


gulp.task('build', ['css', 'css_fonts', 'icons', 'js']);