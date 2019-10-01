//external dependencies
var express = require("express");
var router = express.Router();

/*
    Connection of server routes to controllers - middleware ordering = auth function (optional) -> multer file formatting function (optional) -> data validation function (optional) -> endpoint handler function

    Endpoint handler functions are designed to handle the HTTP request and response, they use controllers to access the data they require
*/

router.use("/activity-logs", require("./api_sub_routing/activity_logs_routing.js"));
router.use("/auth", require("./authentication_routing")); //routes send javascript functions which render HTML on the client side
router.use("/actors", require("./api_sub_routing/actors_routing.js"));
router.use("/actor-variable-fields-config", require("./api_sub_routing/actor_variable_fields_config_routing.js"));
router.use("/broken-links", require("./api_sub_routing/broken_links_routing.js"));
router.use("/comments", require("./api_sub_routing/comments_routing.js"));
router.use("/contact-requests", require("./api_sub_routing/contact_requests_routing.js"));
router.use("/event-categories", require("./api_sub_routing/event_categories_routing.js"));
router.use("/events", require("./api_sub_routing/events_routing.js"));
//router.use("/scraped_data", require("./api_sub_routing/scraped_data_routing"));
router.use("/update-requests", require("./api_sub_routing/update_requests_routing.js"));
router.use("/users", require("./api_sub_routing/users_routing.js"));
router.use("/votes", require("./api_sub_routing/votes_routing.js"));

// //auth
// router.route("/authenticate").post(authentication_request_validator.validate, function(request, response){
    
//     var auth_details = request.locals.validated_data;
//     var headers = request.headers;
    
//     authentication_controller.authenticateUser(auth_details, headers, response, function(data, cookie_details){
//         if(data.failed){
//             send_unsuccessful_api_response(response, 400, data);
//         }
//         else{
//             send_successful_api_response(response, 200, data);
//         }
//     });
// });//built, written, not tested
// router.route("/deauthenticate").get(function(request, response){
//     authentication_controller.deauthenticateUser(response, function(data){
//         if(data.failed){
//             send_unsuccessful_api_response(response, 400, data.message);
//         }
//         else{
//             send_successful_api_response(response, 200, data);
//         }
//     });
// });//built, written, not tested

router.use("/broken-link", require("./api_sub_routing/broken_links_routing.js"));

//handle errors
router.route("/*").get(function(request, response) {response.status(400).send({success: false, message: "endpoint not found"}); });

module.exports = router;