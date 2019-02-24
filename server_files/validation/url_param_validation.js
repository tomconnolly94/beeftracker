//external dependencies
var mongodb = require("mongodb");

module.exports = {
    validate: function(request, response, next){

        var params = [];
        var possible_params = ["event_id", "beef_chain_id", "actor_id", "update_request_id", "user_id"];
        var validation_successful = true;

        //TODO: write  tests taht fail if the original request.params.x are used. all routing should use the validated values at request.locals.params
        //extract all url parameters that might be recognsied in a page route response
        for(var i = 0; i < possible_params.length; i++){
            if(request.params[possible_params[i]]){ params.push(request.params[possible_params[i]]); }
        }

        console.log(request.params);
        console.log(params);

        for(var i = 0; i < params.length; i++){
            var param = params[i];
            if(!mongodb.ObjectID.isValid(param)){
                validation_successful = false;
                response.status(400).send({ failed: true, stage: "server_validation", message: "Validation failed, please format url parameter.", details: params });
                return;
                //callback({ failed: true, stage: "server_validation", message: "Validation failed, please format url parameter.", details: params });
            }
        }
        if(validation_successful){
            if(!request.locals){ request.locals = {}; }
            request.locals.validated_params = request.params;
            //callback({})
            next();
        }
    }
}