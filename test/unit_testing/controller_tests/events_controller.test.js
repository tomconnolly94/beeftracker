//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");
var globals = require('../testing_globals.js');

describe('Module: event_controller', function () {

    var events_controller, db_interface, event_example, callback_spy, beef_chain_ids, index_of_sort_query, index_of_match_query, index_of_limit_query;

    before(function(){
        
        //set timeout
        this.timeout(7000);
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        events_controller = proxyquire("../../../server_files/controllers/events_controller", { "../interfaces/db_interface.js": db_interface });

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

    it('format_event_data', function () {

        var formatted_event = events_controller.format_event_data(event_example);
        
        assert.equal(event_example.title, formatted_event.title);
        assert.exists(formatted_event.aggressors);
        assert.equal(1, formatted_event.aggressors.length);
        assert.exists(formatted_event.targets);
        assert.equal(2, formatted_event.targets.length);
        assert.exists(formatted_event.event_date);
        assert.exists(formatted_event.date_added);
        assert.equal(event_example.description, formatted_event.description);
        assert.exists(formatted_event.links);
        assert.exists(2, formatted_event.links.length);
        assert.exists(formatted_event.hit_counts);
        assert.equal(4, Object.keys(formatted_event.hit_counts).length);
        assert.equal(event_example.gallery_items.length, formatted_event.gallery_items.length);
        assert.equal(event_example.categories.length, formatted_event.categories.length);
        assert.equal("", formatted_event.cover_image);
        assert.equal(event_example.data_sources.length, formatted_event.data_sources.length);
        assert.exists(formatted_event.contributions);
        assert.equal(event_example.record_origin, formatted_event.record_origin);
        assert.equal(false, formatted_event.featured);
        assert.equal(event_example.tags.length, formatted_event.tags.length);
    });

    it('findEvents - success', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_interface_callback_spy();
            assert.exists(query_config.aggregate_array);
            var aggregate_array_fields = query_config.aggregate_array.map(obj => Object.keys(obj)).join().split(",");
            expect(aggregate_array_fields).to.include("$match");
            expect(aggregate_array_fields).to.include("$group");
            expect(aggregate_array_fields).to.include("$project");
            success_callback([ event_example ]); 
        };

        events_controller.findEvents({}, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findEvents - name order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        };

        var req_query_dec = {
            decreasing_order: "name"
        }
        
        var expected_results_dec = {
            name: -1
        }
        
        events_controller.findEvents(req_query_dec, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        assert(callback_spy.called);
        callback_spy = sinon.spy(); //reset spy
        
        var req_query_inc = {
            increasing_order: "name"
        }
        
        var expected_query_inc = {
            name: 1
        }
        
        events_controller.findEvents(req_query_inc, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });

        assert(callback_spy.called);
    });

    it('findEvents - rating order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        };

        var req_query_dec = {
            decreasing_order: "rating"
        }
        
        var expected_results_dec = {
            rating: -1
        }
        
        events_controller.findEvents(req_query_dec, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        assert(callback_spy.called);
        callback_spy = sinon.spy(); //reset spy
        
        var req_query_inc = {
            increasing_order: "rating"
        }
        
        var expected_query_inc = {
            rating: 1
        }
        
        events_controller.findEvents(req_query_inc, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });

        assert(callback_spy.called);
    });

    it('findEvents - popularity order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        };

        var req_query_dec = {
            decreasing_order: "popularity"
        }
        
        var expected_results_dec = {
            "hit_count.total": -1
        }
        
        events_controller.findEvents(req_query_dec, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        assert(callback_spy.called);
        callback_spy = sinon.spy(); //reset spy
        
        var req_query_inc = {
            increasing_order: "popularity"
        }
        
        var expected_query_inc = {
            "hit_count.total": 1
        }
        
        events_controller.findEvents(req_query_inc, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });

        assert(callback_spy.called);
    });

    it('findEvents - currently_trending order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        };

        var req_query_dec = {
            decreasing_order: "currently_trending"
        }
        
        var expected_results_dec = {
            "hit_counts.today": -1
        }
        
        events_controller.findEvents(req_query_dec, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        assert(callback_spy.called);
        callback_spy = sinon.spy(); //reset spy
        
        var req_query_inc = {
            increasing_order: "currently_trending"
        }
        
        var expected_query_inc = {
            "hit_counts.today": 1
        }
        
        events_controller.findEvents(req_query_inc, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });

        assert(callback_spy.called);
    });

    it('findEvents - date_added order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        };

        var req_query_dec = {
            decreasing_order: "date_added"
        }
        
        var expected_results_dec = {
            date_added: -1
        }
        
        events_controller.findEvents(req_query_dec, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        assert(callback_spy.called);
        callback_spy = sinon.spy(); //reset spy
        
        var req_query_inc = {
            increasing_order: "date_added"
        }
        
        var expected_query_inc = {
            date_added: 1
        }
        
        events_controller.findEvents(req_query_inc, function(results){
            callback_spy();
            var result = results[index_of_sort_query]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });

        assert(callback_spy.called);
    });
    
    it('findEvents: name match query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        }
        
        var field = "name_example";
        
        var req_query = {
            match_title: field
        }
        
        var expected_results = {
            title: {
                "$options": "i",
                "$regex": field
            }
        }
        
        events_controller.findEvents(req_query, function(results){
            callback_spy();
            var result = results[index_of_match_query]["$match"];
            assert.deepEqual(result, expected_results);
        });
        
        assert(callback_spy.called);
    });

    it('findEvents - limit query', function () {

        var db_interface_callback_spy = sinon.spy();
        var expected_results = 30;
        
        db_interface.get = function(query_config, success_callback){
            db_interface_callback_spy();
            assert.exists(query_config.aggregate_array);
            success_callback(query_config.aggregate_array); 
        };

        events_controller.findEvents({}, function(results){
            callback_spy();
            var result = results[index_of_limit_query]["$limit"];
            assert.deepEqual(result, expected_results);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findEvents - failure', function () {

        var db_interface_callback_spy = sinon.spy();
        var error_object = { 
            failed: true,
            module: "db_interface",
            function: "insert", 
            message: "Failed at db query"
        };
        
        db_interface.get = function(query_config, success_callback, failure_callback){
            db_interface_callback_spy();
            assert.exists(query_config.aggregate_array);
            var aggregate_array_fields = query_config.aggregate_array.map(obj => Object.keys(obj)).join().split(",");
            expect(aggregate_array_fields).to.include("$match");
            expect(aggregate_array_fields).to.include("$group");
            expect(aggregate_array_fields).to.include("$project");
            failure_callback(error_object); 
        };

        events_controller.findEvents({}, function(results){
            callback_spy();
            assert.isTrue(globals.compare_objects(error_object, results));
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

    it('findEvent - failure', function () {

        var db_interface_callback_spy = sinon.spy();
        var error_object = { 
            failed: true,
            module: "db_interface",
            function: "insert", 
            message: "Failed at db query"
        };
        
        db_interface.get = function(query_config, success_callback, failure_callback){
            db_interface_callback_spy();
            assert.equal(db_ref.get_current_event_table(), query_config.table);
            
            failure_callback(error_object); 
        };

        events_controller.findEvent(globals.dummy_object_id, function(results){
            callback_spy();
            assert.isTrue(globals.compare_objects(error_object, results));
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });
});