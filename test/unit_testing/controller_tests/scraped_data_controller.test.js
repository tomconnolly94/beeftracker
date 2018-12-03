//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");
var globals = require("../globals.js");

//internal dependencies
var db_ref = require("../../../server_files/config/db_config.js");

describe('Module: scraped_data_controller', function () {

    var scraped_data_controller, db_interface, python_shell, db_multi_response_object, callback_spy, db_get_callback_spy, actor_name, successful_return;

    before(function(){

        //set timeout
        this.timeout(7000);

        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        python_shell = require("../module_mocking/python_shell.mock.js");
        scraped_data_controller = proxyquire("../../../server_files/controllers/scraped_data_controller", { "../interfaces/db_interface.js": db_interface, 'python-shell': python_shell });

        db_multi_response_object = [
            { event_id: globals.dummy_object_id },
            { event_id: globals.dummy_object_id },
            { event_id: globals.dummy_object_id },
            { event_id: globals.dummy_object_id },
            { event_id: globals.dummy_object_id },
            { event_id: globals.dummy_object_id },
            { event_id: globals.dummy_object_id }
        ];

        actor_name = "actor name";
        successful_return = {
            success: true,
            message: "successful_return"
        }
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
        db_get_callback_spy = sinon.spy();
        callback_spy = sinon.spy();
    });

    it('findScrapedEventData -', function () {

        db_interface.get = function(query_config, callback){

            db_get_callback_spy(); 
            assert.exists(query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$lookup"]);
            assert.exists(query_config.aggregate_array[1]["$sort"]);
            assert.exists(query_config.aggregate_array[2]["$limit"]);
            callback(db_multi_response_object);
        };

        scraped_data_controller.findScrapedEventData(globals.dummy_object_id, function(results){
            assert(db_multi_response_object, results);
            callback_spy();
        });
    
        assert(db_get_callback_spy.called);
        assert(callback_spy.called);
    });

    it('deleteScrapedEventData', function () {
        
        db_interface.delete = function(query_config, callback){

            db_get_callback_spy(); 
            assert.exists(query_config.table);
            assert.exists(query_config.match_query);
            assert.exists(query_config.match_query["_id"]);
            assert.exists(query_config.match_query["_id"]["$in"]);
            assert.equal(2, query_config.match_query["_id"]["$in"].length);
            callback(db_multi_response_object);
        };

        scraped_data_controller.deleteScrapedEventData([globals.dummy_object_id, globals.dummy_object_id], function(result){
            assert.deepEqual({}, result);
            callback_spy();
        });

        assert(db_get_callback_spy.called);
        assert(callback_spy.called);
    });

    it('scrapeActor - failure', function () {

        python_shell.run = function(actor_name, options, callback){
            db_get_callback_spy();
            callback({}, [ "404 error\r"]);
        };

        scraped_data_controller.scrapeActor(actor_name, function(result){
            assert.isTrue(result.failed);
            callback_spy();
        });

        assert(db_get_callback_spy.called);
        assert(callback_spy.called);
    });

    it('scrapeActor - success', function () {

        python_shell.run = function(actor_name, options, callback){
            db_get_callback_spy();
            callback({}, [ successful_return ]);
        };

        scraped_data_controller.scrapeActor(actor_name, function(result){
            assert.isTrue(globals.compare_objects(successful_return, result));
            callback_spy();
        });
    
        assert(db_get_callback_spy.called);
        assert(callback_spy.called);
    });
});