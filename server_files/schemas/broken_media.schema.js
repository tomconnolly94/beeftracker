var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GalleryItem = require('./gallery_item.schema').schema;

var broken_media_schema = new Schema({
    _id: Schema.ObjectId,
    event_id: Schema.ObjectId,
    gallery_items: [ GalleryItem ],
});

module.exports = mongoose.model('BrokenMedia', broken_media_schema);