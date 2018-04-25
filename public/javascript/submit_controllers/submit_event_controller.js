$(function(){
    
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
            
            console.log(item);
            console.log(item.children[1].currentSrc);
            
            var gallery_item_formatted = {
                
            }
            
            
            //gallery_items.push(li_items_data_sources[i].textContent);
        }
        
        var event_submission = {
            title: title,
            aggressors: [ aggressor ],
            targets: [ target ],
            date: date,
            description: description,
            categories: [ category ],
            tags: tags,
        }
    }); 
});