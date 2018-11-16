
var logs_on = true;

module.exports = {

    submit_log: function(type, module, message){
        if(logs_on){
            console.log(" *** Internal Log *** - " + type + " " + module + ": " + message);
        }
    }
}