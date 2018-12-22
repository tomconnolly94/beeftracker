//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");
var globals = require('../testing_globals.js');

describe('Module: votes_controller', function () {

    var events_controller, db_interface, event_example, callback_spy, beef_chain_ids, index_of_sort_query, index_of_match_query, index_of_limit_query;

    before(function(){
        
        //set timeout
        this.timeout(7000);
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        votes_controller = proxyquire("../../../server_files/controllers/votes_controller", { "../interfaces/db_interface.js": db_interface });

        event_example = globals.event_example;

        beef_chain_ids = [
            {
                _id: globals.dummy_object_id,
                events: [
                    { event_date: new Date(00,00,2000) },
                    { event_date: new Date(01,01,2001) },
                    { event_date: new Date(02,02,2002) }
                ]
            },
            {
                _id: globals.dummy_object_id,
                events: [
                    { event_date: new Date(00,00,2000) },
                    { event_date: new Date(01,01,2001) },
                    { event_date: new Date(02,02,2002) }
                ]
            },
            {
                _id: globals.dummy_object_id,
                events: [
                    { event_date: new Date(00,00,2000) },
                    { event_date: new Date(01,01,2001) },
                    { event_date: new Date(02,02,2002) }
                ]
            },
        ];

        index_of_sort_query = 10;
        index_of_match_query = 0;
        index_of_limit_query = 10;
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('findUser - admin', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_get_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_current_event_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            callback([ globals.event_example ]);
        };

        users_controller.findUser(globals.dummy_object_id, true, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findUser - non admin', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_get_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_current_event_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            callback([ globals.event_example ]);
        };

        users_controller.findUser(globals.dummy_object_id, true, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findEvent - success', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_interface_callback_spy();
            assert.equal(db_ref.get_current_event_table(), query_config.table);


            event_example.beef_chain_ids = beef_chain_ids;
            success_callback([ event_example ]); 
        };

        events_controller.findEvent(globals.dummy_object_id, function(result){
            callback_spy();
            assert.exists(result);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });
});