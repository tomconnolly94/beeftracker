
module.exports = {
    
    hash_password : function(password, salt, pepper) {
        
        return { hashed_password: "hashed_" + password };
    }
}