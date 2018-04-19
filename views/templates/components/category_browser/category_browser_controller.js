$(function(){
    $(".category_button").click(function(event){
        event.preventDefault();
        console.log(this);
        console.log(this.id);
        
        var template_dir = "category_browser";
        var template_name = "category_browser_display";
        
        $.get("/api/events", { match_category: this.id, limit: 6 }, function(data){
            console.log(data);
                
            load_template_render_function(template_dir + "/" + template_name, function(status){
                
                var func = window[template_name + "_tmpl_render_func"];
                
                var html = window[template_name + "_tmpl_render_func"]({ category_event_data: data });
                
                $("#beef_category_browser_display").html(window[template_name + "_tmpl_render_func"]({ category_event_data: data }));
                //$("#beef_category_browser_display").html("<h1> hello </h1>");
            });
        });
    });
})