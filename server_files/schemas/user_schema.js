var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
 
var user_schema   = new Schema({
    email: String,
    password: String,
    token: String
});

module.exports = mongoose.model('User', user_schema);