//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

//internal dependencies
var globals = require('../testing_globals.js');

describe('Module: logging', function () {

    var logger

    before(function(){
        
        //set timeout
        this.timeout(7000);
        var console_stub = {
            log: function(message){

            }
        }
        logger = require("../../../server_files/tools/logging");
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('submit_log - LOG_TYPE.ERROR', function () {
        var log = logger.submit_log(logger.LOG_TYPE.ERROR, "error message");
        assert.equal(">> ERROR: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:32 - error message", log)
    });

    it('submit_log - LOG_TYPE.FATAL_FAILURE', function () {
        var log = logger.submit_log(logger.LOG_TYPE.FATAL_FAILURE, "error message");
        assert.equal(">> FATAL_FAILURE: /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:37 - error message", log)
    });
});