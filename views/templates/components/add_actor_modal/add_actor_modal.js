$(function() {
    $('#smartwizard').smartWizard({
        theme: 'circles',
        cycleSteps: true,
        keyNavigation: false,
        toolbarSettings: {
            showNextButton: false,
            showPreviousButton: false,
        },
        anchorSettings: {
            //-anchorClickable: true,
            enableAllAnchors: true
        }
    });

    var next = 1;
    $(".add-more").click(function(e){
        e.preventDefault();
        var addto = "#field" + next;
        var addRemove = "#field" + (next);
        next = next + 1;
        var newIn = '<input autocomplete="off" class="input form-control" id="field' + next + '" name="field' + next + '" type="text">';
        var newInput = $(newIn);
        var removeBtn = '<button id="remove' + (next - 1) + '" class="btn btn-danger remove-me" >-</button></div><div id="field">';
        var removeButton = $(removeBtn);
        $(addto).after(newInput);
        $(addRemove).after(removeButton);
        $("#field" + next).attr('data-source',$(addto).attr('data-source'));
        $("#count").val(next);

        $('.remove-me').click(function(e){
            e.preventDefault();
            var fieldNum = this.id.charAt(this.id.length-1);
            var fieldID = "#field" + fieldNum;
            $(this).remove();
            $(fieldID).remove();
        });
    });


    //Associated Actors
    function formatState (state) {
          if (!state.id) {
            return state.text;
          }
          var $state = $(
            '<span><img style="width: 48px; border-radius: 48px" src="'+state.element.getAttribute('image_src') + '" class="img-flag" /> ' + state.text + '</span>'
          );
          return $state;
        };

        $(".associated-actors-select").select2({
          templateResult: formatState,
          theme: 'classic',
            width: "100%"
        });
});
