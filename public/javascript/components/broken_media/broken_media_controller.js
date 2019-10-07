
function render_confirmation_message(){
    var fade_speed = 100;

    $("#broken-media-link").fadeOut(fade_speed, function(){
        $("#broken-media-link").html("<div style='text-align: center;'> <h5> Thankyou for notifying us, we will take a look at this media immediately. </h5></div>");
        $("#broken-media-link").fadeIn(fade_speed);
    });
}

function report_broken_media(broken_media){
    $.ajax({
        url: "/api/broken-media",
        type: 'POST',
        data: broken_media,
        success: function(data){
            render_confirmation_message()
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("ERROR: ", XMLHttpRequest);
            render_confirmation_message()
        }
    });
}

function auto_check_broken_youtube_media(){
    var youtube_element = document.getElementById("youtube_iframe");

    if(youtube_element){
        var youtube_video_id = youtube_element.src.split("embed/")[1].split("?")[0];
        var youtube_video_check_url = "https://i1.ytimg.com/vi/" + youtube_video_id + "/hqdefault.jpg"

        $.ajax({
            url: youtube_video_check_url,
            type: 'GET',
            beforeSend: function(request) {
                request.setRequestHeader("Access-Control-Allow-Origin", true);
            },
            success: function(ytresponse, more, more2){
                console.log(ytresponse);
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("ERROR: ", XMLHttpRequest);
                report_broken_media(youtube_video_check_url)
            }
        });
    }
}

function generate_gallery_item_from_page(){

    var youtube_element = document.getElementById("youtube_iframe");
    if(youtube_element){
        return {
            media_type: "youtube_embed",
            link: youtube_element.src,
            file_name: "",
            main_graphic: "",
            cover_image: "",
            file: null
        };
    }

    var soundcloud_element = document.getElementById("soundcloud_iframe");
    if(soundcloud_element){ 
        return {
            media_type: "soundcloud_embed",
            link: soundcloud_element.src,
            file_name: "",
            main_graphic: "",
            cover_image: "",
            file: null
        };
    }

    var video_element = document.getElementById("video_iframe");
    if(video_element){ 
        return {
            media_type: "video_embed",
            link: video_element.src,
            file_name: "",
            main_graphic: "",
            cover_image: "",
            file: null
        };
    }

    return {
        media_type: "none",
        link: "none",
        file_name: "No media type found",
        main_graphic: "",
        cover_image: "",
        file: null
    };
}

$(function(){
    //auto_check_broken_youtube_media();

    $("#broken-media-link").click(function(){

        var last_url_segment = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
        last_url_segment = last_url_segment.split("?")[0];

        var broken_media = {
            event_id: last_url_segment,
            gallery_items: generate_gallery_item_from_page()
        }

        report_broken_media(broken_media);
    });
})