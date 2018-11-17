//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");

//objects
var Comment = require('../../../server_files/schemas/comment_schema');
var globals = require('../globals.js');


describe('Module: contact_requests_controller', function () {

    var comments_controller, db_interface, comment_example, callback_spy, mock_callback_spy;

    before(function(){
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        comments_controller = proxyquire("../../../server_files/controllers/comments_controller", { "../interfaces/db_interface.js": db_interface });

        comment_input = {
            text: "comment text",
            user: globals.dummy_object_id,
            event_id: globals.dummy_object_id
        };

        comment_example = new Comment({
            text: "comment text",
            user: globals.dummy_object_id,
            event_id: globals.dummy_object_id,
            actor_id: null,
            beef_chain_id: null,
            date_added: new Date(),
            likes: 0
        });
    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
        mock_callback_spy = sinon.spy();
    });

    it('findContactRequests', function () {
        
        db_interface.insert = function(insert_config, callback){
            mock_callback_spy();
            callback({ _id: insert_config.record.id }); 
        };

        comments_controller.createComment(comment_input, function(result){
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

        comments_controller.createComment(comment_input, function(result){
            callback_spy();
            assert.exists(result._id);
        });
        
        assert(callback_spy.called);
        assert(mock_callback_spy.called);
    });
});