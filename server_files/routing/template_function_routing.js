//external dependencies
var express = require('express');
var router = express.Router();
var jade = require('pug');
var fs = require('fs');

//internal dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

var template_dir = "views/templates/components/";

//function to find jade template file based on endpoint
var build_template_function = function(request, response){
    
    //strip request.url to find the component name and its path
    var url_split = request.url.split("/");
    var template_dir_name = url_split[1];
    var template_name = url_split[2].split("?")[0];
    var template_path = template_dir + template_dir_name + "/" + template_name + ".jade";
    var function_name = template_name + "_tmpl_render_func";
    var template_compilation_function = jade.compileFileClient(template_path, { exportMixins: true, name: function_name }); //Compile the template to a function string
    
    if(template_compilation_function){
        response.status(200).send(template_compilation_function);
    }
    else{
        response.status(404).send({ success: false, message: function_name + " could not be generated." });
    }
}

//Template function endpoints
//router.route('/carousel').get(build_template_function);//built, written, tested
router.route('/gallery_manager/gallery_manager').get(build_template_function);//built, written, tested
router.route('/thumbnail_grid/thumbnail_grid').get(build_template_function);//built, written, tested
router.route('/add_data_sources/add_data_sources_display').get(build_template_function);//built, written, tested
router.route('/add_list/add_list_display').get(build_template_function);//built, written, tested
router.route('/search_results/search_results').get(build_template_function);//built, written, tested
router.route('/error_panel/error_panel').get(build_template_function);//built, written, tested
router.route('/versus_panel/versus_panel').get(build_template_function);//built, written, tested
router.route('/add_actor_modal/add_actor_variable_field_panel').get(build_template_function);//built, written, tested

//handle errors
router.route('/*').get(function(request, response) {response.status(404).send({ success: false, message: "Template not found." }); });

module.exports = router;