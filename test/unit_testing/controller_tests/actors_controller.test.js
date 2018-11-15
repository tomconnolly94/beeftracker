//external dependencies
var proxyquire = require("proxyquire").noCallThru();
var mocha = require('mocha');
var chai = require('chai');
var assert = chai.assert;
var BSON = require("bson");

//objects
var Actor = require('../../../server_files/schemas/actor_schema');
var globals = require('../globals.js');

describe('Module: actors_controller', function () {

    var actors_controller, db_interface, actor_example;

    before(function () {
        
        //set timeout
        this.timeout(7000);
        
        actor_example = {
            name: "name",
            date_of_origin: "01/01/2001",
            place_of_origin: "place_of_origin",
            description: "description",
            associated_actors: [],
            data_sources: [ "data_source" ],
            also_known_as: ["also_known_as"],
            classification: "classification",
            variable_field_values: {},
            links: [],
            gallery_items: [{
                media_type: "image",
                link: "link1",
                file_name: "image1",
                file: { name: "file1" }
            },
            {
                media_type: "image",
                link: "link2",
                file_name: "image2",
                file: { name: "file2" }
            }],
            img_title_thumbnail: "img_title_thumbnail",
            img_title_fullsize: "img_title_fullsize",
            rating: 0,
            date_added: new Date(),
            name_lower: "name_lower",
            also_known_as_lower: ["also_known_as"],
            record_origin: "record_origin"
        };
            
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        storage_interface = require("../module_mocking/storage_interface.mock.js");
        actors_controller = proxyquire("../../../server_files/controllers/actors_controller", {"../interfaces/db_interface.js": db_interface, "../interfaces/storage_interface.js": storage_interface});
    });
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'format_actor_data' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    it('format_actor_data', function () {
                
        var expected_results = new Actor(actor_example);
        
        actors_controller.format_actor_data(actor_example, function(result){
            assert.equal(result, expected_results);
        });
    });
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'findActors' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    it('findActors: single', function () {
        
        db_interface.get = function(query_config, callback){
            callback(expected_results); 
        };
        
        var expected_results = [
            { 
                field_1: "field_1 content"
            }
        ];
        
        actors_controller.findActors({}, function(results){
            assert.equal(results, expected_results);
        });
    });
        
    it('findActors: multi', function () {
        
        db_interface.get = function(query_config, callback){
            callback(expected_results); 
        };
        
        var expected_results = [
            { 
                field_1: "field_1 content"
            },
            { 
                field_1: "field_1 content"
            }
        ];
        
        actors_controller.findActors({}, function(results){
            assert.equal(results, expected_results);
        });
    });
    
    it('findActors: date_added order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        }
        
        var req_query_dec = {
            decreasing_order: "date_added"
        }
        
        var expected_results_dec = {
            date_added: -1
        }
        
        actors_controller.findActors(req_query_dec, function(results){
            var result = results[3]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        var req_query_inc = {
            increasing_order: "date_added"
        }
        
        var expected_query_inc = {
            date_added: 1
        }
        
        actors_controller.findActors(req_query_inc, function(results){
            var result = results[3]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });
    });
    
    it('findActors: popularity order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        }
        
        var req_query_dec = {
            decreasing_order: "popularity"
        }
        
        var expected_results_dec = {
            popularity: -1
        }
        
        actors_controller.findActors(req_query_dec, function(results){
            var result = results[3]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        var req_query_inc = {
            increasing_order: "popularity"
        }
        
        var expected_query_inc = {
            popularity: 1
        }
        
        actors_controller.findActors(req_query_inc, function(results){
            var result = results[3]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });
    });
    
    it('findActors: name order query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        }
        
        var req_query_dec = {
            decreasing_order: "name"
        }
        
        var expected_results_dec = {
            name: -1
        }
        
        actors_controller.findActors(req_query_dec, function(results){
            var result = results[3]["$sort"];
            assert.deepEqual(result, expected_results_dec);
        });
        
        var req_query_inc = {
            increasing_order: "name"
        }
        
        var expected_query_inc = {
            name: 1
        }
        
        actors_controller.findActors(req_query_inc, function(results){
            var result = results[3]["$sort"];
            assert.deepEqual(result, expected_query_inc);
        });
    });
    
    it('findActors: name match query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        }
        
        var name = "name_example";
        
        var req_query = {
            match_name: name
        }
        
        var expected_results = {
            name: {
                "$options": "i",
                "$regex": name
            }
        }
        
        actors_controller.findActors(req_query, function(results){
            var result = results[0]["$match"];
            assert.deepEqual(result, expected_results);
        });
    });
    
    it('findActors: multi name match query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        }
        
        var name = "name_example";
        
        var req_query = {
            match_multi_names: name
        }
        
        var expected_results = {
            $or : [
                { name : name }, 
                { name_lower : name }, 
                { also_known_as : name }, 
                { also_known_as_lower : name }
            ]
        }
        
        actors_controller.findActors(req_query, function(results){
            var result = results[0]["$match"];
            assert.deepEqual(result, expected_results);
        });
    });
    
    it('findActors: limit query', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        }
        
        var limit = 4;
        
        var req_query = {
            limit: limit
        }
        
        var expected_results = limit;
        
        actors_controller.findActors(req_query, function(results){
            var result = results[1]["$limit"];
            assert.deepEqual(result, expected_results);
        });
    });
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'findActor' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    it('findActor', function () {
        
        db_interface.get = function(query_config, callback){
            callback(query_config.aggregate_array); 
        };
        
        var actor_id = globals.dummy_object_id;
        
        var expected_results = { '$match': { _id: BSON.ObjectID.createFromHexString(actor_id) } };
        
        actors_controller.findActor(actor_id, function(result){
            assert.deepEqual(result, expected_results);
        });
    });
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    // 'createActor' tests
    //
    ////////////////////////////////////////////////////////////////////////////////////////////////////
    
    it('createActor', function () {
        
        db_interface.insert = function(insert_config, callback){
            callback(globals.dummy_object_id); 
        };
        
        var files = actor_example.gallery_items;
        
        storage_interface.upload = function(upload_config, callback){            
            callback(upload_config.item_data);
        };

        actors_controller.createActor(actor_example, files, function(result){
            
            var actor_example_copy = actor_example;
            actor_example_copy._id = result._id;
            
            result = result["_doc"];
            result.rating = 0;
            
            var result_keys = Object.keys(result).sort();
            var actor_example_keys = Object.keys(actor_example_copy).sort();
            
            assert.deepEqual(result_keys, actor_example_keys);
            
            for(var i = 0; i < result_keys.length; i++){
                
                var key = result_keys[i];
                var fields_to_skip = [ "date_added" ];
                
                if(fields_to_skip.indexOf(result[key]) != -1){
                    assert.deepEqual(result[key], actor_example_copy[key]);
                }
            }
        });
    });
});