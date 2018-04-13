var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var activity_log_schema = new Schema({
    action : String,
    user_id : Schema.ObjectId,
    date_added: Date,
    likes: Number
});

module.exports = mongoose.model('ActivityLog', activity_log_schema);