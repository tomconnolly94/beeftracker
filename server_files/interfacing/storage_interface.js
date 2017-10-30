//file to hold all functions involving the server's interfacing with the file storage system
//config remote file storage
var cloudinary = require('cloudinary');
var storage_ref = require("../storage_config.js");
var dl_request = require("request");
var datauri = require("datauri");
var path = require("path");
var fs = require('fs');

var cloudinary_options = { 
    unique_filename: true, 
    folder: null
};

var upload_to_cloudinary = function(img_url, callback){

    storage_ref.get_upload_object().uploader.upload(img_url, function (result) {
        if(result.error){ console.log(result.error); }

        if(result.public_id){
            callback(result.public_id.split("/")[1]);
        }
        else{
            callback(null);                
        }
    }, cloudinary_options);
};

var download_to_local = function(img_url, file_location, callback){
    dl_request.head(img_url, function(err, res, body){
        dl_request(img_url).pipe(fs.createWriteStream(file_location)).on('close', callback);
    });
};

module.exports = {

    upload_image: function(image_requires_download, destination_folder, img_title, img_buffer, callback){

        cloudinary_options.folder = destination_folder; 
        
        if(image_requires_download){ //if image is provided in post 
            
            var img_url = img_title.split("?")[0];
            if(!img_url.includes("http")){
                img_url = "http:" + img_title;
            }

            //choose storage method
            if(storage_ref.get_upload_method() == "local"){

                //extract filename to create path to local file
                var url_split = img_url.split("/");
                var filename = url_split[url_split.length - 1];
                filename = filename.replace(/%/gi, "");
                var file_location = "public/assets/images/" + destination_folder + "/" + filename;

                //call download function
                download_to_local(img_url, file_location, function(dl_img_title){
                    console.log("image downloaded to server's local file system");
                    callback(dl_img_title);
                });
            }
            else if(storage_ref.get_upload_method() == "cloudinary"){

                upload_to_cloudinary(img_url, function(dl_img_title){
                    console.log("image downloaded to cloudinary");
                    callback(dl_img_title);
                });

            }
        }
        else{
            
            if(storage_ref.get_upload_method() == "cloudinary"){
                //format image path for cloudinary
                var dUri = new datauri();
                
                dUri.format(path.extname(img_title).toString(), img_buffer);
                
                upload_to_cloudinary(dUri.content, function(dl_img_title){
                    console.log("image downloaded to cloudinary");
                    callback(dl_img_title);
                });
            }        
        }
    }
}