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
