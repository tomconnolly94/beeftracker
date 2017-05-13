/////////////////////////////////////////////////////////////////////////////////
//
//  File: formController.js
//  Project: beeftracker
//  Contributors: Tom Connolly
//  Description: Handles all the interactions necessary to recieve, display, 
//                  format and send new beef data submitteed by a user
//
/////////////////////////////////////////////////////////////////////////////////
subscribe_app.controller('subscribeFormController', ['$scope','$http', '$window', function($scope, $http, $window) {
    
    //create var 
    $scope.form_data = {};
    $scope.email_address = "";
    $scope.route_here_options = [
        "Google search",
        "Online Advert",
        "Other Advert",
        "Through a friend",
        "Other"
    ];
    $scope.error_message = "";

    //function to process, format and send all form data to servers
    $scope.process_form = function() {
        
        if($scope.email_address.length > 0 &&  $scope.subscribe_form.email_address.$valid){
            
            $scope.form_data.name = $scope.name;
            $scope.form_data.email_address = $scope.email_address;
            $scope.form_data.routes_here = $scope.routes_here;
            
            console.log($scope.form_data);
            
            return $http({
                method: 'POST',
                url: "/submit_subscription",
                data: $scope.form_data
            })
            .then(function(){
                console.log("Upload succeeded.");
                $window.location.href = '/submission_confirmation';
            }, function () {
                console.log("Upload failed.");
            });
        }
    };
    
}]);