
$('#beef_category').select2({
    placeholder: 'Select a Beef Category',
    theme: 'classic',
    width: "100%"
});

function init_beef_tags_box(){    
    $('#beef_tags').select2({
        //placeholder: 'Type in beef tags',
        theme: 'classic',
        tags: true,
        tokenSeparators: [',', ' '],
        width: "100%"
    });
}

init_beef_tags_box();


/*$('#beef_content_summernote').summernote({
    tabsize: 2,
    height: 300,
    toolbar: [
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['fontsize', []],
        ['color', []],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', []]
    ]
});*/