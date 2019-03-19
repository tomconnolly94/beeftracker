//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");
var storage_config = require("../../../server_files/config/storage_config");
var globals = require('../testing_globals.js');

var get_index_of_aggregate_stage = function(aggregate_array, stage_name){
    for(var i = 0; i < aggregate_array.length; i++){
        if(aggregate_array[i][stage_name]){ return i; }
    }
    return null;
}

describe('Module: event_controller', function () {

    var events_controller, db_interface, storage_interface, event_example, callback_spy, beef_chain_ids, gallery_items;

    //set timeout
    this.timeout(globals.default_timeout);

    before(function(){
        
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        storage_interface = require("../module_mocking/storage_interface.mock.js");
        events_controller = proxyquire("../../../server_files/controllers/events_controller", { "../interfaces/db_interface.js": db_interface, "../interfaces/storage_interface.js": storage_interface });

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
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'format_event_data' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

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
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'findEvents' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_sort_query = get_index_of_aggregate_stage(results, "$sort");
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
            var index_of_match_query = get_index_of_aggregate_stage(results, "$match");
            var result = results[index_of_match_query]["$match"];
            delete result.categories;
            assert.isTrue(globals.compare_objects(result, expected_results, [ "categories" ]));
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
            var index_of_limit_query = get_index_of_aggregate_stage(results, "$limit");
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


            event_example.beef_chains = beef_chain_ids;
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
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'createEvent' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    it('createEvent', function (done) {

        //this.timeout(8000); // A very long environment setup.
        var gallery_items = globals.dummy_object_id + "g";
        var db_insert_spy = sinon.spy();
        var db_get_spy = sinon.spy();
        var db_update_single_spy = sinon.spy();
        var si_upload_spy = sinon.spy();
        
        db_interface.insert = function(insert_config, callback){
            db_insert_spy();
            callback({ 
                _id: globals.dummy_object_id,
                gallery_items: gallery_items,
                beef_chain_ids: beef_chain_ids,
                aggressors: event_example.aggressors,
                targets: event_example.targets,
            }); 
        };

        db_interface.get = function(insert_config, callback){
            db_get_spy();
            callback({ 
                _id: globals.dummy_object_id,
                gallery_items: gallery_items,
                beef_chain_ids: beef_chain_ids 
            }); 
        };

        db_interface.updateSingle = function(insert_config, callback){
            db_update_single_spy();
            callback({
                _id: globals.dummy_object_id,
                beef_chain_ids: beef_chain_ids,
                gallery_items: gallery_items
            }); 
        };
        
        var files = event_example.gallery_items;
        
        storage_interface.upload = function(upload_config, callback){
            si_upload_spy();
            callback(upload_config.item_data);
        };
        
        var promise = new Promise(function(resolve, reject) {
            events_controller.createEvent(event_example, files, function(result){
                callback_spy();
                resolve(result);
            });
        });
        
        promise.then(function(result) {

            assert.equal(globals.dummy_object_id, result._id);
            //simply testing that what is returned by the db_interface.insert function is returned by the controller function
            assert.equal(gallery_items, result.gallery_items);
            assert.isTrue(globals.compare_objects(beef_chain_ids, result.beef_chain_ids));

            assert(db_insert_spy.called);
            assert(db_get_spy.called);
            assert(db_update_single_spy.called);
            assert(si_upload_spy.called);
            assert(callback_spy.called);
            done();
        }).catch(function(error){
            throw error;
            console.log(error);
        });
    });
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'deleteEvent' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    it('deleteEvent', function (done) {

        var db_delete_event_spy = sinon.spy();
        var db_delete_beef_chains_spy = sinon.spy();
        var db_update_single_spy = sinon.spy();
        var storage_remove_spy = sinon.spy();

        db_interface.delete = function(delete_config, callback){
            if(delete_config.table == db_ref.get_current_event_table()){
                db_delete_event_spy();

                assert.exists(delete_config.table);
                assert.exists(delete_config.delete_multiple_records);
                assert.equal(false, delete_config.delete_multiple_records);
                assert.exists(delete_config.match_query);
                assert.exists(delete_config.match_query["_id"]);
            }
            else if(delete_config.table == db_ref.get_beef_chain_table()){
                db_delete_beef_chains_spy();

                assert.exists(delete_config.table);
                assert.exists(delete_config.delete_multiple_records);
                assert.equal(true, delete_config.delete_multiple_records);
                assert.exists(delete_config.match_query);
                assert.exists(delete_config.match_query["_id"]);
            }
            else{
                throw "delete_config.table is not recognised.";
            }

            callback({ 
                _id: globals.dummy_object_id,
                gallery_items: globals.event_example.gallery_items,
                beef_chain_ids: beef_chain_ids
            }); 
        };

        db_interface.updateSingle = function(update_config, callback){
            db_update_single_spy();

            assert.exists(update_config.table);
            assert.equal(db_ref.get_beef_chain_table(), update_config.table);
            assert.exists(update_config.match_id_object);
            assert.exists(update_config.match_id_object._id);
            assert.equal(globals.dummy_object_id, update_config.match_id_object._id);
            assert.exists(update_config.update_clause);
            assert.exists(update_config.update_clause["$pull"]);
            assert.exists(update_config.update_clause["$pull"]["event_ids"]);
            callback({
                _id: globals.dummy_object_id,
                event_ids: []
            });
        };
        
        storage_interface.remove = function(remove_config, callback){
            storage_remove_spy();
            assert.exists(remove_config.items);
            assert.equal(1, remove_config.items.length);
            assert.isTrue(globals.compare_objects(globals.event_example.gallery_items[1], remove_config.items[0]));
            assert.exists(remove_config.record_type);
            assert.equal(storage_config.get_event_images_folder(), remove_config.record_type);
            callback();
        };

        events_controller.deleteEvent(globals.dummy_object_id, function(result){
            callback_spy();
            expect(typeof result.failed).to.eq('undefined');
        });
        
        var promise = new Promise(function(resolve, reject) {
            events_controller.deleteEvent(globals.dummy_object_id, function(result){
                callback_spy();
                resolve(result)
            });
        });
        
        promise.then(function(result) {

            expect(typeof result.failed).to.eq('undefined');

            assert(db_delete_event_spy.called);
            assert(db_delete_beef_chains_spy.called);
            assert(db_update_single_spy.called);
            assert(storage_remove_spy.called);
            assert(storage_remove_spy.called);
            assert(callback_spy.called);
            done();
        }).catch(function(error){
            throw error;
        });
    });
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'updateEvent' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////

    it('updateEvent', function () {

        var fake_files = [{ link: "image_1_link", media_type: "image"}];
        var delete_event_spy = sinon.spy();
        var create_event_spy = sinon.spy();

        events_controller.deleteEvent = function(existing_object_id, callback){
            delete_event_spy();
            assert.equal(globals.dummy_object_id, existing_object_id);
            callback({});
        }

        events_controller.createEvent = function(actor_data, passed_fake_files, callback){
            create_event_spy();
            assert.isTrue(globals.compare_objects(event_example, actor_data));
            assert.isTrue(globals.compare_objects(fake_files[0], passed_fake_files[0]));
            callback({});
        }

        events_controller.updateEvent(event_example, fake_files, globals.dummy_object_id, function(result){
            callback_spy();
            assert.isTrue(globals.compare_objects({}, result));
            expect(typeof result.failed).to.eq('undefined');
        });
        
        assert(delete_event_spy.called);
        assert(create_event_spy.called);
        assert(callback_spy.called);
    });
});
