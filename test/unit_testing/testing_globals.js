
var dummy_object_id = "5a69027a01e599f97e278f73";

module.exports = {
    dummy_object_id: dummy_object_id,

    compare_object_fields: function(object_1, object_2){
        var object_1_keys = Object.keys(object_1);
        var object_2_keys = Object.keys(object_2);
        
        if(object_1_keys.length != object_2_keys.length){
            return false;
        }

        object_1_keys.sort();
        object_2_keys.sort();

        for(var key_index = 0; key_index < object_1_keys.length; key_index++){
            if(object_1_keys[key_index] != object_2_keys[key_index]){
                return false;
            }
        }
        return true;
    },

    //note; regressive function
    compare_objects: function(object_1, object_2, fields_to_skip = []){

        if(!this.compare_object_fields(object_1, object_2)){
            return false;
        }

        var object_1_keys = Object.keys(object_1).sort();
        var object_2_keys = Object.keys(object_2).sort();

        for(var key_index = 0; key_index < object_1_keys.length; key_index++){
            var potential_object = object_1[object_1_keys[key_index]];

            if(typeof(potential_object) == 'object' && potential_object != null){
                if(!module.exports.compare_objects(object_1[object_1_keys[key_index]], object_2[object_2_keys[key_index]], fields_to_skip)){
                    return false;
                }
            }
            else{
                if(isNaN(object_1_keys[key_index])){ //object_1 is an object
                    if(!fields_to_skip.includes(object_1_keys[key_index])){
                        if(object_1[object_1_keys[key_index]] != object_2[object_2_keys[key_index]]){
                            return false;
                        }
                    }
                }
                else{ //object_1 is an array
                    if(!object_2.includes(object_1[key_index])){
                        return false;
                    }
                }
            }
        }
        return true;
    },

    event_example: {
        title: "title",
        aggressors: [ dummy_object_id ],
        targets: [ dummy_object_id, dummy_object_id ],
        date: new Date(),
        description: "description",
        links: [
            {
                "title" : "Spotify",
                "url" : "https://spotify-link"
            },
            {
                "title" : "Genius",
                "url" : "https://genius-link"
            }
        ],
        gallery_items: [
            {
                "media_type" : "youtube_embed",
                "link" : "https://www.youtube.com/embed/0ePQKD9iBfU",
                "main_graphic" : true,
                "file" : null,
                "file_name" : null
            },
            {
                "media_type" : "image",
                "link" : "image",
                "main_graphic" : false,
                "file" : null,
                "file_name" : "image"
            }
        ],
        categories: [
            1,
            4
        ],
        data_sources: [
            "data_source_1",
            "data_source_2",
        ],
        record_origin: "record_origin",
        tags: [ "tag_1", "tag_2"],
        user_id: dummy_object_id
    }
}