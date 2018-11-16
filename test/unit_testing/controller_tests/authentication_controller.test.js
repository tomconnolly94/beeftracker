//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");
var globals = require("../globals.js")

describe('Module: authentication_controller', function () {

    var authentication_controller, db_interface, cookie_spy, response, callback_spy;

    before(function(){
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        hashing = require("../module_mocking/hashing.mock.js");
        authentication_controller = proxyquire("../../../server_files/controllers/authentication_controller", { "../interfaces/db_interface.js": db_interface, "../tools/hashing.js": hashing });
    });
    
    beforeEach(function () {
        cookie_spy = sinon.spy();
        response = { cookie: cookie_spy };
        callback_spy = sinon.spy();
    });

    it('authenticateUser', function () {
        
        var db_get_callback_spy = sinon.spy();

        db_interface.get = function(query_config, callback){

            var return_object = [{
                username: "username",
                hashed_password: "hashed_password",
                salt: "salt"
            }];

            db_get_callback_spy();
            callback(return_object); 
        };

        var headers = {
            "x-forwarded-for": "192.168.0.1"
        }

        var auth_details = {
            _id: globals.dummy_object_id,
            username: "username",
            admin: true,
            password: "password"
        }

        authentication_controller.authenticateUser(auth_details, headers, response, function(result){
            assert(result, {});
            callback_spy();
        });
        
        assert.equal(cookie_spy.callCount, 2);
        assert(callback_spy.called);
    });

    it('deauthenticateUser', function () {
        
        authentication_controller.deauthenticateUser(response, callback_spy);
        
        assert.equal(cookie_spy.callCount, 2);
        assert(callback_spy.called);
    });
});