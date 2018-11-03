//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var assert = chai.assert;
var BSON = require("bson");

describe('Module: activity_logs_controllers', function () {

    var activity_logs_controller, expected_results;

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

    it('events', function () {
        
        var request = {
            params: {
                event_id: "5a69027a01e599f97e278f73"
            }
        }
        
        activity_logs_controller.findActivityLogsFromEvent(request, function(results){
            assert.equal(results, expected_results);
        });
    });
    
    it('actors', function () {
        var request = {
            params: {
                actor_id: "5a69027a01e599f97e278f73"
            }
        }
        
        activity_logs_controller.findActivityLogsFromActor(request, function(results){
            assert.equal(results, expected_results);
        });
    });
});