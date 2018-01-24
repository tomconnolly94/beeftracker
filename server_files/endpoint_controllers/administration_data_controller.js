module.exports = {
    
    getContactUsData: function(req, response){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    },
    
    getAboutUsData: function(req, response){
        console.log("test completed 2.");
        response.send({about_us: "Hello, we are Beeftracker a new company based in news."});
    },
    
    getPrivacyPolicyData: function(req, response){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    },
    
    getTermsAndConditionsData: function(req, response){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    },
    
    getDisclaimerData: function(req, response){
        console.log("test completed 2.");
        response.send({test: "complete 2"});
    }
}