var log_configuration = "debug";
var log_list = generate_log_list(log_configuration);
var log_decoration = "***********";
var log_error_decoration = "##########"

//log type enums
var LOG_TYPE = {
    FATAL_FAILURE: "fatal_failure",
    ERROR: "error",
    WARNING: "warning",
    INFORMATION: "information",
    SUCCESS: "success",
};

module.exports = {

    LOG_TYPE: LOG_TYPE,

    generate_log_list: function(config){

        switch(config){
            case "debug":
                return [
                    LOG_TYPE.FATAL_FAILURE,
                    LOG_TYPE.ERROR,
                    LOG_TYPE.WARNING,
                    LOG_TYPE.INFORMATION,
                    LOG_TYPE.SUCCESS
                ];
                break;
            case "verbose":
                return [
                    LOG_TYPE.FATAL_FAILURE,
                    LOG_TYPE.ERROR,
                    LOG_TYPE.WARNING,
                    LOG_TYPE.INFORMATION
                ];
                break;
            case "only_errors":
                return [
                    LOG_TYPE.FATAL_FAILURE,
                    LOG_TYPE.ERROR
                ];
                break;
            case "only_fatal_errors":
                return [
                    LOG_TYPE.FATAL_FAILURE
                ];
                break;
            case "no_errors":
                return [
                    LOG_TYPE.WARNING,
                    LOG_TYPE.INFORMATION,
                    LOG_TYPE.SUCCESS
                ];
                break;
            case "none":
                return [];
        }
    },

    submit_log: function(type, module, message){
        if(log_list.indexOf(type) != -1){
            console.log(log_decoration + " Internal Log " + log_decoration + " - " + type + " " + module + ": " + message);
        }
        else{
            var prefix = log_error_decoration + " Logging error " + log_error_decoration;
            console.log(prefix + " - Log type: " + type + " not recognised.");
            console.log(prefix + " - Available log types: " + LOG_TYPE);            
        }
    }
}