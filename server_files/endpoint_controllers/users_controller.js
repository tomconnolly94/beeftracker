

module.exports = {
    
    createUser: function(request, response){
        console.log("test completed 1.");
        response.send({test: "complete 1"});
    },
    
    updateUser: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    authenticateUser: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    deauthenticateUser: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    resetUserPassword: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    }
}