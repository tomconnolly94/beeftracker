////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: votes_controller
// Author: Tom Connolly
// Description: Module to handle updating event and user objects when a user votes up or down on an 
// event
// Testing script: test/unit_testing/controller_tests/votes_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require('bson');

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");
var logger = require("../tools/logging");

function add_vote_to_user_record(db, event_id, user_id) {

    var update_config = {
        table: db_ref.get_user_details_table(),
        existing_object_id: user_id,
        update_clause: {
            $push: {
                voted_on_beef_ids: event_id
            }
        },
        options: {}
    };

    db_interface.update(update_config, function (result) {
            logger.submit_log(logger.LOG_TYPE.SUCCESS, "votes_controller", "Updated field 'voted_on_beef_ids' for user: " + user_id + " event: " + event_id);
        },
        function (error_object) {
            logger.submit_log(logger.LOG_TYPE.ERROR, "votes_controller", "Attempt to update 'voted_on_beef_ids' field, to add " + event_id + " for user: " + user_id + " failed.");
        });
}

//objects
module.exports = {

    addVoteToEvent: function (event_id, vote_direction, user_id, callback) {

        var update_clause = {};

        if (vote_direction == 1) {
            update_clause = {
                $inc: {
                    "votes.upvotes": 1
                }
            }
        } else if (vote_direction == 0) {
            update_clause = {
                $inc: {
                    "votes.downvotes": 1
                }
            }
        } else {
            callback({
                failed: true,
                message: "vote_direction is invalid."
            })
        }

        var update_config = {
            table: db_ref.get_current_event_table(),
            existing_object_id: event_id,
            update_clause: update_clause,
            options: {}
        };

        db_interface.update(update_config, function (result) {

                callback(result);

                if (user_id) {
                    add_vote_to_user_record(event_id, user_id);
                }
            },
            function (error_object) {
                callback(error_object);
            });
    }
}