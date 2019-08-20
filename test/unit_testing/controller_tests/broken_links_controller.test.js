//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var assert = chai.assert;
var sinon = require("sinon");

//internal dependencies
var globals = require('../testing_globals.js');

describe('Module: broken_links_controller', function () {

    var broken_links_controller, broken_link_example, db_insert_spy, db_interface;

    before(function () {

        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        broken_links_controller = proxyquire("../../../server_files/controllers/broken_links_controller", {
            "../interfaces/db_interface.js": db_interface
        });

        broken_link_example = {
            event_id: globals.dummy_object_id,
            gallery_items: globals.event_example.gallery_items
        }

        db_interface.get = function (query_config, callback) {
            callback([broken_link_example]);
        }

        db_interface.insert = function (insert_config, callback) {
            db_insert_spy();
            callback({
                _id: globals.dummy_object_id,
                event_id: globals.dummy_object_id,
                gallery_items: globals.event_example.gallery_items
            });
        };
    });

    beforeEach(function () {
        db_insert_spy = sinon.spy();
    });

    it('findBrokenLinks', function (done) {

        var expected_results = [broken_link_example];

        broken_links_controller.findBrokenLinks(globals.dummy_object_id, function (results) {
            assert.equal(results.length, expected_results.length)
            globals.compare_objects(results[0], expected_results[0]);
            done();
        });
    });

    it('createBrokenLink', function (done) {

        broken_links_controller.createNewBrokenLink(broken_link_example, function (result) {
            assert.equal(globals.dummy_object_id, result._id);
            //simply testing that what is returned by the db_interface.insert function is returned by the controller function
            assert.equal(globals.event_example.gallery_items, result.gallery_items);

            assert(db_insert_spy.called);
            done();
        });
    });
});