var loop = require("async-looper");
var storage_interface = require('../../interfaces/storage_insert_interface.js');

module.exports ={
 
    //format gallery items for db storage, also store them in the provided folder on the file server
    handle_gallery_items: function(items, file_server_folder, files, callback){
        
        //loop through gallery items and format them for storage
        for(var i = 0; i < items.length; i++){

            var gallery_item = items[i];

            /* 
            gallery_item.media_type == "video_embed" || 
            gallery_item.media_type == "wikipedia_link" || 
            gallery_item.media_type == "website_link" || 
            gallery_item.media_type == "twitter_embed" || 
            gallery_item.media_type == "soundcloud_embed" 
                no pre-storage formatting is needed
            */

            if(gallery_item.media_type == "image"){

                for(var j = 0; j < files.length; j++){
                    if(gallery_item.link == files[j].originalname){
                        gallery_item.file = files[j];
                    }
                }
            }            
            if(gallery_item.media_type =="instagram_embed"){
                gallery_item.link = gallery_item.link.split('?')[0];
            }
            else if(gallery_item.media_type == "youtube_embed"){

                if(gallery_item.link.indexOf("embed") == -1){
                    var video_id = gallery_item.link.split('v=')[1];
                    var ampersandPosition = video_id.indexOf('&');
                    if(ampersandPosition != -1) {
                        video_id = video_id.substring(0, ampersandPosition);
                    }
                    items[i].link = "https://www.youtube.com/embed/" + video_id;
                }
            }
            else if(gallery_item.media_type == "spotify_embed"){
                if(gallery_item.link.indexOf("spotify:track") > 0){
                    var video_id = gallery_item.link.split("track:")[1];
                    items[i].link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
                }
                else if(gallery_item.link.indexOf("embed") == -1){

                    var video_id = items[i].link.split('track/')[1];
                    items[i].link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
                }
            }
        }
        
        var loop_count = 0;
        
        //use an asynchronous loop to cycle through gallery items, if item is an image, save image to cloudinary and update gallery item link
        loop(items, function(item, next){

            if(item.media_type == "image"){

                var file_name = item.link;
                var file_buffer;
                var requires_download = true;

                if(item.file){
                    file_name = item.file.originalname;
                    file_buffer = item.file.buffer;
                    requires_download = false;
                }

                storage_interface.upload_image(requires_download, file_server_folder, file_name, file_buffer, false, function(img_dl_title){

                    item.link = img_dl_title;

                    loop_count++;
                    
                    if(item.main_graphic){
                        storage_interface.upload_image(requires_download, file_server_folder, file_name, file_buffer, true, function(img_dl_title){
                            item.thumbnail_img_title = img_dl_title;
                            
                            if(loop_count == items.length){
                                next(null, loop.END_LOOP);
                            }
                            else{
                                next();
                            }
                                
                        });
                    }
                    else{
                        if(loop_count == items.length){
                            next(null, loop.END_LOOP);
                        }
                        else{
                            next();
                        }
                    }
                });
            }
        }, callback );
        
        return items;
    }    
}