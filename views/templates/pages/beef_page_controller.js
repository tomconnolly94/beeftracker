//Associated Actors
function formatState (state) {
    if (!state.id || state.element.getAttribute('disabled')) {
        return state.text;
    }
    var $state = $(
        '<span><img style="width: 48px;" src="'+state.element.getAttribute('image_src') + '" class="img-flag" /> ' + state.text + '</span>'
    );
    return $state;
};

function handle_also_appears_in_select(element){
    window.location = element.value + window.location.pathname.split("/").pop();
}

//Also appears in selector
var aaisEl = $(".also-appears-in-select");
aaisEl.select2({
    placeholder: "Event also appears in...",
    templateResult: formatState,
    theme: 'classic',
    width: "100%",
    minimumResultsForSearch: -1 //Disable search
});

aaisEl.on('select2:select', function (e) {
    var new_url_path = e.params.data.id + window.location.pathname.split("/").pop();
    //alert("new_url_path " + new_url_path);
    window.location = new_url_path;
});

var youtube_element = document.getElementById("youtube_iframe");

if(youtube_element && false){
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
            report_broken_link(youtube_video_check_url)
        }
    });

    function report_broken_link(link){
        $.ajax({
            url: "/api/report-broken-link",
            type: 'GET',
            success: function(ytresponse, more, more2){
                console.log(ytresponse)
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log("ERROR: ", XMLHttpRequest);
                //window.location = "/login";

            }
        });
    }
}