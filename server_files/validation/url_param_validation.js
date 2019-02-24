//external dependencies
var mongodb = require("mongodb");

module.exports = {
    validate: function(request, response, callback){

        var params = [];

        //TODO: write  tests taht fail if the original request.params.x are used. all routing should use the validated values at request.locals.params
        //extract all url parameters that might be recognsied in a page route response
        if(request.params.event_id){ params.push(request.params.event_id); }
        if(request.params.beef_chain_id){ params.push(request.params.beef_chain_id); }
        if(request.params.actor_id){ params.push(request.params.actor_id); }
        var validation_successful = true;

        console.log(request.params);
        console.log(params);

        for(var i = 0; i < params.length; i++){
            var param = params[i];
            if(!mongodb.ObjectID.isValid(param)){
                validation_successful = false;
                response.status(400).send({ failed: true, stage: "server_validation", message: "Validation failed, please format url parameter.", details: params });
                //callback({ failed: true, stage: "server_validation", message: "Validation failed, please format url parameter.", details: params });
            }
        }
        if(validation_successful){
            if(!request.locals){ request.locals = {}; }
            request.locals.validated_params = request.params;
            callback({});
        }
    }
}