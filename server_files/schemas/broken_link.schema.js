var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var broken_link_schema = new Schema({
    _id: Schema.ObjectId,
    gallery_items: [{
        media_type: String,
        link: String,
        file_name: String,
    }],
});

module.exports = mongoose.model('BrokenLink', broken_link_schema);