/* Handle loading css scripts that apply to all pages */
js_scripts = [
    "/modules/jquery/dist/jquery.min.js",
    "/js/globals.js",
    "/modules/angular/angular.min.js",
    "/modules/angular-resource/angular-resource.min.js"
]

//var head  = document.getElementsByTagName("head")[0];
var head  = document.getElementById("script_wrapper");

for(var i = 0; i < js_scripts.length; i++){
    
    var link  = document.createElement('script');
    link.type = 'text/javascript';
    link.src = js_scripts[i];
    head.appendChild(link);
}