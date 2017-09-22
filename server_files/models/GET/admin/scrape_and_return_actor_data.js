var PythonShell = require('python-shell');

module.exports = {
    
    execute : function(request, response) {
    
        var options = {};
        var search_term = request.params.actor_name;
        console.log(request.params.actor_name);
        console.log(request.params);
        
        //config options based on current OS
        if(/^win/.test(process.platform)){ //Windows

            options = {
                mode: 'text',
                //pythonPath: 'C:\Users\Tom.DESKTOP-D3OBC42\AppData\Local\Programs\Python\Python36-32\python',
                pythonPath: 'C:/Users/Tom.DESKTOP-D3OBC42/AppData/Local/Programs/Python/Python36-32/python',
                pythonOptions: ['-u'],
                scriptPath: 'C:/Users/Tom.DESKTOP-D3OBC42/beeftracker/news_scraping_project/beeftracker_scraping',
                args: [search_term]
            };
        }
        else{ //Linux
             options = {
                mode: 'text',
                pythonPath: '/usr/bin/python3',
                pythonOptions: ['-u'],
                scriptPath: '/home/tom/beeftracker/news_scraping_project/beeftracker_scraping',
                args: [search_term]
            };
        }

        PythonShell.run('scrape_actor.py', options, function (err, results) {
            if (err) throw err;
            
            var results = JSON.parse(results);
            
            response.send( { results : results } );
        });
    }
}
