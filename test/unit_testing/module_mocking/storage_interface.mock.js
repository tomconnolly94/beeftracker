
module.exports = {

    upload_image: function(image_requires_download, destination_folder, img_title, img_buffer, thumbnail, callback){
        console.log("upload_image");
    },
    
    delete_image: function(folder, img_title, callback){
        console.log("delete_image");
    },
        
    //format gallery items for db storage, also store them in the provided folder on the file server
    async_loop_upload_items: function(items, file_server_folder, files, callback){
        console.log("async_loop_upload_items");
    },
    
    //format gallery items for db storage, also store them in the provided folder on the file server
    async_loop_remove_items: function(items, file_server_folder, callback){
        console.log("async_loop_remove_items");
    }
}