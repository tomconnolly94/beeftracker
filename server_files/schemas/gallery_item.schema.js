var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gallery_item_schema = new Schema({
    media_type: String,
    link: String,
    file_name: String,
    main_graphic: Boolean,
    cover_image: Boolean,
    file: {}
});

module.exports.schema = gallery_item_schema;
module.exports.model = mongoose.model('GalleryItem', gallery_item_schema);