//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

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
        var log_object = logger.submit_log(logger.LOG_TYPE.ERROR, error_message);
        assert.isTrue(globals.compare_objects({ log: ">> ERROR: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:33", message: error_message}, log_object))
    });

    it('submit_log - LOG_TYPE.FATAL_FAILURE', function () {
        var log_object = logger.submit_log(logger.LOG_TYPE.FATAL_FAILURE, error_message);
        assert.isTrue(globals.compare_objects({ log: ">> FATAL_FAILURE: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:38", message: error_message}, log_object))
    });
});