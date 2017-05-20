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
        db.collection("pending_event_data_v0_2").find().toArray(function(queryErr, docs) {
            
            
            //while(true){
            
                var id = readline.question("Enter the _id youd like to approve:");

                for(var i = 0; i < docs.length; i++){
                    
                        
                    var object = BSON.ObjectID.createFromHexString(id);
                    
                    if(docs[i]._id == id){
                        //add doc to prod collection
                        db.collection("event_data_v0_2").insert(docs[i]);

                        //remove doc from pending queue
                        var obj_id = {
                            '_id' : id
                        };

                        db.collection("pending_event_data_v0_2").remove( obj_id , 
                                                                        function (err, result){
                                                                            if(err){
                                                                                console.log(err);
                                                                            }else{
                                                                                console.log(result.result);
                                                                            }
                                                                          });
                    }
                }
            //}
        });
    }
});