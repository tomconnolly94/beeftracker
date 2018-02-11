
module.exports = {
 
    format_embeddable_items: function(items, files){
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
        return items;
    }
}