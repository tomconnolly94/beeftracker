//file to hold all configuration needed to access the method of file storage used by the server

//config remote file storage
var cloudinary = require('cloudinary');

//extract config data from ENV URL
var data = process.env.CLOUDINARY_URL.split("//")[1];
var cloud_name = data.split("@")[1];
var api_key = data.split(":")[0];
var api_secret = data.split(":")[1].split("@")[0];

//config cloudinary object
cloudinary.config({ 
    cloud_name: cloud_name, 
    api_key: api_key, 
    api_secret: api_secret 
});

//var upload_method = "local";
var upload_method = "cloudinary";
var event_images_folder = "events";
var actor_images_folder = "actors";
        
module.exports = {
    
    get_upload_method: function(){
        return upload_method;
    },
    
    get_upload_object: function(){    
        return cloudinary;
    },
    
    get_event_images_folder: function(){
        return event_images_folder;
    },
    
    get_actor_images_folder: function(){
        return actor_images_folder;
    }
}