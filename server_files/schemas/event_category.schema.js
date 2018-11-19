var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var event_category_schema = new Schema({
    cat_id: Number,
    name: String
});

module.exports = mongoose.model('EventCategory', event_category_schema);