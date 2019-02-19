//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");

//internal dependencies
var globals = require('../testing_globals.js');

//objects
var Comment = require('../../../server_files/schemas/comment.schema');


describe('Module: comments_controller', function () {

    var comments_controller, db_interface, comment_example, callback_spy;

    before(function(){
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        comments_controller = proxyquire("../../../server_files/controllers/comments_controller", { "../interfaces/db_interface.js": db_interface });

        comment_input = {
            text: "comment text",
            user: { id: globals.dummy_object_id },
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
    });

    it('createComment', function () {

        var mock_callback_spy = sinon.spy();
        
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

    it('findCommentsFromEvent', function () {

        var mock_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, callback){
            mock_callback_spy();
            callback([ comment_example ]); 
        };

        comments_controller.findCommentsFromEvent(globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(results.length, 1);
            assert.equal(comment_example, results[0]);
        });
        
        assert(callback_spy.called);
        assert(mock_callback_spy.called);
    });

    it('findCommentsFromBeefChain', function () {

        var mock_callback_spy = sinon.spy();

        db_interface.get = function(query_config, callback){
            mock_callback_spy();
            callback([ comment_example ]); 
        };

        comments_controller.findCommentsFromBeefChain(globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(results.length, 1);
            assert.equal(comment_example, results[0]);
        });
        
        assert(callback_spy.called);
        assert(mock_callback_spy.called);
    });

    it('findCommentsFromActor', function () {

        var mock_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, callback){
            mock_callback_spy();
            callback([ comment_example ]); 
        };

        comments_controller.findCommentsFromActor(globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(results.length, 1);
            assert.equal(comment_example, results[0]);
        });
        
        assert(callback_spy.called);
        assert(mock_callback_spy.called);
    });

    it('deleteComment', function () {

        var mock_callback_spy = sinon.spy();
        
        db_interface.delete = function(delete_config, success_callback, failure_callback){
            mock_callback_spy();
            success_callback(comment_example); 
        };

        comments_controller.deleteComment(globals.dummy_object_id, function(result){
            callback_spy();
            assert.equal(comment_example, result);
        });
        
        assert(callback_spy.called);
        assert(mock_callback_spy.called);
    });
});