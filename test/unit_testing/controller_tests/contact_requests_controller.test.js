//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");

//objects
var ContactRequest = require('../../../server_files/schemas/contact_request.schema').model;
var globals = require('../globals.js');


describe('Module: contact_requests_controller', function () {

    var comments_controller, db_interface, contact_request_example, contact_request_input, callback_spy;

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

    it('findContactRequest', function () {

        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(insert_config, callback){
            db_interface_callback_spy();
            callback([ contact_request_example ]); 
        };

        contact_requests_controller.findContactRequest({ email_address: "email_address" }, function(results){
            callback_spy();
            assert.equal(1, results.length)
            assert.deepEqual(contact_request_example, results[0]);
        });
        
        assert(callback_spy.called);
        assert(db_interface_callback_spy.called);
    });

    it('findContactRequests', function () {
        
        db_interface.get = function(insert_config, callback){
            mock_callback_spy();
            callback({ _id: insert_config.record.id }); 
        };

        contact_requests_controller.findContactRequests(function(result){
            callback_spy();
            assert.exists(result._id);
        });
        
        assert(callback_spy.called);
        assert(mock_callback_spy.called);
    });

    it('createContactRequest', function () {
        
        db_interface.insert = function(insert_config, callback){
            mock_callback_spy();
            callback({ _id: insert_config.record.id }); 
        };

        contact_requests_controller.createComment(contact_request_input, function(result){
            callback_spy();
            assert.exists(result._id);
        });
        
        assert(callback_spy.called);
        assert(mock_callback_spy.called);
    });
});