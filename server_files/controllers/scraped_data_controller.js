////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: scraped_data_controller
// Author: Tom Connolly
// Description: Module to handle activity regarding scraping data from existing resources on the 
// internet. Allows accessing and deletion of pre-scraped events alongside triggering the real-time
// scraping of actor data from wikipedia
// Testing script: test/unit_testing/controller_tests/scraped_data_controller.test.js
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var BSON = require('bson');
var PythonShell = require('python-shell');
var os = require("os");

//internal dependencies
var db_ref = require("../config/db_config.js");
var db_interface = require("../interfaces/db_interface.js");

module.exports = {

    findScrapedEventData: function(query_parameters, callback){
        
        var limit = 10;
        var sort_field = { date_added: -1 };

        if(query_parameters.limit) limit = query_parameters.limit;
        if(query_parameters.sort_field) {
            sort_field = {};
            sort_field[query_parameters.sort_field] = -1;
        }

        var query_config = {
            table: db_ref.get_scraped_events_dump_table(),
            aggregate_array: [
                { $lookup: {
                    from: db_ref.get_event_classification_table(),
                    localField: "title",
                    foreignField: "title",
                    as: "classification_obj"
                }},
                { $sort: sort_field },
                { $limit: limit }
            ]
        };

        db_interface.get(query_config, function(results){
            callback(results);
        },
        function(error_object){
            callback(error_object);
        });
    },
    
    deleteScrapedEventData: function(id_array, callback){
        
        var id_object_array = [];
        for(var i = 0; i < id_array.length; i++){
            id_object_array.push(BSON.ObjectID.createFromHexString(id_array[i]))
        }

        var delete_config = {
            table: db_ref.get_scraped_events_dump_table(),
            delete_multiple_records: true,
            match_query: { _id: { $in: id_object_array } }
        };

        db_interface.delete(delete_config, function(results){
            callback({});
        },
        function(error_object){
            callback(error_object);
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

        PythonShell.run('scrape_actor.py', options, function (err, result) {
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