var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var comment_schema = new Schema({
	text : String,
	user_id : Schema.ObjectId,
	event_id : Schema.ObjectId,
	actor_id : Schema.ObjectId, //either actor_id or event_id  should be null
	beef_chain_id : Schema.ObjectId, //either actor_id or event_id  should be null
	date_added: Date,
	likes: Number
});

module.exports = mongoose.model('Comment', comment_schema);