//Global variables, this script will be included in every client view 
//var EVENT_IMAGES_PATH = "/event_images/";
//var ARTIST_IMAGES_PATH = "/actor_images/";
var EVENT_IMAGES_PATH = "https://res.cloudinary.com/hghz4zts3/image/upload/v1509044500/events/";
var ARTIST_IMAGES_PATH = "https://res.cloudinary.com/hghz4zts3/image/upload/v1509044500/actors/";

//function which checks if the template rendering function is loaded, if not it loads it into the window variable
function load_template_render_function(template_name, success_callback){

    if(window[template_name + "_tmpl_render_func"]){
        success_callback(true);
    }
    else{
        $.getScript("/template_functions/" + template_name, function(data, status, jqxhr){
            if(status == "success"){
                success_callback(true);
            }
            else{
                console.log("Unable to access template on server or client in order to re-render " + template_name);
            }
        });
    }
}