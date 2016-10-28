var express = require('express');
var path = require('path');
var app = express();
var client;

var client = require('redis').createClient(process.env.REDIS_URL);
client.on('connect', function() {
    console.log('connected.');
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/db', function(request, response) {
  response.render('pages/db');
});

app.get('/redis', function(request, response) {
    
    client.hmset('frameworks', 'javascript', 'AngularJS', 'css', 'Bootstrap', 'node', 'Express');

    client.hgetall('frameworks', function(err, object) {
        console.log(object);
        response.render('pages/redis_test.ejs', {name : object} );
    });
    
    
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});