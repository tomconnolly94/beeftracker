var readline = require('readline-sync');
var MongoClient = require('mongodb').MongoClient;
var BSON = require('bson');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;

var url = "mongodb://tom:tom@ds141937.mlab.com:41937/heroku_w63fjrg6";

MongoClient.connect(url, function(err, db) {
	if(err){ console.log(err); }
	else{
		db.collection("event_data_v0_3").find({}, {_id:1}).forEach(function(result){

			var type = typeof result._id

			var iddd = String(result._id);

			var object = BSON.ObjectID.createFromHexString(iddd);

			console.log(object);

       			//db.collection("event_data_v0_2").update({ _id : object }, { $set : { date_added : new Date(2017, Math.round(Math.random() * 5), Math.round(Math.random() * 15))  } }, true, true);

            db.collection("event_data_v0_3").update({ "_id" : object }, { $set : { "date_added" : new Date(2017, Math.round(Math.random() * 5), Math.round(Math.random() * 15))  } }, true, true);

		});

	}
});
