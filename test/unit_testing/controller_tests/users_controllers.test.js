//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");
var globals = require('../testing_globals.js');

describe('Module: users_controller', function () {

    var users_controller, db_interface, storage_interface, user_input_details, callback_spy;

    before(function(){
        
        //set timeout
        this.timeout(7000);
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        storage_interface = require("../module_mocking/storage_interface.mock.js");
        users_controller = proxyquire("../../../server_files/controllers/users_controller", { "../interfaces/db_interface.js": db_interface, "../interfaces/storage_interface": storage_interface });

        user_input_details = {
            username: "username example",
            first_name: "first_name example",
            last_name: "last_name example",
            email_address: "email_address example",
            password: "password example",
            d_o_b: "11/11/2011",
            img_title: "img_title example",
            admin: false,
            registration_method: "beeftracker"
        }
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('findUser - admin', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_interface_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            success_callback([ globals.event_example ]);
        };

        users_controller.findUser(globals.dummy_object_id, true, function(result){
            callback_spy();
            assert.isTrue(globals.compare_objects(globals.event_example, result));
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findUser - non admin', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_interface_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            success_callback([ globals.event_example ]);
        };

        users_controller.findUser(globals.dummy_object_id, true, function(result){
            callback_spy();
            assert.isTrue(globals.compare_objects(globals.event_example, result));
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('createUser - non admin', function () {

        var db_interface_callback_spy = sinon.spy();
        var storage_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_interface_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["$or"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["$or"][0]["username"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["$or"][1]["email_address"]);
            success_callback([ ]);
        };

        db_interface.insert = function(insert_config, success_callback){
            db_interface_callback_spy(); 
            assert.exists(insert_config.record);
            assert.exists(insert_config.table);
            assert.exists(insert_config.options);
            assert.equal(db_ref.get_user_details_table(), insert_config.table);
            success_callback({ id: globals.dummy_object_id });
        };

        storage_interface.upload = function(upload_config, callback){
            assert.exists(upload_config.record_type);
            storage_interface_callback_spy();
            callback();
        }

        var file = {
            link: user_input_details.img_title,
            file: {}
        }

        users_controller.createUser(user_input_details, [ file ], {"x-forwarded-for": "111.111.111.111"}, function(result){
            callback_spy();
            console.log(result);
            assert.exists(result);
            assert.exists(result.user_id);
            assert.equal(globals.dummy_object_id, result.user_id);
        });
        
        assert(db_interface_callback_spy.called);
        assert(storage_interface_callback_spy.called);
        assert(callback_spy.called);
    });
});