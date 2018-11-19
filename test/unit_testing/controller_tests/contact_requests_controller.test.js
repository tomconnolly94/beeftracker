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
var ContactRequest = require('../../../server_files/schemas/contact_request.schema').model;
var globals = require('../globals.js');


describe('Module: contact_requests_controller', function () {

    var contact_requests_controller, db_interface, contact_request_example, contact_request_input, callback_spy;

    before(function(){
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        contact_requests_controller = proxyquire("../../../server_files/controllers/contact_requests_controller", { "../interfaces/db_interface.js": db_interface });

        contact_request_input = {
            text: "contact_request text",
            user: globals.dummy_object_id,
            event_id: globals.dummy_object_id
        };

        contact_request_example = new ContactRequest({
            name: "name",
            email_address: "email address",
            subject: "contact request message subject",
            message: "contact request message message"
        });
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('findContactRequests', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, callback){
            db_interface_callback_spy();
            assert.exists(query_config.table);
            assert.exists(query_config.aggregate_array[0]["$match"].email_address);
            callback([ contact_request_example ]); 
        };

        contact_requests_controller.findContactRequests({ email_address: "email_address" }, function(results){
            callback_spy();
            assert.equal(1, results.length);
            assert.deepEqual(contact_request_example, results[0]);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('createContactRequest', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.insert = function(insert_config, callback){
            db_interface_callback_spy();
            assert.exists(insert_config.options.email_config);
            assert.equal(db_ref.get_contact_requests_table(), insert_config.table);
            assert.exists(insert_config.record);
            callback({ _id: insert_config.record.id }); 
        };

        contact_requests_controller.createContactRequest(contact_request_input, function(result){
            callback_spy();
            assert.exists(result._id);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });
});