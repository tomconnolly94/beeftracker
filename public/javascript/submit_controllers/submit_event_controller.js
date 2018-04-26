$(function(){
    
    function urltoFile(url, filename, mimeType){
        return (fetch(url)
            .then(function(res){return res.arrayBuffer();})
            .then(function(buf){return new File([buf], filename, {type:mimeType});})
        );
    }
    
    function b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
    
    $("#submit_new_event_button").click(function(event){
        event.preventDefault();
        console.log(this);
        
        
        //get form contents
        var title = $("#beef_title").val();
        var date = $("#beef_date").val();
        var aggressor = $("#beefer_name").attr("x-actor-id");
        var target = $("#beefee_name").attr("x-actor-id");
        var category = $("#beef_category").select2().find(":selected").val();
        var tags = $("#beef_tags").select2().val();
        var description = $("#beef_content_summernote").val();
        /*
        console.log(title);
        console.log(date);
        console.log(aggressor);
        console.log(target);
        console.log(category);
        console.log(tags);
        console.log(description);*/
        
        var li_items_data_sources = $("#add_beef_event_data_sources").find("li");
        var data_sources = [];
        
        //extract data sources
        for(var i = 0; i < li_items_data_sources.length; i++){
            data_sources.push(li_items_data_sources[i].textContent);
        }
        
        var li_items_gallery_manager = $("#gallery_manager").find(".gallery-manager-item");
        var gallery_items = [];
        
        //extract gallery items
        for(var i = 0; i < li_items_gallery_manager.length; i++){
            var item = li_items_gallery_manager[i];
            
            var gallery_item_formatted = {
                file: item.children[1].currentSrc,
                media_type: item.children[1].attributes[1].value,
                link: "",
                main_graphic: false
            }

            gallery_items.push(gallery_item_formatted);

        }
        
        var event_submission = {
            title: title,
            aggressors: [ aggressor ],
            targets: [ target ],
            date: date,
            description: description,
            categories: [ category ],
            tags: tags,
            data_sources: data_sources,
            gallery_items: gallery_items
        }

        var form_data = new FormData();

        form_data.append("data", JSON.stringify(event_submission));
        form_data.append("file1", b64toBlob(item.children[1].currentSrc));

        /*$.post("/api/events", { data: event_submission }, function(data) {
            console.log(data);
        });*/

        $.ajax({
            url: "/api/events",
            data: form_data,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data){
                alert(data);
            }
        });
        
    }); 
});