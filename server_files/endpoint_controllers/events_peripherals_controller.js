

module.exports = {
    
    findEventsFromBeefChain: function(request, response){
        console.log("test completed 1.");
        response.send({test: "complete 1"});
    },
    
    findFeaturedEvents: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    findEventsRelatedToEvent: function(request, response){
        console.log("test completed 3.");
        console.log(request.params.id);
        response.send({test: "complete 3"});
    },
    
    findEventsRelatedToActor: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    }
}