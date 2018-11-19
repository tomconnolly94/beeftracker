var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var actor_schema = new Schema({
    _id: Schema.ObjectId,
    name: String,
    date_of_origin: Date,
    place_of_origin: String,
    description: String,
    associated_actors: [ Schema.ObjectId ],
    data_sources: [ String ],
    also_known_as: [ String ],
    img_title: String,
    classification: String,
    variable_field_values: {},
    links : [{
        _id : { id: false },
        title : String,
        url : String
    }],
    gallery_items: [{
        _id : { id: false },
        media_type: String,
        link: String,
        file_name: String,
        main_graphic: Boolean,
        file: {}
    }],
    img_title_thumbnail: String,
    img_title_fullsize: String,
    date_added: Date,
    name_lower: String,
    also_known_as_lower: [ String ],
    record_origin: String
});

module.exports = mongoose.model('Actor', actor_schema);