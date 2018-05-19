 //external dependencies
var express = require('express');
var router = express.Router();

//internal dependencies
var scraped_data_controller = require('../../controllers/scraped_data_controller');
var token_authentication = require("../../tools/token_authentication.js"); //get token authentication object
var memoryUpload = require("../../config/multer_config.js").get_multer_object(); //get multer config
var responses_object = require("./endpoint_response.js");

//init response functions
var send_successful_response = responses_object.send_successful_response;
var send_unsuccessful_response = responses_object.send_unsuccessful_response;

//Actor fields config endpoints
router.route('/events').get(function(request, response){
    scraped_data_controller.findScrapedEventData(function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested

router.route('/events').delete(function(request, response){
    
    console.log(request.body);
    
    scraped_data_controller.deleteScrapedEventData(request.body, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested

router.route('/actor/:name').get(function(request, response){
    
    var actor_name = request.params.name;
    
    scraped_data_controller.scrapeActor(actor_name, function(data){
        if(data.failed){
            send_unsuccessful_response(response, 400, data.message);
        }
        else{
            send_successful_response(response, 200, data);
        }
    });
});//built, written, tested

module.exports = router;