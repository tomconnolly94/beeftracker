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
        db.collection("pending_actor_data_v0_2").find().toArray(function(queryErr, docs) {
            
            console.log(docs);
            
            //while(true){
            
                var id = readline.question("Enter the _id youd like to approve:");

                for(var i = 0; i < docs.length; i++){
                    
                    console.log(typeof id);
                    console.log(id);
                    console.log(typeof docs[i]._id);
                    console.log(docs[i]._id);
                        
                    var object = BSON.ObjectID.createFromHexString(id);
                    
                    console.log(typeof docs[i]._id);
                    console.log(docs[i]._id);
                    
                    if(docs[i]._id == id){
                        //add doc to prod collection
                        db.collection("actor_data_v0_2").insert(docs[i]);

                        //remove doc from pending queue
                        var obj_id = {
                            '_id' : id
                        };
                        console.log(obj_id);

                        db.collection("pending_actor_data_v0_2").remove( obj_id , 
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