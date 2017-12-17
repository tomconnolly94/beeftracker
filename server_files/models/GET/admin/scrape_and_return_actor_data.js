var PythonShell = require('python-shell');
var os = require("os");

module.exports = {
    
    execute : function(request, response) {
    
        var options = {};
        var search_term = request.params.actor_name;
        
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
            if(hostname == "sam_ub"){ //laptop
                options = {
                    mode: 'text',
                    pythonPath: '/usr/bin/python3',
                    pythonOptions: ['-u'],
                    scriptPath: '/home/tom/beeftracker/bf-dev/beeftracker_scraping/',
                    args: [search_term]
                };                
            }
            else{ //heroku server
                options = {
                    mode: 'text',
                    //pythonPath: '/usr/bin/python',
                    pythonOptions: ['-u'],
                    //scriptPath: '/home/tom/beeftracker/news_scraping_project/beeftracker_scraping',
                    scriptPath: '/app/beeftracker_scraping',
                    args: [search_term]
                };
            }
        }

        var pyshell = PythonShell.run('scrape_actor.py', options, function (err, result) {
            if(err){ console.log(err) }
                console.log(result);
            
            if(!result || !result[0] || result[0] == "404 error\r" || result[0] == "404 error"){
                result = [];
                result[0] = JSON.stringify({ error : "404 error. Wikipedia has no pages on this topic."})
            }
                        
            response.send( { result : result[0] } );
        });
    }
}
