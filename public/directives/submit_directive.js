/*submit_app.directive('actorDirective', function(){
    return {
        restrict: 'AE',
        compile: function(element, attrs){
            element.load('/raw_add_actor', function(data){
            });
        }
    }
});*/

submit_app.directive('actorDirective', function($compile, $http){
    return {
        link: function(scope, element, attrs) {
            $http.get('/raw_add_actor').then(function (result) {
                element.replaceWith($compile(result.data)(scope));
            });
        }
    }
});

submit_app.factory('fileService', function() {
    var files = [];
    return files;
});

submit_app.directive('fileModel', ['$parse', 'fileService', function ($parse, fileService) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            element.bind('change', function(){
                scope.$apply(function(){
                    if (element[0].files != undefined) {
                        fileService.push(element[0].files[0]);
                        console.log('directive applying with file');
                    }
                });
            });
        }
    };
}]);

submit_app.directive("datepicker", function () {
  return {
    restrict: "A",
    require: "ngModel",
    link: function (scope, elem, attrs, ngModelCtrl) {
      var updateModel = function (dateText) {
        scope.$apply(function () {
          ngModelCtrl.$setViewValue(dateText);
        });
      };
      var options = {
        dateFormat: "dd/mm/yy",
        onSelect: function (dateText) {
          updateModel(dateText);
        }
      };
      elem.datepicker(options);
    }
  }
});