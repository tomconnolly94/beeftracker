//external dependencies
var multer = require('multer');

var memoryStorage = multer.memoryStorage();
var memoryUpload = multer({
    storage: memoryStorage,
    limits: {fileSize: 500000, files: 15}
}).any('attachment');

module.exports = {
    get_multer_object: function(){
        return memoryUpload;
    }
}