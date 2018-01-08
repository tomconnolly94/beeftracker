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
        
        //extract data from ENV URL
        var data = process.env.CLOUDINARY_URL.split("//")[0];
        var cloud_name = data.split("@")[1];
        var api_key = data.split(":")[0];
        var api_secret = data.split(":")[1];
        
        console.log(cloud_name)
        console.log(api_key)
        console.log(api_secret)
        
        //config cloudinary object
        //TODO: find some encrypton method for the secret data, plaintext storage is never safe
        cloudinary.config({ 
            cloud_name: cloud_name, 
            api_key: api_key, 
            api_secret: api_secret 
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