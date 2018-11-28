//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;
var BSON = require("bson");

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");

//objects
var Event = require('../../../server_files/schemas/event.schema');
var globals = require('../globals.js');

describe('Module: event_controller', function () {
event_example
    var events_controller, db_interface, event_example, callback_spy;

    before(function(){
        
        //set timeout
        this.timeout(7000);
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        events_controller = proxyquire("../../../server_files/controllers/events_controller", { "../interfaces/db_interface.js": db_interface });

        event_example = {
            title: "title",
            aggressors: [ globals.dummy_object_id ],
            targets: [ globals.dummy_object_id, globals.dummy_object_id ],
            date: new Date(),
            description: "description",
            links: [
                {
                    "title" : "Spotify",
                    "url" : "https://spotify-link"
                },
                {
                    "title" : "Genius",
                    "url" : "https://genius-link"
                }
            ],
            gallery_items: [
                {
                    "media_type" : "youtube_embed",
                    "link" : "https://www.youtube.com/embed/0ePQKD9iBfU",
                    "main_graphic" : true,
                    "file" : null,
                    "file_name" : null
                },
                {
                    "media_type" : "image",
                    "link" : "image",
                    "main_graphic" : false,
                    "file" : null,
                    "file_name" : "image"
                }
            ],
            categories: [
                1,
                4
            ],
            data_sources: [
                "data_source_1",
                "data_source_2",
            ],
            record_origin: "record_origin",
            tags: [ "tag_1", "tag_2"],
            user_id: globals.dummy_object_id
        };
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

    it('findEvents', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_interface_callback_spy();
            assert.exists(query_config.aggregate_array);
            var aggregate_array_fields = query_config.aggregate_array.map(obj => Object.keys(obj)).join().split(",");
            expect(aggregate_array_fields).to.include("$match");
            success_callback([ event_example ]); 
        };

        events_controller.findEvents({}, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findEvent', function () {

        var db_interface_callback_spy = sinon.spy();

        var event_category_count = 5;
        
        db_interface.get = function(query_config, callback){
            db_interface_callback_spy();
            assert.equal(db_ref.get_event_categories_table(), query_config.table);
            assert.exists(query_config.aggregate_array[0]["$count"]);
            callback({ event_category_count: event_category_count }); 
        };

        events_controller.createEventCategory(event_category_name, function(result){
            callback_spy();
            assert.exists(result._id);
        });
        
        assert(db_interface_find_callback_spy.called);
        assert(db_interface_insert_callback_spy.called);
        assert(callback_spy.called);
    });
});