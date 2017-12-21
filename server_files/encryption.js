//var BSON = require('bson');
var bodyParser = require("body-parser");
var crypto = require('crypto');

//function to generate random salt of param1 length
var generate_salt = function(length){
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0,length);
};

//function to take password (with pepper already applied) and salt and generate the hashed outcome
var sha_512_hash = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        hashed_password: value
    };
};

//generate 1 character pepper to be appended to password
var generate_pepper = function() {

    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var text = possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = {
    
    encrypt_password : function(password, salt, pepper) {
        
        //assign undefined fields
        if(!salt){ salt = generate_salt(16); }
        if(!pepper){ pepper = generate_pepper(); }
        
        console.log(salt);
        console.log(pepper);
        
        return sha_512_hash(password + pepper, salt);
        
    }
}