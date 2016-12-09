var express = require('express');
var path = require('path');
var app = express();
var MongoClient = require('mongodb').MongoClient;

app.set('port', (process.env.PORT || 5000));
// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// ### Reference Routes ### 

//route to reference images
app.use('/artist_images', express.static(__dirname + '/public/assets/images/artists/'));
//route to reference libraries like angular
app.use('/libraries', express.static(__dirname + '/node_modules/'));
//route to reference controller scripts
app.use('/controllers', express.static(__dirname + '/controllers/'));
//route to reference css scripts
app.use('/stylesheets', express.static(__dirname + '/public/stylesheets/'))

app.get('/', function(request, response) {
  response.render('pages/splash');
});

app.get('/home', function(request, response) {
  response.render('pages/home_page.ejs');
});

app.get('/beef', function(request, response) {
  response.render('pages/beef_client_version.ejs');
});

app.get('/beef_timeline', function(request, response) {
  response.render('pages/beef_timeline.ejs');
});

app.get('/beef_information', function(request, response) {
  response.render('pages/beef_information.ejs');
});

app.get('/results', function(request, response) {
  response.render('pages/search_results.ejs');
});

app.get('/artist', function(request, response) {
  response.render('pages/artist.ejs');
});

app.get('/search/:tagId', function(request, response) {
   console.log(process.env.MONGODB_URL);

    var identifier = request.params.tagId;

    MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
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

app.get('/beef/:tagId', function(request, response) {
   response.render('pages/beef_blended.ejs');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});