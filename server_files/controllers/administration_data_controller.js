module.exports = {
    
    getContactUsData: function(request, response, callback){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    },
    
    getAboutUsData: function(request, response, callback){
        console.log("test completed 2.");
        response.send({about_us: "Hello, we are Beeftracker a new company based in news."});
    },
    
    getPrivacyPolicyData: function(request, response, callback){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    },
    
    getTermsAndConditionsData: function(request, response, callback){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    },
    
    getDisclaimerData: function(request, response, callback){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    }
}