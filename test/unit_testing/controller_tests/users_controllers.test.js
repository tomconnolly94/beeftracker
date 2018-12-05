//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var globals = require("../globals.js");

//internal dependencies
var db_ref = require("../../../server_files/config/db_config.js");

describe('Module: users_controller', function () {

    var users_controller, db_interface, callback_spy, db_get_callback_spy, db_insert_callback_spy, storage_upload_callback_spy;

    before(function(){

        //set timeout
        this.timeout(7000);

        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        storage_interface = require("../module_mocking/storage_interface.mock.js");
        update_requests_controller = proxyquire("../../../server_files/controllers/update_requests_controller", { "../interfaces/db_interface.js": db_interface, "../interfaces/storage_interface.js": storage_interface});
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
        db_get_callback_spy = sinon.spy();
        storage_upload_callback_spy = sinon.spy();
        db_insert_callback_spy = sinon.spy();
    });

    it('createUpdateRequest', function () {
        
        var return_obj = { _id: globals.dummy_object_id };

        db_interface.get = function(query_config, callback){

            db_get_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_current_event_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            callback([ globals.event_example ]);
        };

        db_interface.insert = function(query_config, callback){

            db_insert_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_event_update_requests_table(), query_config.table);
            assert.exists(query_config.record);
            assert.exists(query_config.record.update_data);
            assert.exists(query_config.record.existing_event_id);
            assert.exists(query_config.record.user_id);
            assert.exists(query_config.options);
            callback({ _id: globals.dummy_object_id });
        };

        storage_interface.upload = function(upload_config, callback){

            storage_upload_callback_spy(); 
            assert.exists(upload_config.record_type);
            assert.exists(upload_config.item_data);
            assert.isTrue(upload_config.item_data.length > 0);
            assert.exists(upload_config.files);
            assert.isTrue(upload_config.files.length > 0);
            callback(upload_config.item_data);
        };

        var update_request_data = {
            event: true,
            user_id: globals.dummy_object_id,
            existing_event_id: globals.dummy_object_id,
            data: globals.event_example
        };

        var update_request_files = [
            {
                name: "file-1",
                buffer: "buffer"
            },
            {
                name: "file-1",
                buffer: "buffer"
            }
        ];

        update_requests_controller.createUpdateRequest(update_request_data, update_request_files, function(result){
            assert.deepEqual(return_obj, result);
            callback_spy();
        });

        assert(db_get_callback_spy.called);
        assert(storage_upload_callback_spy.called);
        assert(callback_spy.called);
    });
});