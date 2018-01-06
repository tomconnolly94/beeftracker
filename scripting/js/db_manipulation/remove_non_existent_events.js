var MongoClient = require('mongodb').MongoClient;
var BSON = require('bson');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;

var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";

MongoClient.connect(url, function(err, db) {
    if(err){ console.log(err); }
    else{
        var count = 0;
        
        //standard query to match an event and resolve aggressor and targets references
        db.collection("all_scraped_events_with_classifications").find({ classification: "definite_beef" }).forEach(function(doc) {
                        
            db.collection("event_data_v0_3").find({ title: doc.title }).toArray(function(queryErr, docs) {
                 if(docs.length == 0){
                    db.collection("all_scraped_events_with_classifications").remove({ title: doc.title });
                 }
            });          
        });
    }
});