//function to take a path of a css script, create a link tag and append it to the <head> tag
function loadCSSFile(path){
    var head  = document.getElementsByTagName('head')[0];
    var link  = document.createElement('link');
    //link.id   = cssId;
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = path;
    //link.media = 'all';
    head.appendChild(link);
}

//function to take a path of a css script, create a link tag and append it to the <head> tag
function loadJSFile(path){
    var head  = document.getElementsByTagName('head')[0];
    var script  = document.createElement('script');
    //link.id   = cssId;
    //script.rel  = 'javascript';
    //script.type = 'text/js';
    script.src = path;
    head.appendChild(script);
}