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

app.get('/db', function(request, response) {
  response.render('pages/db');
});

app.get('/beef', function(request, response){
	response.render('pages/beef');
});

/*app.get('/beef/:tagId', function(req, res) {
  res.send("tagId is set to " + req.params.tagId);
});*/

app.get('/beef/:tagId', function(request, response) {
    
    console.log(process.env.MONGODB_URL);
    
    var beefId = request.params.tagId;
    
    MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
        if(err){ console.log(err);}else{
            
            console.log("Connected correctly to server.");
            
            console.log(beefId);
                
            var cursor = db.collection("beef_data").find({beefId : beefId});
            cursor.each(function(err, doc) {
                assert.equal(err, null);
                
                if (doc != null) {
                    response.render('pages/generic_beef.ejs', {name : doc.password});
                } 
                else{
                    response.send("beef not found.")
                }
            });
        
            db.close();
        }
    });
    
    //response.render('pages/mongodb_test.ejs', {name : "hello"});
    
});

app.post('/adduser', function(req,res){
    
    
    
    
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});