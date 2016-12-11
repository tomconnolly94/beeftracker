// ### Create all the modules that are needed to run this server ###
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var app = express();
var MongoClient = require('mongodb').MongoClient;

// ### Configure node variables ###
app.set('port', (process.env.PORT || 5000));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());

// ### Directory routes ### 
app.use('/artist_images', express.static(__dirname + '/public/assets/images/artists/')); //route to reference images
app.use('/libraries', express.static(__dirname + '/libs/')); //route to reference libraries like angular
app.use('/modules', express.static(__dirname + '/node_modules/')); //route to reference libraries like angular
app.use('/controllers', express.static(__dirname + '/controllers/')); //route to reference controller scripts
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets/')); //route to reference css scripts
app.use('/bower_components', express.static(__dirname + '/bower_components/')); //route to reference css scripts

// ### Permanent page routes ###
app.get('/', function(request, response) { response.render('pages/home_page.ejs'); });
app.get('/beef/:tagId', function(request, response) { response.render('pages/beef_blended.ejs'); });
app.get('/artist/:tagId', function(request, response) { response.render('pages/artist.ejs'); });

// ### Temporary development pages ###
app.get('/beef', function(request, response) { response.render('pages/beef_client_version.ejs'); });
app.get('/beef_timeline', function(request, response) { response.render('pages/beef_timeline.ejs'); });
app.get('/beef_information', function(request, response) { response.render('pages/beef_information.ejs'); });
app.get('/results', function(request, response) { response.render('pages/search_results.ejs'); });

// ### Search functions ###
app.get('/search/:tagId', function(request, response) { 
   console.log(process.env.MONGODB_URL);

    var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";
    var identifier = request.params.tagId;

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'event_id';
            
            /*
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";*/
            
            var qry = "{ \"" + field_name + "\" : \"" + identifier + "\" }";
            
            console.log(qry);
            
            db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                console.log("");
                console.log("query: " + identifier);
                console.log("response: " + docs.length);
                response.send({eventObject : docs[0]});
                db.close()
            });

            db.close();
        }
    });
});
app.get('/search_all/:search_term', function(request, response){
    
    var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";
    var identifier = request.params.search_term;
    
    console.log(identifier);

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'to_string';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            console.log(qry);
            
            db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                console.log("");
                console.log("query: " + identifier);
                console.log("response: " + docs.length);
                response.send( { events : docs } );
                db.close()
            });

            db.close();
        }
    });
    
});
app.get('/search_artist/:artist_id', function(request, response){
    
    var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";
    var identifier = request.params.artist_id;
    
    console.log(identifier);

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'artist_id';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            console.log(qry);
            
            db.collection("artist_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                console.log("");
                console.log("query: " + identifier);
                console.log("response: " + docs.length);
                response.send( { events : docs[0] } );
                db.close()
            });

            db.close();
        }
    });
    
});
app.get('/search_events_from_artist/:artist_name', function(request, response){
    
    var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";
    var identifier = request.params.artist_name;
    
    console.log(identifier);

    MongoClient.connect(url, function(err, db) {
        if(err){ console.log(err); }
        else{
            var field_name = 'aggressor';
            
            //code to create a qry string that matches NEAR to query string
            var end = "{ \"$regex\": \"" + identifier + "\", \"$options\": \"i\" }";
            var qry = "{ \"" + field_name + "\" : " + end + " }";
            
            console.log(qry);
            
            db.collection("event_data").find(JSON.parse(qry)).toArray(function(queryErr, docs) {
                console.log("");
                console.log("query: " + identifier);
                console.log("response: " + docs.length);
                response.send( { events : docs } );
                db.close()
            });

            db.close();
        }
    });
    
});



//pages that are not in the current release design but may be in the next
//app.get('/', function(request, response) { response.render('pages/splash'); });

// ## Launch application ###
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});