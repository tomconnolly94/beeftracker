
function check_for_template_function(template_id){

    var module = {};

    //get data
    module.data = {
        categories: categories,
        author: author
    };

    if(!window[template_id + "tmpl_func"]){
        $.getScript("http://localhost:5000/template_functions/" + template_id, function( data, textStatus, jqxhr ) {
            re_render_component_with_function(template_id, module.data);
        });
    }
    else{
        re_render_component_with_function(template_id, module.data);
    }
}

function re_render_component_with_function(template_id, data){

    var html = window[template_id + "tmpl_func"]({author: data.author, categories: data.categories});
    document.getElementById(template_id).innerHTML = html;
}
