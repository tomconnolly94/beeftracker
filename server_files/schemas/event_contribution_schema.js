var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var event_contribution_schema = new Schema({
    user: Schema.ObjectId,
    date_of_submission: Date,
    date_of_approval: Date,
    approving_admin_user_id: Schema.ObjectId,
    contribution_details:[{
        field: String,
        addition: String,
        removal: String
    }]
});

module.exports.model = mongoose.model('EventContribution', event_contribution_schema);
module.exports.schema = event_contribution_schema;