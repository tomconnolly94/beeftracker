//var readline = require('readline-sync');
var MongoClient = require('mongodb').MongoClient;
var BSON = require('bson');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;
var async = require('async')

var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";

MongoClient.connect(url, function(err, db) {
    if(err){ console.log(err); }
    else{
        
        async.waterfall([
            function(callback){
                db.collection("all_scraped_events_with_classifications").remove({});
                callback(null);
            },
            function(callback){
                db.collection("broken_fields").remove({});
                callback(null);
            },
            function(callback){
                db.collection("scraped_training_events_dump_v0_1").remove({});
                callback(null);
            },
            function(callback){
                db.collection("scraped_url_store").remove({});
                callback(null);
            }
        ], 
        function (error) {
            if (error) { console.log(error); }
            else{
                //process.exit(1);
            }
        });
    }
});