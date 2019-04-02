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
    document.getElementById("beef_description").value = urlParams.get("description");
    $('#beef_category').val(JSON.parse(urlParams.get("category"))).trigger('change');

    $("#beef_tags").val(JSON.parse(urlParams.get("tags"))).trigger('change');

    write_list_to_display("add_event_data_sources", JSON.parse(urlParams.get("data_sources")));
    console.log(urlParams.get("date"));
    var date_split = urlParams.get("date").split("T")
    document.getElementById("beef_date").value = date_split[0];
    document.getElementById("beef_time").value = date_split[1].slice(0,5);

    console.log(urlParams.get("description"));
    console.log(JSON.parse(urlParams.get("tags")));
    console.log(JSON.parse(urlParams.get("aggressors")));
});