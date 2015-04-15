var app = angular.module("rasphiWebappApp");
app.controller("HomeCtrl", function($rootScope, $scope, $ardyh, $sensorValues, ardyhConf, $localStorage, $user) {
    $scope.page = 'home';
    $scope.current = {'botName':'rpi2'};
    $scope.units = {'temp':'f'};

    $scope.current.temp = "--";
    $scope.current.humidity = "--";
    $scope.current.pressure = "--";
    
    $scope.refreshSensorValues = function(){
        console.log("[refreshSensorValues()]");
        $ardyh.sendCommand('read_sensors');
    };
    

    var settings = $localStorage.getObject('settings');
    
    if (typeof(settings.maxHistory) === 'undefined'){
        $localStorage.setObject('settings', ardyhConf.settings);
    }

    $scope.xAxisTickFormatFunction = function(){
        return function(d){
            return new Date(d).toString("MM-dd hh:mm tt");
        };
    };

    $scope.toggleUnits = function(sensor) {
        if (sensor === 'temp') {
            if ($scope.units.temp === 'c') {
                $scope.units.temp = 'f';
            } else {
                $scope.units.temp = 'c';
            }
        }
    };

    $scope.celsius2fahrenheit = function(t){
        return t*(9/5) + 32;
    };
    $rootScope.$on('new-sensor-values', function(event, data){
        $scope.$apply(function(){ // Needed this because the $braodcast is on he $rootScope
            $scope.current.temp = data.message.kwargs.temp;
            $scope.current.humidity = data.message.kwargs.humidity;
            $scope.current.timestamp = new Date(data.message.kwargs.timestamp).toString(ardyhConf.DATETIME_FORMAT);

        });
        
    });

    // $rootScope.$on('graphs-updated', function(event, data){
    //     $scope.graphs = $sensorValues.graphs;
    // });

    // $rootScope.$on('ardyh-connect-open', function(event, data){
    //     $scope.refreshSensorValues();
    // })

    
});