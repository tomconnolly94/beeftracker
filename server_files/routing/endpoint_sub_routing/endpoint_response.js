
module.exports = {

    send_successful_response: function(response, code, data){
        if(data){
            response.status(code).send(data);
        }
        else{
            response.status(code).send();
        }
    },
    
    send_unsuccessful_response: function(response, code, error){
        response.status(code).send(error);
    }
}