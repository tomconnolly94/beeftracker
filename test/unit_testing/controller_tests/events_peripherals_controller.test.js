//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");

//internal dependencies
var db_ref = require("../../../server_files/config/db_config.js");
var globals = require("../testing_globals.js");

describe('Module: events_peripherals_controller', function () {

    var events_peripherals_controller, db_interface, cookie_spy, db_single_response_object, db_multi_response_object, callback_spy, db_get_callback_spy;

    before(function(){

        //set timeout
        this.timeout(7000);

        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        hashing = require("../module_mocking/hashing.mock.js");
        events_peripherals_controller = proxyquire("../../../server_files/controllers/events_peripherals_controller", { "../interfaces/db_interface.js": db_interface, "../tools/hashing.js": hashing });

        db_single_response_object = [
            {
                event_id: globals.dummy_object_id,
                aggressors: [
                    globals.dummy_object_id,
                    globals.dummy_object_id,
                    globals.dummy_object_id,
                    globals.dummy_object_id,
                    globals.dummy_object_id,
                ],
                targets: [
                    globals.dummy_object_id,
                    globals.dummy_object_id,
                    globals.dummy_object_id,
                    globals.dummy_object_id,
                    globals.dummy_object_id
                ]
            }
        ];

        db_multi_response_object = [
            { _id: globals.dummy_object_id },
            { _id: globals.dummy_object_id },
            { _id: globals.dummy_object_id },
            { _id: globals.dummy_object_id },
            { _id: globals.dummy_object_id },
            { _id: globals.dummy_object_id },
            { _id: globals.dummy_object_id }
        ];
        
        db_multi_response_object_ids = [
            globals.dummy_object_id,
            globals.dummy_object_id,
            globals.dummy_object_id,
            globals.dummy_object_id,
            globals.dummy_object_id,
            globals.dummy_object_id,
            globals.dummy_object_id,
        ];

        db_interface.get = function(query_config, callback){

            db_get_callback_spy();
            callback([{ 
                events: db_multi_response_object,
                event_ids: db_multi_response_object_ids 
            }]);
            /*if(query_config.aggregate_array[0]["$match"].hasOwnProperty("$or")){
                callback(db_multi_response_object);
            }
            else{
                callback(db_single_response_object);
            }*/
        };
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
        db_get_callback_spy = sinon.spy();
    });

    it('findEventsFromBeefChain', function () {

        events_peripherals_controller.findEventsFromBeefChain(globals.dummy_object_id, function(result){
            assert(db_multi_response_object, result);
            callback_spy();
        });
    
        assert(db_get_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findEventsRelatedToEvent', function () {
        
        events_peripherals_controller.findEventsRelatedToEvent(globals.dummy_object_id, function(results){
            assert.equal(db_multi_response_object[0], results[0]);
            assert.equal(12, results.length);
            assert(db_get_callback_spy.called);
        });
    
    });

    it('findEventsRelatedToActor', function () {

        events_peripherals_controller.findEventsRelatedToActor(globals.dummy_object_id, function(result){
            assert(db_multi_response_object, result);
            callback_spy();
        });
    
        assert(db_get_callback_spy.called);
        assert(callback_spy.called);
    });
});