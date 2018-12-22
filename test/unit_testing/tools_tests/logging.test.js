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
        logger.init_logging("debug", function(){});
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('submit_log - LOG_TYPE.ERROR', function () {
        var log = logger.submit_log(logger.LOG_TYPE.ERROR, "logging test", "error message");
        assert.equal("***** Internal Log ***** /home/tom/beeftracker/bf-dev/test/unit_testing/tools_tests/logging.test.js:anon:33 - Type: error Module: logging test - error message", log)
    });
});