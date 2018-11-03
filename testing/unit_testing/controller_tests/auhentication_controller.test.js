//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var assert = chai.assert;
var BSON = require("bson");

describe('Module: actors_controller', function () {

    var authentication_controller, db_interface, expected_results;

    beforeEach(function () {

        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        storage_interface = require("../module_mocking/storage_interface.mock.js");
        authentication_controller = proxyquire("../../../server_files/controllers/authentication_controller", {"../interfaces/db_interface.js": db_interface, "../interfaces/storage_interface.js": storage_interface});
        
        db_interface.get = function(query_config, callback){
            callback(expected_results); 
        }
    });

    it('findActors', function () {
        
        expected_results = [
            { 
                field_1: "field_1 content"
            }
        ];
        
        actors_module.findActors({}, function(results){
            assert.equal(results, expected_results);
        });
        expected_results = [
            { 
                field_1: "field_1 content"
            },
            { 
                field_1: "field_1 content"
            }
        ];
        
        actors_module.findActors({}, function(results){
            assert.equal(results, expected_results);
        });
    });
});