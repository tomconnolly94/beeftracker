//external dependencies
var express = require('express');
var router = express.Router();
var jade = require('pug');

//internal dependencies
var token_authentication = require("../tools/token_authentication.js"); //get token authentication object

//function to find jade template file based on endpoint
var build_template_function = function(request, response){
    
    //strip request.url to find the component name and its path
    var component_name = request.url.split("/")[1].split("?")[0];
    var template_path = "public/components/" + component_name + "/" + component_name + ".jade";
    var function_name = component_name + "tmpl_func";
    
    // Compile the template to a function string
    var template_compilation_function = jade.compileFileClient(template_path, {name: function_name});
    
    if(template_compilation_function){
        response.status(200).send(template_compilation_function);
    }
    else{
        response.status(404).send({ success: false, message: function_name + " could not be generated." });
    }
}

//Activity logs endpoints
router.route('/carousel').get(build_template_function);//built, written, tested

//handle errors
router.route('/*').get(function(request, response) {response.status(404).send({ success: false, message: "Template not found." }); });

module.exports = router;