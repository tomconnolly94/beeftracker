//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;

//internal dependencies
var db_ref = require("../../../server_files/config/db_config");
var globals = require('../testing_globals.js');

describe('Module: votes_controller', function () {

    var votes_controller, db_interface, callback_spy;

    before(function(){
        
        //set timeout
        this.timeout(7000);
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        votes_controller = proxyquire("../../../server_files/controllers/votes_controller", { "../interfaces/db_interface.js": db_interface });

    });
    
    beforeEach(function () {
        callback_spy = sinon.spy();
    });

    it('addVoteToEvent - upvote', function () {
        var db_interface_callback_spy = sinon.spy();
        
        db_interface.update = function(update_config, success_callback){
            db_interface_callback_spy();
            //table
            assert.exists(update_config.table);
            var table = db_ref.get_current_event_table();
            assert.equal(table, update_config.table);
            //existing_object_id
            assert.exists(update_config.existing_object_id);
            assert.equal(globals.dummy_object_id, update_config.existing_object_id);
            //update_clause
            assert.exists(update_config.update_clause);
            assert.exists(update_config.update_clause["$inc"]);
            assert.exists(update_config.update_clause["$inc"]["votes.upvotes"]);
            assert.equal(update_config.update_clause["$inc"]["votes.upvotes"], 1);
            assert.exists(update_config.options);
            success_callback([ globals.event_example ]);
        };

        votes_controller.addVoteToEvent(globals.dummy_object_id, 1, globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });

    it('addVoteToEvent - downvote', function () {
        var db_interface_callback_spy = sinon.spy();
        
        db_interface.update = function(update_config, success_callback){
            db_interface_callback_spy();
            //table
            assert.exists(update_config.table);
            assert.equal(db_ref.get_current_event_table(), update_config.table);
            //existing_object_id
            assert.exists(update_config.existing_object_id);
            assert.equal(globals.dummy_object_id, update_config.existing_object_id);
            //update_clause
            assert.exists(update_config.update_clause);
            assert.exists(update_config.update_clause["$inc"]);
            assert.exists(update_config.update_clause["$inc"]["votes.downvotes"]);
            assert.equal(update_config.update_clause["$inc"]["votes.downvotes"], 1);
            assert.exists(update_config.options);
            success_callback([ globals.event_example ]);
        };

        votes_controller.addVoteToEvent(globals.dummy_object_id, 1, globals.dummy_object_id, true, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert(callback_spy.called);
    });
});