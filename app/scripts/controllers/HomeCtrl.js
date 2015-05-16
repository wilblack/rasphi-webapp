var app = angular.module("rasphiWebappApp");
app.controller("HomeCtrl", function($rootScope, $scope, $ardyh, $sensorValues, $images, ardyhConf, $localStorage, $user) {
    $scope.page = 'home';
    $scope.ardyhConf = ardyhConf;
    $scope.current = {'botName':'rpi2'};
    $scope.units = {'temp':'f'};

    $scope.previous = {};
    $scope.previous.temp = 0;
    $scope.current.temp = "--";
    $scope.current.humidity = "--";
    $scope.current.pressure = "--";
    $scope.carouselIndex = 1;

    $scope.captureImage = function(){
        $images.captureImage();
    }

    $scope.refreshSensorValues = function(){
        console.log("[refreshSensorValues()]");
        $ardyh.sendCommand('read_sensors');
    };
    

    var settings = $localStorage.getObject('settings');
    
    if (typeof(settings.maxHistory) === 'undefined'){
        $localStorage.setObject('settings', ardyhConf.settings);
    }


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
            $scope.previous = angular.copy($scope.current);

            $scope.current.temp = data.message.kwargs.temp;
            $scope.current.humidity = data.message.kwargs.humidity;
            $scope.current.light = data.message.kwargs.light;
            $scope.current.timestamp = new Date(data.message.kwargs.timestamp).toString(ardyhConf.DATETIME_FORMAT);
            
            var entity = {
                timestamp: data.message.kwargs.timestamp,
                data: $scope.current
            };
            $sensorValues.updateGraphs(entity);
            
        });
        
    });

    $images.fetchList()
    .then(function(data, status){
        $scope.images = data.slice(-10).reverse();
    }, function(data, status){

    });

    // $rootScope.$on('graphs-updated', function(event, data){
    //     $scope.graphs = $sensorValues.graphs;
    // });

    $rootScope.$on('ardyh-connection-open', function(event, data){
        $scope.refreshSensorValues();
    })

    
});