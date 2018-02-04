var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ContributionSchema = require("./event_contribution_schema").schema;

var event_schema = new Schema({
    _id: Schema.ObjectId,
    title: String,
    aggressors: [ Schema.ObjectId ],
    targets: [ Schema.ObjectId ],
    event_date: Date,
    date_added: Date,
    description: String,
    links: { },
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
    beef_chain_ids: [ Schema.ObjectId ],
    data_sources: [ String ],
    contributions: [ ContributionSchema ]
});

module.exports = mongoose.model('Event', event_schema);