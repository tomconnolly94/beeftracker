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
    variable_field_values: [ String ],	
    links : [
        {
            link_name : String,
            link : String
        }
    ],
    date_added: Date,
    name_lower: String,
    also_known_as_lower: [ String ]
});

module.exports = mongoose.model('Actor', actor_schema);