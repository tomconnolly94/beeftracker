
module.exports = {

    send_successful_api_response: function(response, code, data){
        if(data){
            response.status(code).send(data);
        }
        else{
            response.status(code).send();
        }
    },

    send_successful_page_response: function(response, code, page, view_parameters){
        response.render(page, view_parameters);
    },
    
    send_unsuccessful_api_response: function(response, code, error){
        response.status(code).send(error);
    },
    
    send_unsuccessful_page_response: function(response, code){
        response.status(code).render("pages/static/error.jade");
    }
}