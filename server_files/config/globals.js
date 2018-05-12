let file_server_id = process.env.CLOUDINARY_URL.split("@")[1];

module.exports = {
    
    file_server_url_prefix: "https://res.cloudinary.com/" + file_server_id + "/image/upload/v1514066941"
    
}