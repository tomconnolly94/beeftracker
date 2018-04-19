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
    console.log(url_split);
    var template_dir_name = url_split[1];
    var template_name = url_split[2].split("?")[0];
    
    var template_path = template_dir + template_dir_name + "/" + template_name + ".jade";
    var function_name = template_name + "_tmpl_render_func";
    
    // Compile the template to a function string
    var template_compilation_function = jade.compileFileClient(template_path, { exportMixins: true, name: function_name });
    
    if(template_compilation_function){
        response.status(200).send(template_compilation_function);
    }
    else{
        response.status(404).send({ success: false, message: function_name + " could not be generated." });
    }
}

//Activity logs endpoints
router.route('/carousel').get(build_template_function);//built, written, tested
router.route('/gallery_manager/gallery_manager').get(build_template_function);//built, written, tested
router.route('/category_browser/category_browser_display').get(build_template_function);//built, written, tested

//handle errors
router.route('/*').get(function(request, response) {response.status(404).send({ success: false, message: "Template not found." }); });

module.exports = router;