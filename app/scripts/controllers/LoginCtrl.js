angular.module('rasphiWebappApp')
.controller('LoginCtrl', function($scope, ardyhConf, $localStorage, $location) {
    $scope.page = 'login';

    $scope.loginData = {
        email: '',
        password: '',
        stayLoggedIn: false,
    };

    $scope.authenticate = function(){
        var ref = new Firebase("https://"+ardyhConf.firebaseName+".firebaseio.com");
        $scope.errorMsg = "";
        ref.authWithPassword({
          email    : $scope.loginData.email,
          password : $scope.loginData.password
        }, function(error, authData) {
          if (error) {
            console.log("Login Failed!", error);
            $scope.errorMsg = "Login Failed.";
            $scope.loginData = {
                email: '',
                password: '',
                stayLoggedIn: false
            };
          } else {
            console.log("Authenticated successfully with payload:", authData);
            $localStorage.setObject('user', authData);
            $location.path("journal");
          }
        });
    }
});