var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contact_request_schema = new Schema({
    name: String,
    email_address: String,
    subject: String,
    message: String
});

module.exports.model = mongoose.model('ContactRequest', contact_request_schema);
module.exports.schema = contact_request_schema;