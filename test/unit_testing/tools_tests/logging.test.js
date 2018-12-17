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
        logger = proxyquire("../../../server_files/tools/logger");
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('submit_log - LOG_TYPE.ERROR', function () {
        logging.submit_log(logger.LOG_TYPE.ERROR, "logging test", "error message");

        //somehow assert that the console.log call has been invoked.
    });
});