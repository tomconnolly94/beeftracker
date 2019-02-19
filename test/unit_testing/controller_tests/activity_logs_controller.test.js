//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var assert = chai.assert;
var BSON = require("bson");
var sinon = require("sinon");

//internal dependencies
var globals = require('../testing_globals.js');

describe('Module: activity_logs_controllers', function () {

    var activity_logs_controller, expected_results, callback_spy;

    beforeEach(function () {

        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        activity_logs_controller = proxyquire("../../../server_files/controllers/activity_logs_controller", {"../interfaces/db_interface.js": db_interface});
                
        expected_results = [
            { 
                field_1: "field_1 content"
            }
        ];
        
        db_interface.get = function(query_config, callback){ 
            callback(expected_results); 
        }
    });

    before(function(){
        callback_spy = sinon.spy();
    });

    it('events', function () {        
        activity_logs_controller.findActivityLogsFromEvent(globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(results, expected_results);
        });

        assert(callback_spy.called);
    });
    
    it('actors', function () {
        activity_logs_controller.findActivityLogsFromActor(globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(results, expected_results);
        });

        assert(callback_spy.called);
    });
});