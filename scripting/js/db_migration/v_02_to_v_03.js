var readline = require('readline-sync');
var MongoClient = require('mongodb').MongoClient;
var BSON = require('bson');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;

var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";

MongoClient.connect(url, function(err, db) {
    if(err){ console.log(err); }
    else{
        //standard query to match an event and resolve aggressor and targets references
        db.collection("event_data_v0_3").find().forEach(function(doc) {
            
            
            /*if(doc.links.mf_video_link != undefined){
                
                db.collection("event_data_v0_3").update({_id : doc._id}, { $set : { special_feature : {type: "youtube_embed",
                                                                                                       content: doc.links.mf_video_link }
                                                                      }});
                
            }*/
            
            //db.collection("event_data_v0_3").update({_id : doc._id}, { $set : { img_title : doc.links.mf_img_link }
            //                                                          });
                
            
            db.collection("event_data_v0_3").update({_id : doc._id}, { $unset : { "mf_img_link" : 1}}, {multi:true}
                                                                      );
            
            
            console.log(doc);
            
            process.exit(0);
        });
    }
});