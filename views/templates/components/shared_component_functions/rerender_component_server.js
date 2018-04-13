
function render_template_via_ajax(template_id){ 

    var module = {};

    //get data
    module.data = {
        categories: categories,
        author: author
    };

    $.get("http://localhost:5000/templates/" + template_id, function( html, textStatus, jqxhr ) {
        document.getElementById(template_id).innerHTML = html;
    });
}