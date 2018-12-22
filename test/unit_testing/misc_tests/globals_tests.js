//external dependencies
var proxyquire = require("proxyquire");
var mocha = require('mocha');
var chai = require('chai');
var assert = chai.assert;
var BSON = require("bson");
var sinon = require("sinon");

describe('Module: testing globals', function () {

    var globals, object_1, object_2;

    before(function(){
        globals = require("../testing_globals");
    });

    beforeEach(function () {
        object_1 = {
            field_1_key: "field_1_value",
            field_2_key: 1,
            field_3_key: {
                field_3_object_key_1: 1,
                field_3_object_key_2: "field_3_object_key_2_value",
            },
            field_4_key: [
                2,
                "field_key_4_string value",
                1
            ]
        }

        object_2 = JSON.parse(JSON.stringify(object_1));
    });

    it('compare_object_fields', function () {
        assert.isTrue(globals.compare_object_fields(object_1, object_2));

        object_2.extra_field = "extra_field value";

        assert.isFalse(globals.compare_object_fields(object_1, object_2));
    });

    it('compare_objects - equal', function () {
        assert.isTrue(globals.compare_objects(object_1, object_2));
    });

    it('compare_objects - different string field', function () {

        object_2.field_1_key = "hola senor";

        assert.isFalse(globals.compare_objects(object_1, object_2));
    });

    it('compare_objects - different int field', function () {

        object_2.field_2_key = 2;

        assert.isFalse(globals.compare_objects(object_1, object_2));
    });

    it('compare_objects - differents string field in object field', function () {

        object_2.field_3_key.field_3_object_key_2 = "tag herr";

        assert.isFalse(globals.compare_objects(object_1, object_2));
    });

    it('compare_objects - reversed array field', function () {

        object_2.field_4_key.reverse();

        assert.isTrue(globals.compare_objects(object_1, object_2));
    });
});