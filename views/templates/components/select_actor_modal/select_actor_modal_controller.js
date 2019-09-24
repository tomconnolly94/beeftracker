$(function () {
    function get_template_dir() {
        return "versus_panel";
    }

    function get_template_name() {
        return "versus_panel";
    }

    function sort_actor_options(a, b){
        if (a.text < b.text)
            return -1;
        if (a.text > b.text)
            return 1;
        return 0;
    }

    //init components
    $('#select_actor').select2({
        placeholder: 'Select actor ',
        theme: 'classic',
        width: "100%",
        dropdownParent: $("#selector_actor_modal"),
        sorter: data => data.sort((a, b) => a.text.localeCompare(b.text)),
        //sorter: sort_actor_options //TODO: this must run on every 'change' to the list if an element is selected or removed, elements revert to their original order
    });

    $("#select_actor").unbind().change(function (event) {
        $('#select_actor .select2-selection__rendered li.select2-selection__choice').sort(function(a, b) {
            return $(a).text() < $(b).text() ? -1 : $(a).text() > $(b).text() ? 1 : 0;
        }).prependTo('.select2-selection__rendered');
    });

    $('#selector_actor_modal #add_new_actor').click(function () {
        $('#selector_actor_modal').modal('hide');
        $('#add_actor_modal').modal({
            show: true
        });
    });

    var panel_aggressors = [];
    var panel_targets = [];
    var selected_actor_id;

    function assign_click_listeners() {

        $(".select_actor_beefer").click(function (event) {
            $("#selector_actor_modal").attr("x-current-actor", "beefer");
        });

        $(".select_actor_beefee").click(function (event) {
            $("#selector_actor_modal").attr("x-current-actor", "beefee");
        });

        $(".remove_actor").unbind().click(function () {

            var container_div = $(this).parent();

            var removed_actor_record = {
                src: container_div.find(".actor-avatar").attr("src"),
                name: container_div.children("h4").text(),
                _id: container_div.children("h4").attr("x-actor-id")
            };

            for (var i = 0; i < panel_aggressors.length; i++) {
                if (panel_aggressors[i]._id == removed_actor_record._id) {
                    panel_aggressors.splice(i, 1);
                }
            }

            for (var i = 0; i < panel_targets.length; i++) {
                if (panel_targets[i]._id == removed_actor_record._id) {
                    panel_targets.splice(i, 1);
                }
            }

            //create new actor option
            var removed_actor_option = $("<option/>", {
                "value": removed_actor_record._id,
                "text": removed_actor_record.name,
                "x-actor-image-link": removed_actor_record.src,
                "x-actor-name": removed_actor_record.name,
                "x-actor-id": removed_actor_record._id
            });

            //re-add actor to select_actor_modal actor list
            $('#select_actor').append(removed_actor_option);

            render_versus_panel(panel_aggressors, panel_targets)
        });
    }

    assign_click_listeners(); //trigger click listener registration

    $('#select_actor').val("default").trigger("change"); //set the select actor list to its default value

    //function to take data from the select actor modal and assign it to the DOM
    $("#select_actor_modal_submit").click(function () {

        //access data from modal
        var actor_type = $("#selector_actor_modal").attr("x-current-actor");
        var image_link = $("#select_actor").select2().find(":selected").attr("x-actor-image-link");
        var actor_name = $("#select_actor").select2().find(":selected").attr("x-actor-name");
        var actor_id = $("#select_actor").select2().find(":selected").attr("x-actor-id");

        /*
        //assign data
        $("#select_actor_" + actor_type + " img").attr("src", image_link); //set preview image src
        $("#select_actor_" + actor_type + " img").css("display", "block"); //show img tag
        $("#select_actor_" + actor_type + " i").hide(); //hide + icon
        $("#" + actor_type + "_name").text(actor_name); //insert actor name above preview
        $("#" + actor_type + "_name").attr("x-actor-id", actor_id); //save actor_id to x- attribute for use later
        */
        var new_actor_record = {
            src: image_link,
            name: actor_name,
            _id: actor_id
        };

        render_versus_panel(actor_type == "beefer" ? panel_aggressors.concat([new_actor_record]) : panel_aggressors, actor_type == "beefee" ? panel_targets.concat([new_actor_record]) : panel_targets)

        $(`#select_actor option[value='${new_actor_record._id}']`).remove(); //remove selected option from list
        $('#select_actor').val("default").trigger("change"); //reset actor input select box
        $("#selector_actor_modal").modal("hide"); //hide modal
    });

    $("#select_actor").unbind().change(function (event) {
        $("#select_actor_modal_submit").removeAttr("disabled")
    });

    $("#select_actor_modal_cancel").unbind().click(function () {
        $('#select_actor').val("default").trigger("change"); //reset actor input select box
        $("#selector_actor_modal").modal("hide"); //hide modal
    });


    var render_versus_panel = function (aggressors, targets) {

        panel_aggressors = aggressors;
        panel_targets = targets;

        var file_server_url_prefix = $("#file_server_url_prefix_store").attr("value"); //extract file server url prefix from hidden div
        var browser = $("#browser").attr("value"); //extract browser type from hidden div

        var template_dir = get_template_dir();
        var template_name = get_template_name();

        load_template_render_function(template_dir + "/" + template_name, function (status) {
            fade_new_content_to_div("#versus_panel", window[template_name + "_tmpl_render_func"]({
                file_server_url_prefix: file_server_url_prefix,
                browser: browser,
                aggressors: aggressors,
                targets: targets
            }), function () {
                assign_click_listeners();
            });
        });
    }

    //assign to window so it is accessible to other controllers
    window["select_actor_modal_controller__render_versus_panel"] = render_versus_panel;
});