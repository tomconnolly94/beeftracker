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

    var formatting, expected_youtube_link, expected_spotify_link;

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
        dotenv.config();

        expected_youtube_link = "https://www.youtube.com/embed/5PHqk_7kIWk";
        expected_spotify_link = "https://open.spotify.com/embed/track/56IGGA6VwAbIni6KoN7VC5";
    });
    
    beforeEach(function () {});
    
    it('format_embeddable_items - soundcloud_embed', function (done) {

        var soundcloud_gallery_item = {
            media_type: "soundcloud_embed",
            link: "https://soundcloud.com/joebuddenpodcast/141a",
            main_graphic: false,
            cover_image: false
        };

        var expected_gallery_item_link = "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/372107174&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
        
        formatting.format_embeddable_items([ soundcloud_gallery_item ], [], function(new_gallery_items){
            var new_soundcloud_gallery_item = new_gallery_items[0];

            assert.equal(new_soundcloud_gallery_item.media_type, soundcloud_gallery_item.media_type);
            assert.equal(expected_gallery_item_link, soundcloud_gallery_item.link);
            assert.equal(new_soundcloud_gallery_item.main_graphic, soundcloud_gallery_item.main_graphic);
            assert.equal(new_soundcloud_gallery_item.cover_image, soundcloud_gallery_item.cover_image);

            done();
        });
    });
    
    it('format_embeddable_items - image with file', function (done) {

        var image_gallery_item = {
            media_type: "image",
            main_graphic: false,
            cover_image: false,
            file: null,
            link: "fake_image_originalname"
        }

        var image_file_object = {
            originalname: "fake_image_originalname"
        };

        formatting.format_embeddable_items([ image_gallery_item ], [ image_file_object ], function(new_gallery_items){
            var new_image_gallery_item = new_gallery_items[0];

            assert.equal(image_gallery_item.media_type, new_image_gallery_item.media_type);
            assert.equal(image_gallery_item.main_graphic, new_image_gallery_item.main_graphic);
            assert.equal(image_gallery_item.cover_image, new_image_gallery_item.cover_image);
            assert.equal(image_gallery_item.file.originalname, new_image_gallery_item.file.originalname);

            done();
        });
    });
    
    it('format_embeddable_items - image with link', function (done) {

        var image_gallery_item = {
            media_type: "image",
            main_graphic: false,
            cover_image: false,
            file: null,
            link: "http://www.fakeimage.jpg"
        }

        formatting.format_embeddable_items([ image_gallery_item ], [], function(new_gallery_items){
            var new_image_gallery_item = new_gallery_items[0];

            assert.equal(image_gallery_item.media_type, new_image_gallery_item.media_type);
            assert.equal(image_gallery_item.main_graphic, new_image_gallery_item.main_graphic);
            assert.equal(image_gallery_item.cover_image, new_image_gallery_item.cover_image);
            assert.equal(image_gallery_item.link, new_image_gallery_item.link);

            done();
        });
    });
    
    it('format_embeddable_items - instagram_embed', function (done) {

        var instagram_gallery_item = {
            media_type: "instagram_embed",
            link: "https://instagram.com/joebuddenpodcast/141a?extralilbitthatwedontneed",
            main_graphic: false,
            cover_image: false
        };

        var expected_instagram_link = "https://instagram.com/joebuddenpodcast/141a";

        formatting.format_embeddable_items([ instagram_gallery_item ], [], function(new_gallery_items){
            var new_instagram_gallery_item = new_gallery_items[0];

            assert.equal(instagram_gallery_item.media_type, new_instagram_gallery_item.media_type);
            assert.equal(instagram_gallery_item.main_graphic, new_instagram_gallery_item.main_graphic);
            assert.equal(instagram_gallery_item.cover_image, new_instagram_gallery_item.cover_image);
            assert.equal(expected_instagram_link, new_instagram_gallery_item.link);

            done();
        });
    });
    
    it('format_embeddable_items - youtube_embed - embed', function (done) {

        var youtube_gallery_item_embed = {
            media_type: "youtube_embed",
            link: expected_youtube_link,
            main_graphic: false,
            cover_image: false
        };

        formatting.format_embeddable_items([ youtube_gallery_item_embed ], [], function(new_gallery_items){
            var new_youtube_gallery_item = new_gallery_items[0];

            assert.equal(youtube_gallery_item_embed.media_type, new_youtube_gallery_item.media_type);
            assert.equal(youtube_gallery_item_embed.main_graphic, new_youtube_gallery_item.main_graphic);
            assert.equal(youtube_gallery_item_embed.cover_image, new_youtube_gallery_item.cover_image);
            assert.equal(expected_youtube_link, new_youtube_gallery_item.link);

            done();
        });

    });
    
    it('format_embeddable_items - youtube_embed - url', function (done) {
        var youtube_gallery_item_url = {
            media_type: "youtube_embed",
            link: "https://www.youtube.com/watch?v=5PHqk_7kIWk",
            main_graphic: false,
            cover_image: false
        };

        formatting.format_embeddable_items([ youtube_gallery_item_url ], [], function(new_gallery_items){
            var new_youtube_gallery_item = new_gallery_items[0];

            assert.equal(youtube_gallery_item_url.media_type, new_youtube_gallery_item.media_type);
            assert.equal(youtube_gallery_item_url.main_graphic, new_youtube_gallery_item.main_graphic);
            assert.equal(youtube_gallery_item_url.cover_image, new_youtube_gallery_item.cover_image);
            assert.equal(expected_youtube_link, new_youtube_gallery_item.link);

            done();
        });

    });
    
    it('format_embeddable_items - youtube_embed - short link', function (done) {
        var youtube_gallery_item_short_link = {
            media_type: "youtube_embed",
            link: "https://youtu.be/5PHqk_7kIWk",
            main_graphic: false,
            cover_image: false
        };

        formatting.format_embeddable_items([ youtube_gallery_item_short_link ], [], function(new_gallery_items){
            var new_youtube_gallery_item = new_gallery_items[0];

            assert.equal(youtube_gallery_item_short_link.media_type, new_youtube_gallery_item.media_type);
            assert.equal(youtube_gallery_item_short_link.main_graphic, new_youtube_gallery_item.main_graphic);
            assert.equal(youtube_gallery_item_short_link.cover_image, new_youtube_gallery_item.cover_image);
            assert.equal(expected_youtube_link, new_youtube_gallery_item.link);

            done();
        });
    });
    
    it('format_embeddable_items - spotify_embed - link', function (done) {
        var spotify_gallery_item_short_link = {
            media_type: "spotify_embed",
            link: "https://open.spotify.com/track/56IGGA6VwAbIni6KoN7VC5?si=C1v2N0qfQaagrqpDwZs4FQ",
            main_graphic: false,
            cover_image: false
        };

        formatting.format_embeddable_items([ spotify_gallery_item_short_link ], [], function(new_gallery_items){
            var new_spotify_gallery_item = new_gallery_items[0];

            assert.equal(spotify_gallery_item_short_link.media_type, new_spotify_gallery_item.media_type);
            assert.equal(spotify_gallery_item_short_link.main_graphic, new_spotify_gallery_item.main_graphic);
            assert.equal(spotify_gallery_item_short_link.cover_image, new_spotify_gallery_item.cover_image);
            assert.equal(expected_spotify_link, new_spotify_gallery_item.link);

            done();
        });
    });
    
    it('format_embeddable_items - spotify_embed - embed', function (done) {
        var spotify_gallery_item_short_link = {
            media_type: "spotify_embed",
            link: "https://open.spotify.com/embed/track/56IGGA6VwAbIni6KoN7VC5",
            main_graphic: false,
            cover_image: false
        };

        formatting.format_embeddable_items([ spotify_gallery_item_short_link ], [], function(new_gallery_items){
            var new_spotify_gallery_item = new_gallery_items[0];

            assert.equal(spotify_gallery_item_short_link.media_type, new_spotify_gallery_item.media_type);
            assert.equal(spotify_gallery_item_short_link.main_graphic, new_spotify_gallery_item.main_graphic);
            assert.equal(spotify_gallery_item_short_link.cover_image, new_spotify_gallery_item.cover_image);
            assert.equal(expected_spotify_link, new_spotify_gallery_item.link);

            done();
        });
    });
    
    it('format_embeddable_items - spotify_embed - uri', function (done) {
        var spotify_gallery_item_short_link = {
            media_type: "spotify_embed",
            link: "spotify:track:56IGGA6VwAbIni6KoN7VC5",
            main_graphic: false,
            cover_image: false
        };

        formatting.format_embeddable_items([ spotify_gallery_item_short_link ], [], function(new_gallery_items){
            var new_spotify_gallery_item = new_gallery_items[0];

            assert.equal(spotify_gallery_item_short_link.media_type, new_spotify_gallery_item.media_type);
            assert.equal(spotify_gallery_item_short_link.main_graphic, new_spotify_gallery_item.main_graphic);
            assert.equal(spotify_gallery_item_short_link.cover_image, new_spotify_gallery_item.cover_image);
            assert.equal(expected_spotify_link, new_spotify_gallery_item.link);

            done();
        });
    });
});
