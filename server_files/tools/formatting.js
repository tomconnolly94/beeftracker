////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Module: formatting
// Author: Tom Connolly
// Description: Module to format certain objects into a more useful shape for storage or other 
// purposes
// Testing script:
//
////////////////////////////////////////////////////////////////////////////////////////////////////

//external dependencies
var request = require("request");

//internal dependencies

module.exports = {
 
    format_embeddable_items: function(items, files, callback){

        var format_promises = [];
        
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

                format_promises.push(
                    new Promise(function(resolve, reject){
                        for(var j = 0; j < files.length; j++){
                            if(gallery_item.link == files[j].originalname){
                                gallery_item.file = files[j];
                                gallery_item.file_name = files[j].originalname;
                            }
                        }
                        resolve(gallery_item);
                    })
                );
            }
            else if(gallery_item.media_type =="instagram_embed"){

                format_promises.push(
                    new Promise(function(resolve, reject){
                        gallery_item.link = gallery_item.link.split('?')[0];
                        resolve(gallery_item);
                    })
                )
            }
            else if(gallery_item.media_type == "youtube_embed"){

                format_promises.push(
                    new Promise(function(resolve, reject){
                        if(gallery_item.link.indexOf("embed") == -1){
                            var video_id = gallery_item.link.split('v=')[1];
                            var ampersandPosition = video_id.indexOf('&');
                            if(ampersandPosition != -1) {
                                video_id = video_id.substring(0, ampersandPosition);
                            }
                            items[i].link = "https://www.youtube.com/embed/" + video_id;
                        }
                        resolve(gallery_item);
                    })
                )
            }
            else if(gallery_item.media_type == "spotify_embed"){

                format_promises.push(
                    new Promise(function(resolve, reject){
                        if(gallery_item.link.indexOf("spotify:track") > 0){
                            var video_id = gallery_item.link.split("track:")[1];
                            items[i].link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
                        }
                        else if(gallery_item.link.indexOf("embed") == -1){

                            var video_id = items[i].link.split('track/')[1];
                            items[i].link = "https://embed.spotify.com/?uri=spotify%3Atrack%3A" + video_id;
                        }
                        resolve(gallery_item);
                    })
                )
            }
            else if(gallery_item.media_type == "soundcloud_embed"){

                format_promises.push(
                    new Promise(function(resolve, reject){
                        if(gallery_item.link.indexOf("soundcloud.com/player/?url") == -1){

                            var soundcloud_api_get_data_url = `https://api.soundcloud.com/resolve.json?url=${gallery_item.link}&client_id=${process.env.SOUNDCLOUD_CLIENT_ID}`;

                            request({
                                uri: soundcloud_api_get_data_url,
                                method: "GET",
                                timeout: 10000,
                                followRedirect: true,
                                maxRedirects: 10
                            }, 
                            function(error, response, body) {
                                body = JSON.parse(body);
                                gallery_item.link = `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${body.id}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`;

                                resolve(gallery_item);
                            });
                        }
                    })
                )
            }
        }

        Promise.all(format_promises).then(function(values) {
            callback(values)
        }).catch(function(error){
            console.log(error);
        });
    }
}