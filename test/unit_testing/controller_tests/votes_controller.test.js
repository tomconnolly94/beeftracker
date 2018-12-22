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

    it('addVoteToEvent', function () {
        /*
        var db_interface_callback_spy = sinon.spy();
        
        db_interface.get = function(query_config, success_callback){
            db_get_callback_spy(); 
            assert.exists(query_config.table);
            assert.equal(db_ref.get_current_event_table(), query_config.table);
            assert.exists(query_config.aggregate_array);
            assert.exists(query_config.aggregate_array[0]["$match"]);
            assert.exists(query_config.aggregate_array[0]["$match"]["_id"]);
            callback([ globals.event_example ]);
        };

        votes_controller.findUser(globals.dummy_object_id, true, function(results){
            callback_spy();
            assert.equal(1, results.length);
        });*/
        
        //assert(db_interface_callback_spy.called);
        //assert(callback_spy.called);

        console.log("Test unimplemented.")
    });
});