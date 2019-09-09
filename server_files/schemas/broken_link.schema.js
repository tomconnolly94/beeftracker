var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GalleryItem = require('./gallery_item.schema').schema;

console.log( typeof GalleryItem);

var broken_link_schema = new Schema({
    _id: Schema.ObjectId,
    event_id: Schema.ObjectId,
    gallery_items: [ GalleryItem ],
});

module.exports = mongoose.model('BrokenLink', broken_link_schema);