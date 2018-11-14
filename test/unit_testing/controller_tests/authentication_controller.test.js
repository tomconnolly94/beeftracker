//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var BSON = require("bson");

describe('Module: authentication_controller', function () {

    var authentication_controller, db_interface, expected_resultscookie_spy, response, callback_spy;

    before(function(){
        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        authentication_controller = proxyquire("../../../server_files/controllers/authentication_controller", { "../interfaces/db_interface.js": db_interface });
    });
    
    beforeEach(function () {

        cookie_spy = sinon.spy();
        response = { cookie: cookie_spy };
        callback_spy = sinon.spy();
    });

    it('authenticateUser', function () {
        
        db_interface.get = function(query_config, callback){

            var return_object = [{
                username: "username",
                hashed_password: "hashed_password",
                salt: "salt"
            }];

            callback(return_object); 
        }

        authentication_controller.authenticateUser({}, response, callback_spy);
        
        assert(cookie_spy.called);
        assert(callback_spy.called);
    });

    it('deauthenticateUser', function () {
        
        authentication_controller.deauthenticateUser({}, response, callback_spy);
        
        assert(cookie_spy.callCount, 2);
        assert(callback_spy.called);
    });
});