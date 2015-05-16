var app = angular.module("rasphiWebappApp");
app.controller("LogFormCtrl", function($rootScope, $scope, $ardyh, $sensorValues, ardyhConf, $localStorage, $user) {
    $scope.page = 'log-form';


    $scope.entryChoices = [
        {'vallue':'other', 'verbose':'----'},
        {'value':'feed', 'verbose':'Feeding'},
        {'value':'water', 'verbose':'Watering'},
        {'value':'spray', 'verbose':'Spray'},
        {'value':'humidty', 'verbose':'Humidity Change'},
        {'vallue':'light', 'verbose':'Lighting Change'}
    ];   

    $scope.entry = {
        "timestamp":new Date(),
        "entry":"",
        "type":"other"  
    };


});