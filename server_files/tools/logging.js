//external dependencies
var path = require('path');

//configs
var log_configuration = "debug";
var log_list;
var log_decoration = "*****";
var log_error_decoration = "##########";
var write_log;

//log type enums
var LOG_TYPE = {
    FATAL_FAILURE: "fatal_failure",
    ERROR: "error",
    WARNING: "warning",
    INFORMATION: "information",
    SUCCESS: "success",
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

    init_logging: function(config, log_function){
        log_list = module.exports.generate_log_list(log_configuration);
        write_log = log_function;
    },

    submit_log: function(type, module, message){

        relevant_stack_tier = get_relevant_stack_trace_tier();

        var calling_file_name = relevant_stack_tier.getFileName();
        var calling_function = relevant_stack_tier.getFunctionName();
        var calling_line_number = relevant_stack_tier.getLineNumber();

        if(!calling_function){
            calling_function = "anon";
        }
        calling_file_name = calling_file_name.replace(path.dirname(require.main.filename) + "/", '');

        if(log_list.indexOf(type) != -1){
            var log = `${log_decoration} Internal Log ${log_decoration} ${calling_file_name}:${calling_function}:${calling_line_number} - Type: ${type}, Module: ${module} - ${message}`;
            write_log(log);
            return log;
        }
        else{
            var prefix = `${log_error_decoration} Logging error ${log_error_decoration}`;
            write_log(`${prefix} - Log type: ${type} not recognised.`);
            write_log(`${prefix} - Available log types: ${LOG_TYPE}`);            
        }
    }
}

module.exports.init_logging("debug", console.log); //init logging module
