$(function(){

    var events_results_cache = [];
    var actors_results_cache = [];
    
    function make_search_request(){
        var search_term = $("#search_box_input").val();
        
        if(search_term.length > 2 && search_term.slice(-1) != " "){
            var template_name = "search_results";
            var template_dir = "search_results";
            var results_cache = [];
            var section_display_div_id = "search_results";
            var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
            var browser = $("#browser").attr("value"); //extract file server url prefix from hidden div

            var events_query_promise = new Promise(function(resolve, reject){
                $.get("/api/events", { match_title: search_term })
                .done(function(event_data){
                    resolve(event_data);
                })
                .fail(function() {
                    resolve([]);
                });
            });

            var actors_query_promise = new Promise(function(resolve, reject){
                $.get("/api/actors", { match_name: search_term })
                .done(function(actor_data){
                    resolve(actor_data);
                })
                .fail(function() {
                    resolve([]);
                });
            });


            Promise.all([ events_query_promise, actors_query_promise  ]).then(function(values) {

                var event_data = values[0];
                var actor_data = values[1];

                if(event_data.length > 0 || actor_data.length > 0){
                    if(JSON.stringify(event_data) != JSON.stringify(events_results_cache) || JSON.stringify(actor_data) != JSON.stringify(actors_results_cache)){
                        load_template_render_function(template_dir + "/" + template_name, function(status){
                            fade_new_content_to_div("#" + section_display_div_id, window[template_name + "_tmpl_render_func"]({ file_server_url_prefix: file_server_url_prefix, browser: browser, search_result_event_data: event_data, search_result_actor_data: actor_data }))
                        });
                    }
                }
                else{
                    fade_new_content_to_div("#" + section_display_div_id, "<h3 style='margin: 0 auto;text-align:center;padding-left:15px;'> No Beef events or Actors found, please try a different search. </h3>")
                }

                events_results_cache = event_data;
                actors_results_cache = actor_data;
            });
        }
    }
    
    $("#search_box_form").unbind().submit(function(e){
        e.preventDefault();
        make_search_request();
    });

    $("#search_box_input").unbind().on("input", function(){
        make_search_request();
    });
});