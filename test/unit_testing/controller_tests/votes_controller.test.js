//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require('bson');

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
        var db_update_call_count = 0;
        
        db_interface.update = function(update_config, success_callback){
            db_interface_callback_spy();

            //shared test checks
            assert.exists(update_config.table);
            assert.exists(update_config.match_query);
            assert.exists(update_config.update_clause);
            assert.exists(update_config.options);

            //in this specific case, db.update is called twice, once to update the event table db_update_call_count == 0, once to update the user table db_update_call_count == 1
            if(db_update_call_count == 0){
                //table
                assert.equal(db_ref.get_current_event_table(), update_config.table);
                //match_query
                assert.isTrue(globals.compare_objects({ _id: BSON.ObjectID.createFromHexString(globals.dummy_object_id) }, update_config.match_query));
                //update_clause
                assert.exists(update_config.update_clause["$inc"]);
                assert.exists(update_config.update_clause["$inc"]["votes.upvotes"]);
                assert.equal(update_config.update_clause["$inc"]["votes.upvotes"], 1);
            }
            else{
                //table
                assert.equal(db_ref.get_user_details_table(), update_config.table);
                //match_query
                assert.isTrue(globals.compare_objects({ _id: BSON.ObjectID.createFromHexString(globals.dummy_object_id) }, update_config.match_query));
                //update_clause
                assert.exists(update_config.update_clause["$push"]);
                assert.exists(update_config.update_clause["$push"]["voted_on_beef_ids"]);
                assert.equal(update_config.update_clause["$push"]["voted_on_beef_ids"], globals.dummy_object_id);
            }
            db_update_call_count++
            success_callback([ globals.event_example ]);
        };

        votes_controller.addVoteToEvent(globals.dummy_object_id, 1, globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert.equal(db_interface_callback_spy.callCount, 2);
        assert(callback_spy.called);
    });

    it('addVoteToEvent - downvote', function () {
        var db_interface_callback_spy = sinon.spy();
        var db_update_call_count = 0;
        
        db_interface.update = function(update_config, success_callback){
            db_interface_callback_spy();

            //shared test checks
            assert.exists(update_config.table);
            assert.exists(update_config.match_query);
            assert.exists(update_config.update_clause);
            assert.exists(update_config.options);

            //in this specific case, db.update is called twice, once to update the event table db_update_call_count == 0, once to update the user table db_update_call_count == 1
            if(db_update_call_count == 0){
                //table
                assert.equal(db_ref.get_current_event_table(), update_config.table);
                //match_query
                assert.isTrue(globals.compare_objects({ _id: BSON.ObjectID.createFromHexString(globals.dummy_object_id) }, update_config.match_query));
                //update_clause
                assert.exists(update_config.update_clause["$inc"]);
                assert.exists(update_config.update_clause["$inc"]["votes.downvotes"]);
                assert.equal(update_config.update_clause["$inc"]["votes.downvotes"], 1);
            }
            else{
                //table
                assert.equal(db_ref.get_user_details_table(), update_config.table);
                //match_query
                assert.isTrue(globals.compare_objects({ _id: BSON.ObjectID.createFromHexString(globals.dummy_object_id) }, update_config.match_query));
                //update_clause
                assert.exists(update_config.update_clause["$push"]);
                assert.exists(update_config.update_clause["$push"]["voted_on_beef_ids"]);
                assert.equal(update_config.update_clause["$push"]["voted_on_beef_ids"], globals.dummy_object_id);
            }
            db_update_call_count++
            success_callback([ globals.event_example ]);
        };

        votes_controller.addVoteToEvent(globals.dummy_object_id, 0, globals.dummy_object_id, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });
        
        assert(db_interface_callback_spy.called);
        assert.equal(db_interface_callback_spy.callCount, 2);
        assert(callback_spy.called);
    });
});