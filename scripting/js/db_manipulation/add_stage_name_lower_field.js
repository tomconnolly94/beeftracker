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
        db.collection("scraped_url_store").find({}).forEach(function(doc) {
            
            
            /*if(!doc.nicknames){console.log(doc)}
            var nicknames = doc.nicknames;
            var new_nicknames = [];
            
            for(var i = 0; i < nicknames.length; i++){
                new_nicknames.push(nicknames[i].toLowerCase());
            }
            */
            db.collection("scraped_url_store").update({ _id: doc._id }, { $unset: { event_date: "" } });            
        });
    }
});