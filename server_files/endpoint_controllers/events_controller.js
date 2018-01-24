

module.exports = {
    
    findEvents: function(request, response){
        console.log("test completed 1.");
        response.send({test: "complete 1"});
    },
    
    createEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    findSpecificEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.params.id);
        response.send({test: "complete 3"});
    },
    
    updateEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    deleteEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    }
}