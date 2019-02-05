//external dependencies
var path = require('path');

//configs
var log_configuration = process.env.LOGGING_CONFIG ? process.env.LOGGING_CONFIG : "verbose";
var log_list;
var log_decoration = "*****";
var abbreviated_log_decoration = ">>"
var log_error_decoration = "##########";
var write_log;
var abbreviated_log_style = true;

//log type enums
var LOG_TYPE = {
    FATAL_FAILURE: "FATAL_FAILURE",
    ERROR: "ERROR",
    WARNING: "WARNING",
    INFO: "INFO",
    EXTRA_INFO: "EXTRA_INFO",
    SUCCESS: "SUCCESS",
};

var get_relevant_stack_trace_tier = function(){

    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack) {
        return stack;
    };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack[1];
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
                    LOG_TYPE.INFO,
                    LOG_TYPE.EXTRA_INFO,
                    LOG_TYPE.SUCCESS
                ];
            case "verbose":
                return [
                    LOG_TYPE.FATAL_FAILURE,
                    LOG_TYPE.ERROR,
                    LOG_TYPE.WARNING,
                    LOG_TYPE.INFO
                ];
            case "only_errors":
                return [
                    LOG_TYPE.FATAL_FAILURE,
                    LOG_TYPE.ERROR
                ];                break;
            case "only_fatal_errors":
                return [
                    LOG_TYPE.FATAL_FAILURE
                ];
            case "no_errors":
                return [
                    LOG_TYPE.WARNING,
                    LOG_TYPE.INFO,
                    LOG_TYPE.SUCCESS
                ];
            case "none":
                return [];
        }
    },

    init_logging: function(log_function){
        log_list = module.exports.generate_log_list(log_configuration);
        write_log = log_function;
    },

    submit_log: function(type, message){

        relevant_stack_tier = get_relevant_stack_trace_tier();

        var calling_file_path = relevant_stack_tier.getFileName();
        var calling_function = relevant_stack_tier.getFunctionName();
        var calling_line_number = relevant_stack_tier.getLineNumber();

        if(!calling_function){
            calling_function = "anon";
        }
        calling_file_path = calling_file_path.replace(path.dirname(require.main.filename) + "/", '');
        
        if(log_list.indexOf(type) != -1){
            var calling_file_path_split = calling_file_path.split("/");
            var calling_file_name = calling_file_path_split[calling_file_path_split.length - 1].split(".")[0]
            var log;
            if(abbreviated_log_style){
                log = `${abbreviated_log_decoration} ${type}: ${calling_file_path}:${calling_function}:${calling_line_number}`;
            }
            else{
                log = `${log_decoration} Internal Log ${log_decoration} ${calling_file_path}:${calling_function}:${calling_line_number} - Type: ${type}, Module: ${calling_file_name}`;
            }
            write_log(log, message);
            return { log: log, message: message };
        }
        else if(Object.keys(LOG_TYPE).indexOf(type) != -1){
            //do nothing, log is not switched on
        }
        else{
            var prefix = `${log_error_decoration} Logging error ${log_error_decoration}`;
            write_log(`${prefix} - Log type: ${type} not recognised.`);
            write_log(`${prefix} - Available log types: ${Object.keys(LOG_TYPE)}`);            
        }
    }
}

module.exports.init_logging(console.log); //init logging module
