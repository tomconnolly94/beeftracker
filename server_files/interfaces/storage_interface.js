////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: storage_interface
// Author: Tom Connolly
// Description: 
// Testing script:
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var dl_request = require("request");
var datauri = require("datauri");
var path = require("path");
var fs = require('fs');
var loop = require("async-looper");

//internal dependencies
var storage_ref = require("../config/storage_config.js");

var cloudinary_options = { 
    unique_filename: true, 
    folder: null,/*
    crop: "thumb",
    gravity: "face",
    width: 100, 
    height: 120*/
};

var upload_to_cloudinary = function(img_url, callback){

    storage_ref.get_upload_object().uploader.upload(img_url, function (result) {
        if(result.error){ console.log(result.error); }
        else{
            if(result.public_id){
                callback(result.public_id.split("/")[1]);
            }
            else{
                callback("");                
            }
        }
    }, cloudinary_options);
};

var download_to_local = function(img_url, file_location, callback){
    dl_request.head(img_url, function(err, res, body){
        if(err){ console.log(err); }
        else{
            dl_request(img_url).pipe(fs.createWriteStream(file_location)).on('close', callback);
        }
    });
};

var upload_single_image = function(image_requires_download, destination_folder, img_title, img_buffer, thumbnail, callback){

    cloudinary_options.folder = destination_folder;

    if(thumbnail){ //set image transformations for thumbnail
        cloudinary_options.crop = "thumb";
        cloudinary_options.gravity = "face";
        cloudinary_options.width = 100;
        cloudinary_options.height = 120;
    }
    else{ //set image transformations for non thumbnail
        delete cloudinary_options.crop;
        delete cloudinary_options.gravity;
        delete cloudinary_options.width;
        delete cloudinary_options.height;
    }

    if(image_requires_download){ //if image is provided in post TODO: remove this, it is possible to force cloudinary to download image straight to server

        var img_url = img_title;

        if(img_url.indexOf("fbcdn.net") == -1){
            img_url = img_url.split("?")[0];
        }

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
                callback(dl_img_title);
            });
        }
        else if(storage_ref.get_upload_method() == "cloudinary"){

            upload_to_cloudinary(img_url, function(dl_img_title){
                callback(dl_img_title);
            });
        }
    }
    else{
        if(storage_ref.get_upload_method() == "cloudinary"){
            //format image data for cloudinary
            var dUri = new datauri();
            dUri.format(path.extname(img_title).toString(), img_buffer);

            upload_to_cloudinary(dUri.content, function(dl_img_title){
                callback(dl_img_title);
            });
        }        
    }
};
    
var delete_single_image = function(folder, img_title, callback){
        
    storage_ref.get_upload_object().uploader.destroy(folder + "/" + img_title, function (result) {
        if(result.error){ console.log(result.error); }
        else{
            callback();
        }
    });
};

module.exports = {

    //format gallery items for db storage, also store them in the provided folder on the file server
    upload: function(upload_config, success_callback, failure_callback){
        
        var file_server_folder = upload_config.record_type;
        var item_data = upload_config.item_data;
        var loop_count = 0;
                
        //use an asynchronous loop to cycle through gallery item_data, if item is an image, save image to cloudinary and update gallery item link
        loop(item_data, function(item, next){

            loop_count++;
            
            if(item.media_type == "image"){

                var file_name = item.link;
                var file_buffer;
                var requires_download = true;
                
                if(item.file){
                    file_name = item.file.originalname;
                    file_buffer = item.file.buffer;
                    requires_download = false;
                    
                    upload_single_image(requires_download, file_server_folder, file_name, file_buffer, false, function(img_dl_title){

                        item.link = img_dl_title;

                        /*if(item.main_graphic){
                            upload_single_image(requires_download, file_server_folder, file_name, file_buffer, true, function(img_dl_title){
                                item.thumbnail_img_title = img_dl_title;

                                if(loop_count == item_data.length){
                                    next(null, loop.END_LOOP);
                                }
                                else{
                                    next();
                                }

                            });
                        }
                        else{*/
                            if(loop_count == item_data.length){
                                next(null, loop.END_LOOP);
                            }
                            else{
                                next();
                            }
                        //}
                    });
                }
                else{
                    if(loop_count == item_data.length){
                        next(null, loop.END_LOOP);
                    }
                    else{
                        next();
                    }
                }
            }
            else{
                next();
            }
        }, 
        function(){
            success_callback(item_data);
        });
    },
    
    //format gallery items for db storage, also store them in the provided folder on the file server
    remove: function(remove_config, success_callback, failure_callback){

        var items = remove_config.items;
        var file_server_folder = remove_config.record_type;
                
        var loop_count = 0;
                
        //use an asynchronous loop to cycle through gallery items, if item is an image, save image to cloudinary and update gallery item link
        loop(items, function(item, next){

            if(item.media_type == "image"){
                
                delete_single_image(file_server_folder, item.link, function(){
                    loop_count++;
                    
                    if(loop_count == items.length){
                        next(null, loop.END_LOOP);
                    }
                    else{
                        next();
                    }
                });
            }
        }, function(){
            success_callback(items);
        });
    }
}