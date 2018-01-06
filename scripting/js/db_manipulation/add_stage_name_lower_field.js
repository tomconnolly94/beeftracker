//var readline = require('readline-sync');
var MongoClient = require('mongodb').MongoClient;
var BSON = require('bson');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;


var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";

MongoClient.connect(url, function(err, db) {
    if(err){ console.log(err); }
    else{
        //standard query to match an event and resolve aggressor and targets references
        db.collection("all_scraped_events_with_classifications").find({}).forEach(function(doc) {
            
            db.collection("all_scraped_events_with_classifications").update({ _id: doc._id }, { $set: { date_added: new Date() } }, { upsert: true });            
        });
    }
});