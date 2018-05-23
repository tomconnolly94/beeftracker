//external dependencies
var BSON = require('bson');
var PythonShell = require('python-shell');
var os = require("os");

//internal dependencies
var db_ref = require("../config/db_config.js");

module.exports = {

    findScrapedEventData: function(query_parameters, callback){
        
        var limit = 10;
        
        if(query_parameters.limit) limit = query_parameters.limit;

        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                db.collection(db_ref.get_scraped_events_dump_table()).aggregate([
                    { $lookup: {
                        from: db_ref.get_event_classification_table(),
                        localField: "title",
                        foreignField: "title",
                        as: "classification_obj"
                    }}
                ]).limit(limit).toArray(function(err, docs) {
                    if(err){ console.log(err); }
                    else{
                        if(docs){
                            //console.log(docs)
                            callback( docs );
                        }
                        else{
                            callback({ failed: true, message: "Events not found." });
                        }
                    }
                });   
            }
        });
    },
    
    deleteScrapedEventData: function(id_array, callback){
        
        var id_object_array = [];
        for(var i = 0; i < id_array.length; i++){
            console.log(id_array[i]);
            id_object_array.push(BSON.ObjectID.createFromHexString(id_array[i]))
        }
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                db.collection(db_ref.get_scraped_events_dump_table()).remove({ _id: { $in: id_object_array }}, function(err, docs) {
                    if(err){ console.log(err); }
                    else{
                        callback({});
                    }
                });   
            }
        });
    },
    
    scrapeActor: function(actor_name, callback){
        
        var options = {};
        
        //config options based on current OS
        if(/^win/.test(process.platform)){ //Windows

            options = {
                mode: 'text',
                //pythonPath: 'C:\Users\Tom.DESKTOP-D3OBC42\AppData\Local\Programs\Python\Python36-32\python',
                pythonPath: 'C:/Users/Tom.DESKTOP-D3OBC42/AppData/Local/Programs/Python/Python36/python',
                pythonOptions: ['-u'],
                scriptPath: 'C:/Users/Tom.DESKTOP-D3OBC42/beeftracker/news_scraping_project/beeftracker_scraping',
                args: [search_term]
            };
        }
        else{ //Linux
            var hostname = os.hostname();
            if(hostname == "sam_ub" || hostname == "red-mint"){ //laptop
                options = {
                    mode: 'text',
                    pythonPath: '/usr/bin/python3',
                    pythonOptions: ['-u'],
                    scriptPath: '/home/tom/beeftracker/bf-dev/beeftracker_scraping/',
                    args: [ actor_name ]
                };                
            }
            else{ //heroku server
                options = {
                    mode: 'text',
                    //pythonPath: '/usr/bin/python',
                    pythonOptions: ['-u'],
                    //scriptPath: '/home/tom/beeftracker/news_scraping_project/beeftracker_scraping',
                    scriptPath: '/app/beeftracker_scraping',
                    args: [ actor_name ]
                };
            }
        }

        var pyshell = PythonShell.run('scrape_actor.py', options, function (err, result) {
            if(err){ console.log(err) }
            
            if(!result || !result[0] || result[0] == "404 error\r" || result[0] == "404 error"){
                callback({ failed: true, stage: "actor_scraping", details: "404 error. Wikipedia has no pages on this topic."})
            }
            else{
                callback( result[0] );
            }
        });
    }
}