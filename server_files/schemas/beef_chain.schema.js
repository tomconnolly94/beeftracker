var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var beef_chain_schema = new Schema({
    actors : [ Schema.ObjectId ],
    events : [ Schema.ObjectId ]
});

module.exports = mongoose.model('BeefChain', beef_chain_schema);