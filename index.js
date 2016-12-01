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

app.use('/libraries', express.static(__dirname + '/node_modules/'));

app.use('/javascript', express.static(__dirname + '/public/node_modules/'));

app.get('/', function(request, response) {
  response.render('pages/splash');
});

app.get('/home', function(request, response) {
  response.render('pages/home_page.ejs');
});

app.get('/beef/:tagId', function(request, response) {
    
    console.log(process.env.MONGODB_URL);
    
    var beefIdentifier = request.params.tagId;
    
    MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
        if(err){ console.log(err);}else{
                        
            var field_name = 'beefId';
            
            var qry = "{\"" + field_name + "\":" + beefIdentifier + "}"
                        
            db.collection("event_data").find(JSON.parse(qry)).toArray(function(err, docs) {
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

app.get('/search',function(req,res){
    
    MongoClient.connect(process.env.MONGODB_URL, function(err, db) {
        if(err){ console.log(err);}else{
            
            console.log(req.query.key);
            
            var qry = "{ aggressor : /.*" + req.query.key + ".*/i}";
            
            console.log(qry);
                        
            var result = db.collection("event_data").find(JSON.parse(qry));
                
            console.log(result);
            
                var data=[];
                
                for(i=0;i<result.length;i++){
                    data.push(result[i].first_name);
                }
                
                response.end(data);
        
            db.close();
        }
    }); 
    
});

app.post('/adduser', function(req,res){
        
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});