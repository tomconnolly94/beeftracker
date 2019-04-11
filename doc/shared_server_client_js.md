# Sharing JavaScript between the server and client


* When sharing javascript between the server and client there is a special format it must follow.

## Instructions

* JavaScript files must be stored in /public/javascript/server_client_common/
* Code function must be wrapped in a $(function(){})() wrapper as below:

```
(function(exports){

    exports.SHARED_FUNCTION = function(PARAMETER){
    
    };

})(typeof exports === 'undefined'? this['MODULE_NAME'] = {}: exports);

```

* This format formats the function as a property of `module.exports` (or just `exports`) for the server side, the module can then be accessed in the normal nodejs way using a `require()` call. 
* If no `exports` object is available, then it formats the function as a property of `this["MODULE_NAME"]` which, when run in the browser is assigned to the browsers `window` object, and can therefore be accessed via `window["MODULE_NAME"].SHARED_FUNCTION`.
