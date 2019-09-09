//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var assert = chai.assert;
var sinon = require("sinon");

//internal dependencies
var globals = require('../testing_globals.js');

describe('Module: broken_links_controller', function () {

    var broken_links_controller, broken_link_example, db_insert_spy, db_delete_spy, db_interface, db_match_query;

    before(function () {

        //db_interface stub
        db_interface = require("../module_mocking/db_interface.mock.js");
        broken_links_controller = proxyquire("../../../server_files/controllers/broken_links_controller", {
            "../interfaces/db_interface.js": db_interface
        });

        db_match_query = { $match: { name: "steve" } };

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

        db_interface.delete = function (delete_config, callback) {
            db_delete_spy();
            callback({});
        };
    });

    beforeEach(function () {
        db_insert_spy = sinon.spy();
        db_delete_spy = sinon.spy();
    });

    it('findBrokenLinks', function (done) {

        db_interface.get = function (query_config, callback) {
            assert.equal(db_match_query, query_config.aggregate_array[0]);
            callback([broken_link_example]);
        }

        var expected_results = [ broken_link_example ];

        broken_links_controller.findBrokenLinks(db_match_query, function (results) {
            assert.equal(results.length, expected_results.length)
            globals.compare_objects(results[0], expected_results[0]);
            done();
        });
    });

    it('findBrokenLink', function (done) {


        db_interface.get = function (query_config, callback) {
            assert.equal(globals.dummy_object_id, query_config.aggregate_array[0]["$match"]._id);
            callback([broken_link_example]);
        }

        var expected_results = broken_link_example;

        broken_links_controller.findBrokenLink(globals.dummy_object_id, function (result) {
            globals.compare_objects(result, expected_results);
            done();
        });
    });

    it('createBrokenLink', function (done) {

        broken_links_controller.createBrokenLink(broken_link_example, function (result) {
            assert.equal(globals.dummy_object_id, result._id);
            //simply testing that what is returned by the db_interface.insert function is returned by the controller function
            assert.equal(globals.event_example.gallery_items, result.gallery_items);

            assert(db_insert_spy.called);
            done();
        });
    });

    it('deleteBrokenLink', function (done) {

        broken_links_controller.deleteBrokenLink(globals.dummy_object_id, function (result) {
            assert.equal(result, result);

            assert(db_delete_spy.called);
            done();
        });
    });
});