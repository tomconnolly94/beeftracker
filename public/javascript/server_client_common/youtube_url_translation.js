
(function(exports){

    // Your code goes here

    exports.get_youtube_embed_img_src = function(input){
       
        var params = {};

        if(input.includes("youtube")){
            var input_params = [];
            if(input.includes("embed")){
                params.v = input.split("/")[input.split("/").length - 1];
                input = "https://www.youtube.com/watch?v=" + params.v;
            }
            else{
                input_params = input.split("?")
                
                if(input_params.length > 1 && input_params[1].includes("v=")){
                    input_params = input_params[1];

                    input_params.split("&").forEach(function(part) {
                        var item = part.split("=");
                        params[item[0]] = decodeURIComponent(item[1]);
                    });
                }
                else{
                    params.v = "";
                }
            }
        }
        else{
            params.v = "";
        }

        return "https://img.youtube.com/vi/" + params.v + "/0.jpg";
    };

})(typeof exports === 'undefined'? this['youtube_url_translation'] = {}: exports);