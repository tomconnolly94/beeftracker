/* Handle loading css scripts that apply to all pages */
css_scripts = [
    //fonts
    "https://fonts.googleapis.com/css?family=Abel",
    "https://fonts.googleapis.com/css?family=Josefin+Slab",
    "/stylesheets/fonts/amatic_font.css",
    //bootstrap
    "/modules/bootstrap/dist/css/bootstrap.min.css",
    "/modules/bootstrap/dist/css/bootstrap-theme.min.css",
    //angular-loading-bar
    "/modules/angular-loading-bar/build/loading-bar.min.css",
    //global styles
    "/stylesheets/house_styles.css",
    "/stylesheets/header.css",
    "/stylesheets/images.css",
]

var head  = document.getElementsByTagName('head')[0];

for(var i = 0; i < css_scripts.length; i++){
    
    var link  = document.createElement('link');
    link.rel  = 'stylesheet';
    link.type = 'text/css';
    link.href = css_scripts[i];
    link.media = 'all';
    head.appendChild(link);
}

/* Handle meta tags and browser data */


var meta  = document.createElement('meta');
meta.name  = 'description';
meta.content = "Beeftracker is a brand new way to read the news, working from crowd sourced data it aims to put news events back into their context by stringing them together in a timeline. Check it out now!";
head.appendChild(meta);


var meta  = document.createElement('meta');
meta.charset = "utf-8";
head.appendChild(meta);


var link  = document.createElement('link');
link.rel = "shortcut icon";
link.href = "/logo/v2/beeftracker_new_logo_cropped_small.ico"
head.appendChild(link);


var link  = document.createElement('meta');
link.name = "viewport";
link.content = "width=device-width, initial-scale=1";
head.appendChild(link);