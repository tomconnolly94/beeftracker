//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

//internal dependencies
var globals = require('../testing_globals.js');

describe('Module: formatting', function () {

    var logger, error_message;

    before(function(){
        
        //set timeout
        this.timeout(7000);
        var console_stub = {
            log: function(message){

            }
        }
        formatting = require("../../../server_files/tools/formatting");
        error_message = "error message";
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('submit_log - LOG_TYPE.ERROR', function () {
        console.log("Test message: ");
        var log_object = logger.submit_log(logger.LOG_TYPE.ERROR, error_message);
        assert.isTrue(globals.compare_objects({ log: ">> ERROR: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:34", message: error_message}, log_object))
    });

    it('submit_log - LOG_TYPE.FATAL_FAILURE', function () {
        console.log("Test message: ");
        var log_object = logger.submit_log(logger.LOG_TYPE.FATAL_FAILURE, error_message);
        assert.isTrue(globals.compare_objects({ log: ">> FATAL_FAILURE: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:40", message: error_message}, log_object))
    });
});