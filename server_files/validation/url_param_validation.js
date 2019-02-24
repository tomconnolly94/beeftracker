var mongodb = require("mongodb");

module.exports = {
    validate: function(request, response, next){

        var params = [];

        //TODO: implement use of this in all page and api requests that use url params
        //TODO: write  tests taht fail if the original request.params.x are used. all routing should use the validated values at request.locals.params
        //extract all url parameters that might be recognsied in a page route response
        if(request.params.event_id){ params.push(request.params.event_id); }
        if(request.params.beef_chain_id){ params.push(request.params.beef_chain_id); }
        if(request.params.actor_id){ params.push(request.params.actor_id); }

        var validation_successful = true;

        for(var i = 0; i < params.length; i++){
            var param = params[i];
            if(mongodb.ObjectID.isValid(param)){
                validation_successful = false;
                response.status(400).send({ failed: true, stage: "server_validation", message: "Validation faled, please format url parameter.", details: params });
            }
        }
        if(validation_successful){
            request.locals.validated_params = request.params;
            next();
        }
    }
}