//file to hold all configuration needed to access the method of file storage used by the server

//config remote file storage
var cloudinary = require('cloudinary');

//var upload_method = "local";
var upload_method = "cloudinary";
var event_images_folder = "events";
var actor_images_folder = "actors";
        
module.exports = {
    
    get_upload_method: function(){
        return upload_method;
    },
    
    //create database reference object
    get_upload_object: function(){
            
        //config cloudinary object
        //TODO: find some encrypton method for the secret data, plaintext storage is never safe
        cloudinary.config({ 
            cloud_name: 'hghz4zts3', 
            api_key: '871942984534813', 
            api_secret: 'viCT1gIlPtcy4273Zy_nBiJ166M' 
        });
        
        return cloudinary;
    },
    
    get_event_images_folder: function(){
        return event_images_folder;
    },
    
    get_actor_images_folder: function(){
        return actor_images_folder;
    }
}