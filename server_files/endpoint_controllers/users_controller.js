//external dependencies
var jwt = require("jsonwebtoken");
var os = require("os");

//internal dependencies
var db_ref = require("../config/db_config.js");
var hashing = require("../tools/hashing.js");

//cookie config
var cookies_http_only = true;
var cookies_secure = process.env.DEPLOYMENT_ENV == "heroku_production" ? true : false; //use secure cookies when on heroku server, dont use when 
        
module.exports = {
    
    getUserDetails: function(request, response){
        response.status(200).send({message: "ok."})
    },
    
    createUser: function(request, response){
        
        //extract data for use later
        var user_details = JSON.parse(request.body.data); //get form data
        var files = request.files;
        
        //check for duplicate username or email address before allowing user to register
        var check_details_against_user_table = function(db, user_details, insert_object, response, callback){

            db.collection(db_ref.get_user_details_table()).aggregate([{ $match: { $or: [ { username: user_details.username}, { email_address: user_details.email_address } ] } }]).toArray(function(err, auth_arr){

                if(err){ console.log(err); }
                else{

                    if(auth_arr.length > 0){
                        if(auth_arr[0].username == user_details.username){
                            response.status(400).send({success: false, message: "Username is taken."});
                        }
                        else{
                            response.status(400).send({success: false, message: "Email is taken."});
                        }
                    }
                    else{
                        callback();
                    }
                }
            });
        }
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                
                var password_data = hashing.hash_password(user_details.password);
                var ip_address = null;
                //if client provides an ip address, create new jsonwebtoken with it and store as cookie
                if(request.headers['x-forwarded-for']){
                    ip_address = request.headers['x-forwarded-for'];
                }                     
                
                //prepare date of birth
                var birth_date = user_details.d_o_b.split("/");
                
                var insert_object = { 
                    username: user_details.username,
                    first_name: user_details.first_name,
                    last_name: user_details.last_name,
                    email_address: user_details.email_address,
                    hashed_password: password_data.hashed_password, 
                    salt: password_data.salt,
                    d_o_b: new Date(birth_date[2], birth_date[1]-1, birth_date[0]),
                    img_title: user_details.img_title,
                    ip_addresses: ip_address ? [ ip_address ] : [ ],
                    date_created: new Date(),
                    last_seen: new Date(),
                    admin: user_details.admin
                };
                
                if(user_details.admin){ //if admin, check pending registered admin users table, to ensure a user hasnt previously requested admin registration with similar details
                
                    db.collection(db_ref.get_pending_registered_admin_users_table()).aggregate([{ $match: { $or: [ { username: user_details.username}, { email_address: user_details.email_address } ] } }]).toArray(function(err, auth_arr){
                        if(err){ console.log(err); }
                        else{
                            if(auth_arr.length > 0){
                                if(auth_arr[0].username == user_details.username){
                                    response.send({success: false, message: "Username is taken."});
                                }
                                else{
                                    response.send({success: false, message: "Email is taken."});
                                }
                            }
                            else{                                
                                check_details_against_user_table(db, user_details, insert_object, response, function(){
                                    
                                    //insert new user record
                                    db.collection(db_ref.get_pending_registered_admin_users_table()).insert(insert_object, function(err, document){
                                        if(err){ console.log(err); }
                                        else{
                                            response.send({success: true, message: "Registration complete, requires approval from an existing admin."});
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
                else{
                    check_details_against_user_table(db, user_details, insert_object, response, function(){
                        
                        //add extra fields if not an admin user
                        insert_object.viewed_beef_ids = [];
                        insert_object.submitted_beef_ids = [];
                        insert_object.submitted_actor_ids = [];
                        insert_object.country = user_details.country;
                        insert_object.contribution_score = 0;
                        
                        //insert new user record
                        db.collection(db_ref.get_user_details_table()).insert(insert_object, function(err, document){
                            if(err){ console.log(err); }
                            else{
                                response.send({success: true, message: "Registration complete."});
                            }
                        });
                    });
                }
            }
        });        
    },
    
    updateUser: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    deleteUser: function(request, response){
        console.log("test completed 3.");
        console.log(request.body);
        response.send({test: "complete 4"});
    },
    
    authenticateUser: function(request, response){
        //extract data for use later
        var db_url = process.env.MONGODB_URI; //get db uri
        var auth_details = request.body; //get form data

        //store data temporarily until submission is confirmed
        db_ref.get_db_object().connect(db_url, function(err, db) {
            if(err){ console.log(err); }
            else{

                //query to determine whether a 
                db.collection(db_ref.get_user_details_table()).aggregate([{ $match: { username: auth_details.username } }]).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else if(auth_arr.length < 1){                            
                        response.send({auth_success: false, message: "User not found."});
                    }
                    else{

                        var user_details = auth_arr[0];
                        var possible_peppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                        var response_sent = false;

                        //loop through possible peppers to find the appropriate one
                        for(var i = 0; i < possible_peppers.length; i++ ){

                            //compare the hashed password from the db with a fresh hash of the password + possible pepper and provided salt
                            if(user_details.hashed_password == hashing.hash_password(auth_details.password, user_details.salt, possible_peppers[i]).hashed_password){

                                //create exp date
                                var expiry_timestamp = Math.floor(Date.now() + (1000 * 60 * 60));
                                var ip_loc = null;

                                //if client provides an ip address, extract it
                                if(request.headers['x-forwarded-for']){
                                    ip_loc = request.headers['x-forwarded-for'];
                                }

                                //generate an auth token
                                var auth_token = jwt.sign({ exp: expiry_timestamp, username: user_details.username, _id: user_details._id, admin: user_details.admin, ip_loc: ip_loc }, process.env.JWT_SECRET);

                                //set auth token for verification and logged_in token so client javascript knows how to behave
                                response.cookie("auth", auth_token, { expires: new Date(expiry_timestamp), httpOnly: cookies_http_only, secure: cookies_secure });
                                response.cookie("logged_in", "true", { expires: new Date(expiry_timestamp), httpOnly: false });

                                //send response with cookies
                                response.send({ auth_success: true });

                                response_sent = true;
                                break;// ensure loop does not continue
                            }
                        }
                        if(!response_sent){ //if the password hash is not found send a failed auth response
                            response.send({auth_success: false, message: "Incorrect Password."});
                        }
                    }
                });
            }
        });
    },
    
    deauthenticateUser: function(request, response){
        //set all cookies to expire immediately
        response.cookie( "auth", "0", { expires: new Date(0), httpOnly: cookies_http_only, secure: cookies_secure });
        response.cookie( "logged_in", "false", { expires: new Date(0), httpOnly: false });
        response.send({ deauth_success: true});
    },
    
    resetUserPassword: function(request, response){
        
        var email_address = request.body.email_address; //get form data
        
        db_ref.get_db_object().connect(process.env.MONGODB_URI, function(err, db) {
            if(err){ console.log(err); }
            else{
                db.collection(db_ref.get_user_details_table()).find({ email_address: email_address}).toArray(function(err, auth_arr){
                    if(err){ console.log(err); }
                    else{
                        if(auth_arr.length < 1){
                            response.send({success: false, message: "Email address not found."});
                        }
                        else{
                            var existing_user_details = auth_arr[0];
                            
                            //send email with link in it to a page where a user can reset their password
                            
                        }
                    }
                });
            }
        });
    }
}