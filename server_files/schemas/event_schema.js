var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ContributionSchema = require("./event_contribution.schema").schema;

var event_schema = new Schema({
    _id: Schema.ObjectId,
    title: String,
    aggressors: [ Schema.ObjectId ],
    targets: [ Schema.ObjectId ],
    event_date: Date,
    date_added: Date,
    description: String,
    links : [{
        _id : { id: false },
        title : String,
        url : String
    }],
    categories: [ Number ],
    hit_count: {
        total: Number, 
        last_day: Number,
        last_two_days: Number,
        last_week: Number
    },
    gallery_items: [{
        _id : { id: false },
        media_type: String,
        link: String,
        main_graphic: Boolean,
        file: {},
        cover_image: Boolean
    }],
    cover_image: String,
    rating: Number,
    beef_chain_ids: [ Schema.ObjectId ],
    data_sources: [ String ],
    contributions: [ ContributionSchema ],
    featured: Boolean,
    tags: [ String ],
    user: Schema.ObjectId
});

module.exports = mongoose.model('Event', event_schema);