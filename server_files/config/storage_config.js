//file to hold all configuration needed to access the method of file storage used by the server

//config remote file storage
var cloudinary = require('cloudinary');
var storage_server = null;
var cloud_name = null;
var dns = require('dns');
var storage_servers = {
    CLOUDINARY: "cloudinary",
    LOCAL: "local"
}
var storage_server_url = null;

function check_internet_connection(){
    
    return new Promise(resolve => {
        //check for internet connection
        dns.resolve('www.google.com', function(err) {
            if (err) {
                console.log("No Internet Connection");
                resolve(false);
            } 
            else {
                resolve(true);
            }
        });
    });
    
}

function config_cloudinary(){
    if(process.env.CLOUDINARY_URL){
        //extract config data from ENV URL
        var data = process.env.CLOUDINARY_URL.split("//")[1];
        cloud_name = data.split("@")[1];
        var api_key = data.split(":")[0];
        var api_secret = data.split(":")[1].split("@")[0];
    
        //config cloudinary object
        cloudinary.config({ 
            cloud_name: cloud_name, 
            api_key: api_key, 
            api_secret: api_secret 
        });
        storage_server_url = `https://res.cloudinary.com/${cloud_name}/image/upload/v1514066941`;
    }
}

module.exports = {

    get_upload_method: function(){
        return storage_server;
    },

    get_upload_object: function(){    
        return cloudinary;
    },

    get_event_images_folder: function(){
        return "events";
    },

    get_actor_images_folder: function(){
        return "actors";
    },

    get_user_images_folder: function(){
        return "user_profiles";
    },

    get_update_requests_folder: function(){
        return "update_requests";
    },

    get_storage_server_base_url: async function(resolve){

        //if storage_server_url has been previously set, use that cached version
        if(storage_server_url){
            return storage_server_url;
        }
        storage_server = storage_servers.CLOUDINARY;

        //if local, check for internet connection
        if(process.env.NODE_ENV == "local_dev"){
            storage_server = storage_servers.LOCAL;
            if(check_internet_connection().then((internet_connection_available) => {
                if(internet_connection_available){
                    config_cloudinary();
                    resolve(storage_server_url);
                }
                else{
                    resolve("/");
                }
            }));
        }
        config_cloudinary();
        resolve(storage_server_url);
    }
}