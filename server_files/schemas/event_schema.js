var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var event_schema = new Schema({
    _id: Schema.ObjectId,
    title: String,
    aggressors: [ Schema.ObjectId ],
    targets: [ Schema.ObjectId ],
    event_date: Date,
    date_added: Date,
    description: String,
    links: { String: String },
    categories: [ Number ],
    hit_count: Number,
    gallery_items: [{
        media_type: String,
        link: String,
        main_graphic: Boolean,
        file: {}
    }],
    thumbnail_img_title: String,
    rating: Number,
    beef_chain_id: Schema.ObjectId,
    data_sources: [ String ],
    contributions: [{
        user: Schema.ObjectId,
        date_of_approval: Date,
        contribution_details:[{
            field: String,
            addition: String,
            removal: String
        }]
    }]
});

module.exports = mongoose.model('Event', event_schema);