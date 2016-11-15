var express = require('express');
var path = require('path');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/splash');
});

app.get('/home', function(request, response) {
  response.render('pages/home_page.ejs');
});

app.get('/beef/:tagId', function(request, response) {
    
    console.log(process.env.MONGODB_URL);
    
    var beefIdentifier = request.params.tagId;
    
    MongoClient.connect("mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6", function(err, db) {
        if(err){ console.log(err);}else{
                        
            var field_name = 'beefId';
            
            var qry = "{\"" + field_name + "\":" + beefIdentifier + "}"
                        
            db.collection("beef_data").find(JSON.parse(qry)).toArray(function(err, docs) {
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

app.post('/adduser', function(req,res){
        
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});