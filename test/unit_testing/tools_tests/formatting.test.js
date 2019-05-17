//external dependencies
var proxyquire = require("proxyquire");
var chai = require('chai');
var sinon = require("sinon");
var assert = chai.assert;
var expect = chai.expect;
var dotenv = require("dotenv");

//internal dependencies
var globals = require('../testing_globals.js');

describe('Module: formatting', function () {

    var formatting, image_gallery_item, soundcloud_gallery_item;

    before(function(){
        
        //set timeout
        this.timeout(globals.default_timeout);
        var request_mock = function(params, callback){
            callback(null, null, JSON.stringify({
                "kind":"track",
                "id":372107174,
                "created_at":"2017/12/20 13:17:44 +0000",
                "user_id":138976584,
                "duration":9274390,
                "commentable":true,
                "state":"finished",
                "original_content_size":148035126,
                "last_modified":"2018/10/13 05:42:37 +0000",
                "sharing":"public",
                "tag_list":"",
                "permalink":"141a",
                "streamable":true,
                "embeddable_by":"all","purchase_url":null,
                "purchase_title":null,
                "label_id":null,
                "genre":"",
                "title":"Episode 141 | \"Everyday Struggle\"",
                "description":"The explanation you’ve all been waiting for, Joe elaborates on the departure from his old job, he also highlights the importance of integrity (11:28). Then Joe, Rory, and Mal finally give their review of the Eminem album (1:21:00). The Black Thought Freestyle sparked a lot of attention this past week, which inspired the guys to reveal their list of lyricist they believe are elite (1:42:51). No, this is not their top 20 rapper’s of all time list. Enjoy.\n\nSleeper picks of the week:\n\nJoe:\nDiddy (ft. Nas and Beanie Sigel) “Journey Through the Life” | https://youtu.be/Jm9qUdUynpk\n\nMal:\nShawn Smith “Baby Alien (Freestyle)” | https://youtu.be/X04SNo2QoYE\n\nRory:\nAlbee Al “Funk Flex Freestyle” | https://youtu.be/BStk1lWZpoI",
                "label_name":null,
                "release":null,
                "track_type":null,
                "key_signature":null,
                "isrc":null,
                "video_url":null,
                "bpm":null,
                "release_year":null,
                "release_month":null,
                "release_day":null,
                "original_format":"mp3",
                "license":"all-rights-reserved",
                "uri":"https://api.soundcloud.com/tracks/372107174",
                "user":{
                    "id":138976584,
                    "kind":"user",
                    "permalink":"joebuddenpodcast",
                    "username":"The Joe Budden Podcast",
                    "last_modified":"2018/11/27 10:44:13 +0000",
                    "uri":"https://api.soundcloud.com/users/138976584",
                    "permalink_url":"http://soundcloud.com/joebuddenpodcast",
                    "avatar_url":"https://i1.sndcdn.com/avatars-000339271351-xr02gt-large.jpg"
                },
                "permalink_url":"https://soundcloud.com/joebuddenpodcast/141a",
                "artwork_url":"https://i1.sndcdn.com/artworks-000272502218-xt6meo-large.jpg",
                "stream_url":"https://api.soundcloud.com/tracks/372107174/stream",
                "download_url":"https://api.soundcloud.com/tracks/372107174/download",
                "playback_count":377381,
                "download_count":0,
                "favoritings_count":2361,
                "reposts_count":298,
                "comment_count":233,
                "downloadable":false,
                "waveform_url":"https://wave.sndcdn.com/lxUPJqncim6W_m.png",
                "attachments_uri":"https://api.soundcloud.com/tracks/372107174/attachments",
                "policy":"ALLOW",
                "monetization_model":"NOT_APPLICABLE"
            }));
        };

        formatting = proxyquire("../../../server_files/tools/formatting", { "request": request_mock });

        image_gallery_item = {
            media_type: "image",
            file: {
                originalname: "fake_image_originalname"
            }
        }

        soundcloud_gallery_item = {
            media_type: "soundcloud_embed",
            link: "https://soundcloud.com/joebuddenpodcast/141a",
            main_graphic: false,
            file: null,
            file_name: null
        };

        dotenv.config();
    });
    
    beforeEach(function () {
    });
    
    it('format_embeddable_items - soundcloud_embed', function (done) {
        var gallery_items = [
            soundcloud_gallery_item
        ];

        var expected_gallery_item_link = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/372107174&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
        
        formatting.format_embeddable_items(gallery_items, [], function(new_gallery_items){
            var soundcloud_gallery_item = new_gallery_items[0];

            assert.equal(soundcloud_gallery_item.media_type, soundcloud_gallery_item.media_type);
            assert.equal(expected_gallery_item_link, soundcloud_gallery_item.link);
            assert.equal(soundcloud_gallery_item.main_graphic, soundcloud_gallery_item.main_graphic);
            assert.equal(soundcloud_gallery_item.file, soundcloud_gallery_item.file);
            assert.equal(soundcloud_gallery_item.file_name, soundcloud_gallery_item.file_name);

            done();
        });
    });
});
