//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");

//objects
var EventCategory = require('../../../server_files/schemas/event.schema');
var globals = require('../globals.js');

describe('Module: event_controller', function () {

    var events_controller, db_interface, event_category_example, event_category_input, callback_spy;

    before(function(){
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        events_controller = proxyquire("../../../server_files/controllers/events_controller", { "../interfaces/db_interface.js": db_interface });

        event_category_name = "category 0"

        event_category_example = new EventCategory({
            cat_id: 0,
            name: "category 0"
        });
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('getEventCategories', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.find = function(query_config, callback){
            db_interface_callback_spy();
            assert.equal(db_ref.get_event_categories_table(), query_config.table);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            callback([ event_category_example ]); 
        };

        event_categories_controller.getEventCategories(function(results){
            callback_spy();
            assert.equal(1, results.length);
            assert.deepEqual(event_category_example, results[0]);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('createEventCategory', function () {

        var db_interface_find_callback_spy = sinon.spy();
        var db_interface_insert_callback_spy = sinon.spy();

        var event_category_count = 5;
        
        db_interface.find = function(query_config, callback){
            db_interface_find_callback_spy();
            assert.equal(db_ref.get_event_categories_table(), query_config.table);
            assert.exists(query_config.aggregate_array[0]["$count"]);
            callback({ event_category_count: event_category_count }); 
        };

        db_interface.insert = function(insert_config, callback){
            db_interface_insert_callback_spy();
            assert.exists(insert_config.record);
            assert.equal(event_category_count, insert_config.record.cat_id);
            assert.exists(insert_config.table);
            callback({ _id: insert_config.record.id }); 
        };

        event_categories_controller.createEventCategory(event_category_name, function(result){
            callback_spy();
            assert.exists(result._id);
        });
        
        assert(db_interface_find_callback_spy.called);
        assert(db_interface_insert_callback_spy.called);
        assert(callback_spy.called);
    });
});