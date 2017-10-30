//file to hold all functions involving the server's interfacing with the database
var db_ref = require("../db_config.js");
var nodemailer = require('nodemailer');


const db_url = process.env.MONGODB_URI; //get db uri

module.exports = {
       
    insert_record_into_db: function(insert_object, table, options, callback){
        
        console.log("insert function called.")
        
        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{
                //standard query to insert into live events table
                db.collection(table).insert(insert_object, function(err, document){

                    if(document != null && document.ops != null){

                        //add _id field so object can be found later
                        insert_object._id = document.ops[0]._id;

                        var events_confirm_obj = {
                            event_id: insert_object._id,
                            title: insert_object.title
                        }

                        if(options.send_email_notification){

                            //parse json directly to string with indents
                            var text = JSON.stringify(insert_object, null, 2);

                            var transporter = nodemailer.createTransport({
                                service: 'Gmail',
                                auth: {
                                    user: 'beeftracker@gmail.com', // Your email id
                                    pass: 'UoNYtG4gDsabqtpMtx7tryQWKi8Nlm49HXKn3YqqDslZKb6AbAcTy57k/ZGfTSY0' // Your password
                                }
                            });

                            //config mail options
                            var mailOptions = {
                                from: 'bf_sys@gmail.com', // sender address
                                to: 'beeftracker@gmail.com', // list of receivers
                                subject: "New " + options.email_notification_text + " Submission", // Subject line
                                text: text //, // plaintext body
                                // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
                            };

                            //send email notifying beeftracker account new submisson
                            transporter.sendMail(mailOptions, function(error, info){
                                if(error){ console.log(error); }
                            });
                        }
                        
                        if(options.add_to_scraped_confirmed_table){
                            db.collection(db_ref.get_scraped_events_confirmed_table()).insert(events_confirm_obj, function(err, document){
                                response.send();
                            });
                        }
                    }

                });
            }
        });        
    }
}