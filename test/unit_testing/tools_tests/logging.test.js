//external dependencies
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;

//internal dependencies
var globals = require('../testing_globals.js');

describe('Module: logging', function () {

    var logger, error_message;

    before(function(){
        
        //set timeout
        this.timeout(7000);
        var console_stub = {
            log: function(message){

            }
        }
        logger = require("../../../server_files/tools/logging");
        error_message = "error message";
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('submit_log - LOG_TYPE.ERROR', function () {
        console.log("Test message: ");
        var log_object = logger.submit_log(logger.LOG_TYPE.ERROR, error_message);
        var expected_log_object = { log: ">> ERROR: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:32", message: error_message };
        assert.isTrue(globals.compare_objects(expected_log_object, log_object))
    });

    it('submit_log - LOG_TYPE.FATAL_FAILURE', function () {
        console.log("Test message: ");
        var log_object = logger.submit_log(logger.LOG_TYPE.FATAL_FAILURE, error_message);
        var expected_log_object = { log: ">> FATAL_FAILURE: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:39", message: error_message };
        assert.isTrue(globals.compare_objects(expected_log_object, log_object))
    });
});