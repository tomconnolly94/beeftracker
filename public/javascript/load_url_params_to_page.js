$(function(){

    var add_beef_url_field_mappings = {
        "_id": "_id",
        "beef_title": "title",
        "beef_category": "category",
        "beef_description": "description",

    }

    var urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);
    console.log(urlParams.get("_id"));
    document.getElementById("beef_title").value = urlParams.get("title");
    document.getElementById("beef_category").value = JSON.parse(urlParams.get("category"));
    document.getElementById("beef_description").value = urlParams.get("description");
    var beef_tags = JSON.parse(urlParams.get("tags"));
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    write_list_to_display("add_list_input_add_event_data_sources", JSON.parse(urlParams.get("tags")));

    //for(var i = 0; i < beef_tags.length; i++){
        document.getElementById("add_list_input_add_event_data_sources").value = beef_tags[1];
        document.getElementById("add_event_data_sources_add_button").click(); 
        sleep(5000)
        document.getElementById("add_list_input_add_event_data_sources").value = beef_tags[0];
        document.getElementById("add_event_data_sources_add_button").click();
    //}
    document.getElementById("beef_tags").value = JSON.parse(urlParams.get("tags"));

    console.log(urlParams.get("date"));
    console.log(urlParams.get("description"));
    console.log(JSON.parse(urlParams.get("tags")));
    console.log(JSON.parse(urlParams.get("aggressors")));
})