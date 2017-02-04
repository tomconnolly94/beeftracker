function load_background(body){

    // Opera 8.0+
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]" 
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0 || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);

    // Internet Explorer 6-11
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    
    var img_url = "/background_images/the-blueprint.jpg";

    var style_string = new Array();

    style_string.push("background-image: url(/background_images/the-blueprint.jpg);");
    style_string.push("background-color: #FFFFFF;");
    style_string.push("background-attachment: fixed !important;");

    if(isFirefox){
        //style_string.push("background: -moz-linear-gradient(top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.7) 100%), url(bg.png) no-repeat 0 0, url(/background_images/the-blueprint.jpg) repeat 0 0;");
        style_string.push("background: -moz-linear-gradient(top, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;");
        style_string.push("-moz-background-size: cover;");
    }
    
    if(isChrome){
        //style_string.push("background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,rgba(255,255,255,0.7)), color-stop(100%,rgba(255,255,255,0.7))), url(/background_images/the-blueprint.jpg) no-repeat 0 0;");
        style_string.push("-webkit-linear-gradient(top, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0");    
        style_string.push("cover");
    }
    
    if(isOpera){
        style_string.push("background: -o-linear-gradient(top, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;");
        style_string.push("-o-background-size: cover;");
    }
    
    if(isIE){
        //style_string.push("background: -ms-linear-gradient(top, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/the-blueprint.jpg) no-repeat 0 0;");
        style_string.push("background: linear-gradient(to bottom, rgba(255,255,255,0.7) 0%,rgba(255,255,255,0.7) 100%), url(/background_images/tupac.jpg) no-repeat 0 0;");
        style_string.push("background-size: cover;");
    }
    
    console.log(body);
    
    //var body = document.getElementById('body');
    
/*
    for(var i = 0; i < style_string.length; i++){
        document.getElementsByTagName('BODY')[0].style += style_string[i];
    }*/
    
    body.style.background = style_string[0];
    body.style.backgroundSize = style_string[1];
    
    
    console.log(document.getElementById('body'));
}