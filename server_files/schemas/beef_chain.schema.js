var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var beef_chain_schema = new Schema({
    actors : [ Schema.ObjectId ],
    event_ids : [ Schema.ObjectId ]
});

module.exports = mongoose.model('BeefChain', beef_chain_schema);