var express = require('express');
var path = require('path');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var form = require("express-form")
var field = form.field;
// Put this statement near the top of your module
var bodyParser = require('body-parser');
// Put these statements before you define any routes.
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use('/libraries', express.static(__dirname + '/node_modules/'));

app.use('/javascript', express.static(__dirname + '/public/node_modules/'));

app.get('/', function(request, response) {
  response.render('pages/splash');
});

app.get('/home', function(request, response) {
  response.render('pages/home_page.ejs');
});

app.get('/beef', function(request, response) {
  response.render('pages/beef_client_version.ejs');
});

app.get('/results', function(request, response) {
  response.render('pages/search_results.ejs');
});

app.get('/beef/:tagId', function(request, response) {
    
    console.log(process.env.MONGODB_URL);
    
    var beefIdentifier = request.params.tagId;
    
    MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
        if(err){ console.log(err); }
        else{
                        
            var field_name = 'beefId';
            
            var qry = "{\"" + field_name + "\":" + beefIdentifier + "}";
            
            console.log(qry);
                        
            db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                console.log("########");
                console.log(beefIdentifier);
                console.log(docs.length);
                console.log(docs[0]);
                response.render('pages/beef_server_version.ejs', {beefObject : docs[0]});
                db.close()
            });
        
            db.close();
        }
    });    
});
    
app.post('/gen_search', form(field("search_ref")), function(req, res){
    if (!req.form.isValid) { console.log(req.form.errors); } //print error to console
    else {
        //connecto to DB
        MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
            if(err){ console.log(err); } //print error to console
            else{ 

                var field_name = 'aggressor';
                var identifier = req.body.search_ref; 
                console.log(identifier);

                //var qry = "{ \"" + field_name + "\" : \" + identifier + "\" }";
                
                //var end = new RegExp('^'+identifier+'$', "i");
                var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
                
                var qry = "{ \"" + field_name + "\" : " + end + " }";
                
                
                console.log(qry);

                db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                    
                    res.render('pages/search_results.ejs', {beefObject : docs});
                    
                });

                db.close();
            }
        }); 
    }
});

app.post('/adduser', function(req,res){
        
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});