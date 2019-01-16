//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");
var globals = require('../testing_globals.js');

describe('Module: users_controller', function () {

    var users_controller, db_interface, storage_interface, email_interface, user_input_details, callback_spy;

    before(function () {

        //set timeout
        this.timeout(10000);
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        storage_interface = require("../module_mocking/storage_interface.mock.js");
        email_interface = require("../module_mocking/storage_interface.mock.js");
        users_controller = proxyquire("../../../server_files/controllers/users_controller", {
            "../interfaces/db_interface.js": db_interface,
            "../interfaces/storage_interface": storage_interface,
            "../interfaces/email_interface": email_interface
        });

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

        db_interface.get = function (query_config, success_callback) {
            db_interface_callback_spy();
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            success_callback([globals.event_example]);
        };

        users_controller.findUser(globals.dummy_object_id, true, function (result) {
            callback_spy();
            assert.isTrue(globals.compare_objects(globals.event_example, result));
        });

        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('findUser - non admin', function () {

        var db_interface_callback_spy = sinon.spy();

        db_interface.get = function (query_config, success_callback) {
            db_interface_callback_spy();
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            success_callback([globals.event_example]);
        };

        users_controller.findUser(globals.dummy_object_id, true, function (result) {
            callback_spy();
            assert.isTrue(globals.compare_objects(globals.event_example, result));
        });

        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('createUser - non admin', function () {

        var db_interface_get_callback_spy = sinon.spy();
        var db_interface_insert_callback_spy = sinon.spy();
        var storage_interface_callback_spy = sinon.spy();

        db_interface.get = function (query_config, success_callback) {
            db_interface_get_callback_spy();
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["$or"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["$or"][0]["username"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["$or"][1]["email_address"]);
            success_callback([]);
        };

        db_interface.insert = function (insert_config, success_callback) {
            db_interface_insert_callback_spy();
            assert.exists(insert_config.record);
            assert.exists(insert_config.table);
            assert.exists(insert_config.options);
            assert.equal(db_ref.get_user_details_table(), insert_config.table);
            success_callback({
                id: globals.dummy_object_id
            });
        };

        storage_interface.upload = function (upload_config, callback) {
            assert.exists(upload_config.record_type);
            storage_interface_callback_spy();
            callback();
        }

        var file = {
            link: user_input_details.img_title,
            file: {}
        }

        users_controller.createUser(user_input_details, [file], {
            "x-forwarded-for": "111.111.111.111"
        }, function (result) {
            callback_spy();
            console.log(result);
            assert.exists(result);
            assert.exists(result.user_id);
            assert.equal(globals.dummy_object_id, result.user_id);
        });

        assert(db_interface_get_callback_spy.called);
        assert(db_interface_insert_callback_spy.called);
        assert(storage_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('deleteUser', function () {

        var db_interface_get_callback_spy = sinon.spy();
        var db_interface_delete_callback_spy = sinon.spy();
        var storage_interface_callback_spy = sinon.spy();

        db_interface.get = function (query_config, success_callback) {
            db_interface_get_callback_spy();
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            success_callback([{
                id: globals.dummy_object_id
            }]);
        };

        db_interface.delete = function (delete_config, success_callback) {
            db_interface_delete_callback_spy();
            assert.exists(delete_config.table);
            assert.equal(db_ref.get_user_details_table(), delete_config.table);
            assert.exists(delete_config.delete_multiple_records);
            assert.equal(delete_config.delete_multiple_records, false);
            assert.exists(delete_config.match_query);
            assert.exists(delete_config.match_query["_id"]);
            success_callback({
                id: globals.dummy_object_id
            });
        };

        storage_interface.remove = function (remove_config, callback) {
            assert.exists(remove_config.record_type);
            assert.exists(remove_config.items);
            storage_interface_callback_spy();
            callback();
        }

        users_controller.deleteUser(globals.dummy_object_id, function (result) {
            callback_spy();
            assert.exists(result.id);
        });

        assert(db_interface_get_callback_spy.called);
        assert(db_interface_delete_callback_spy.called);
        assert(storage_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('requestPasswordReset', function () {

        var db_interface_get_callback_spy = sinon.spy();
        var db_interface_update_callback_spy = sinon.spy();
        var email_interface_callback_spy = sinon.spy();
        var dummy_email_address = "fake@person.com";

        db_interface.get = function (query_config, success_callback) {
            db_interface_get_callback_spy();
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["email_address"]);
            assert.equal(query_config.aggregate_array[0]["$match"]["email_address"], dummy_email_address);
            success_callback([{
                _id: globals.dummy_object_id
            }]);
        };

        db_interface.update = function (update_config, success_callback) {
            db_interface_update_callback_spy();
            assert.exists(update_config.table);
            assert.equal(db_ref.get_password_reset_request_table(), update_config.table);
            assert.exists(update_config.existing_object_id);
            assert.equal(globals.dummy_object_id, update_config.existing_object_id);
            assert.exists(update_config.update_clause);
            assert.exists(update_config.update_clause["$set"]);
            assert.equal(update_config.update_clause["$set"].user_email, dummy_email_address);
            assert.exists(update_config.options);
            success_callback({
                _id: globals.dummy_object_id
            });
        };

        email_interface.send = function (send_email_config, callback) {
            email_interface_callback_spy();
            assert.exists(send_email_config.email_title);
            assert.exists(send_email_config.email_html);
            assert.exists(send_email_config.recipient_address);
            callback();
        };

        users_controller.requestPasswordReset(dummy_email_address, function (result) {
            callback_spy();
            assert.exists(result._id);
            assert.equal(globals.dummy_object_id, result._id);
        });

        assert(db_interface_get_callback_spy.called);
        assert(db_interface_update_callback_spy.called);
        assert(email_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('executePasswordReset', function () {

        var db_interface_delete_callback_spy = sinon.spy();
        var db_interface_update_callback_spy = sinon.spy();
        var dummy_email_address = "fake@person.com";

        db_interface.delete = function (delete_config, success_callback) {
            db_interface_delete_callback_spy();
            //table
            assert.exists(delete_config.table);
            assert.equal(db_ref.get_password_reset_request_table(), delete_config.table);
            //match_query
            assert.exists(delete_config.match_query);
            assert.exists(delete_config.match_query.id_token);
            assert.exists(delete_config.match_query.id_token);
            //delete_multiple_records
            assert.exists(delete_config.delete_multiple_records);
            assert.equal(delete_config.delete_multiple_records, false);
            success_callback({
                _id: globals.dummy_object_id,
                email_address: dummy_email_address
            });
        };

        db_interface.update = function (update_config, success_callback) {
            db_interface_update_callback_spy();
            //table
            assert.exists(update_config.table);
            assert.equal(db_ref.get_password_reset_request_table(), update_config.table);
            //match_query
            assert.exists(update_config.match_query);
            assert.exists(update_config.match_query.user_email);
            assert.equal(dummy_email_address, update_config.match_query.user_email);
            //update_clause
            assert.exists(update_config.update_clause);
            assert.exists(update_config.update_clause["$set"]);
            assert.exists(update_config.update_clause["$set"].hashed_password);
            assert.exists(update_config.update_clause["$set"].salt);
            //options
            assert.exists(update_config.options);
            success_callback({
                _id: globals.dummy_object_id
            });
        };

        var new_password = "new_password";

        users_controller.executePasswordReset(dummy_email_address, new_password, function (result) {
            callback_spy();
            assert.exists(result._id);
            assert.equal(globals.dummy_object_id, result._id);
        });

        assert(db_interface_delete_callback_spy.called);
        assert(db_interface_update_callback_spy.called);
        assert(callback_spy.called);
    });

    it('addViewedBeefEventToUser', function () {

        var db_interface_update_callback_spy = sinon.spy();

        db_interface.update = function (update_config, success_callback) {
            db_interface_update_callback_spy();
            //table
            assert.exists(update_config.table);
            assert.equal(db_ref.get_user_details_table(), update_config.table);
            //match_query
            assert.exists(update_config.match_query);
            assert.exists(update_config.match_query._id);
            assert.equal(globals.dummy_object_id, update_config.match_query._id);
            //update_clause
            assert.exists(update_config.update_clause);
            assert.exists(update_config.update_clause["$push"]);
            assert.exists(update_config.update_clause["$push"].viewed_beef_ids);
            assert.exists(update_config.update_clause["$push"].viewed_beef_ids.id);
            assert.exists(update_config.update_clause["$push"].viewed_beef_ids.date);
            //options
            assert.exists(update_config.options);
            success_callback({
                _id: globals.dummy_object_id
            });
        };

        users_controller.addViewedBeefEventToUser(globals.dummy_object_id, globals.dummy_object_id, function (result) {
            callback_spy();
            assert.exists(result._id);
            assert.equal(globals.dummy_object_id, result._id);
        });

        assert(db_interface_update_callback_spy.called);
        assert(callback_spy.called);
    });

    it('updateUserImage', function () {

        var db_interface_get_callback_spy = sinon.spy();
        var db_interface_update_callback_spy = sinon.spy();
        var storage_interface_callback_spy = sinon.spy();
        var dummy_file_buffer = "dummy_file_buffer";
        var dummy_img_link = "image_link";
        var dummy_img_title = "image_title";

        db_interface.get = function (query_config, success_callback) {
            db_interface_get_callback_spy();
            //table
            assert.exists(query_config.table);
            assert.equal(db_ref.get_user_details_table(), query_config.table);
            //aggregate_array
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            success_callback([{
                img_title: dummy_img_title
            }]);
        };

        db_interface.update = function (update_config, success_callback) {
            db_interface_update_callback_spy();
            //table
            assert.exists(update_config.table);
            assert.equal(db_ref.get_user_details_table(), update_config.table);
            //match_query
            assert.exists(update_config.match_query);
            assert.exists(update_config.match_query._id);
            assert.equal(globals.dummy_object_id, update_config.match_query._id);
            //update_clause
            assert.exists(update_config.update_clause);
            assert.exists(update_config.update_clause["$set"]);
            assert.exists(update_config.update_clause["$set"].img_title);
            //options
            assert.exists(update_config.options);
            success_callback({
                _id: globals.dummy_object_id
            });
        };

        storage_interface.upload = function (upload_config, callback) {
            assert.exists(upload_config.record_type);
            assert.exists(upload_config.item_data);
            assert.exists(upload_config.files);
            assert.equal(dummy_img_link, upload_config.item_data[0]);
            assert.equal(dummy_file_buffer, upload_config.files[0]);
            storage_interface_callback_spy();
            callback([{
                img_title: dummy_img_title
            }]);
        }

        storage_interface.delete_image = function (upload_config, callback) {

        };

        users_controller.updateUserImage(globals.dummy_object_id, {
            link: dummy_img_link
        }, {
            buffer: dummy_file_buffer
        }, function (result) {
            callback_spy();
        });

        assert(db_interface_get_callback_spy.called);
        assert(db_interface_update_callback_spy.called);
        assert(callback_spy.called);
    });
});