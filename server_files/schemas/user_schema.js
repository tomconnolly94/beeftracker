var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
 
var user_schema   = new Schema({
	"username" : String,
	"first_name" : String,
	"last_name" : String,
	"email_address" : String,
	"hashed_password" : String,
	"salt" : String,
	"d_o_b" : Date,
	"img_title" : String,
	"ip_addresses" : [ String ],
	"date_created" : Date,
	"last_seen" : Date,
	"admin" : Boolean,
	"img_title_fullsize" : String,
	"img_title_thumbnail" : String,
	"viewed_beef_ids" : [ Schema.ObjectId ],
	"submitted_beef_ids" : [ Schema.ObjectId ],
	"submitted_actor_ids" : [ Schema.ObjectId ],
	"country" : String,
	"contribution_score" : Number
});

module.exports = mongoose.model('User', user_schema);