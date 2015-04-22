'use strict';

/**
 * @ngdoc overview
 * @name rasphiWebappApp
 * @description
 * # rasphiWebappApp
 *
 * Main module of the application.
 */
angular
  .module('rasphiWebappApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ardyh.services',
    'rasphi.services',
    'nvd3ChartDirectives'
  ])


  .constant('ardyhConf', {
      'version':'0.04.21',
      'DATETIME_FORMAT': 'hh:mm:ss tt, ddd MMM dd, yyyy',
      'settings' : {
          'domain': '162.243.146.219:9093',
          'maxHistory': 1500,
          'updateDt':10,
          'botName': 'growbot.solalla.ardyh'
      }
  })

  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

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
            $scope.current.light = data.message.kwargs.light;
            $scope.current.timestamp = new Date(data.message.kwargs.timestamp).toString(ardyhConf.DATETIME_FORMAT);
            
            //$sensorValues.fetch()
            
        });
        
    });

    // $rootScope.$on('graphs-updated', function(event, data){
    //     $scope.graphs = $sensorValues.graphs;
    // });

    $rootScope.$on('ardyh-connection-open', function(event, data){
        $scope.refreshSensorValues();
    })

    
});
angular.module('rasphiWebappApp')
.controller('SettingsCtrl', function($rootScope, $scope, $ardyh, $sensorValues, ardyhConf, $localStorage, $user, $ionicLoading) {

})
'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.

var service = angular.module('ardyh.services', []).
  value('version', '0.1');

// This example is taken from https://github.com/totaljs/examples/tree/master/angularjs-websocket
service.
    service('$ardyh', ['$rootScope', '$timeout', '$http', '$localStorage', 'ardyhConf', 
        function($rootScope, $timeout, $http, $localStorage, ardyhConf) {
    
        
    var obj = this;
    var messages = [];
    var users = [];

    var heartbeat = null; // A JavaScript setInterval that checks for the websocket connection.
    var missedHeartbeats = 0;
    var domain = $localStorage.getObject('settings').domain || ardyhConf.settings.domain;

    this.host =  'ws://'+ domain+'/ws';

    this.sendHandshake = function(botName) {
        var message = {'handshake':true,
                       'bot_name':obj.botName,
                       'subscriptions':['rpi2.solalla.ardyh'],
                       'bot_roles': []
        }
        obj.socket.send(JSON.stringify(message));
    };

    this.init = function(botName){
        obj.botName = botName; 
        obj.host = obj.host + '?' + botName;
        
        obj.socket = new WebSocket(obj.host);

        obj.socket.onopen = function(){
            console.log("connection opened to " + obj.host);
                    
            obj.sendHandshake();

            // Sends a heart beat message to keep the connection open
            if (heartbeat === null) {
                missedHeartbeats = 0;
                heartbeat = setInterval(function() {
                    try {
                        missedHeartbeats++;
                        if (missedHeartbeats >= 3)
                            throw new Error("Too many missed heartbeats.");
                        var msg = {'heartbeat':'', 'bot_name':obj.botName}
                        obj.send(msg);
                    } catch(e) {
                        console.log(e);
                        clearInterval(heartbeat);
                        heartbeat = null;
                        console.warn("Closing connection. Reason: " + e.message);
                        obj.socket.close();
                    }
                }, 5000);
            } // end if heartbeat

            $rootScope.$broadcast('ardyh-connection-open', {})
        }

        obj.socket.onmessage = function(msg) {
            /*
            Listens for
            
            Messages should be of the form 
            data : {
                timestamp : "",
                bot_name : "",
                message : {
                    command
                    kwargs
                }
            }
            */

            try {
                var data = JSON.parse(msg.data);
            } catch(e){
                console.log('[onmessage] Could not parse to JSON. data type is '+typeof(data)+'  Ignoring.');
                console.log(data);
            }

            if ('heartbeat' in data) {
                missedHeartbeats = 0;
                return;
            }

            var command = null;
            try {
              var bot_name = data.bot_name;
              command = data.message.command; 
            } catch (e) {
                console.log("[onmessage] Could not find bot_name or command in message");
                console.log(data);
                return;
            }
            
            if (command === 'sensor_values') {
               console.log("broadcasting new-sensor-values");

               $rootScope.$broadcast('new-sensor-values', data);
            }
        };


        obj.socket.onclose = function(){
            //alert("connection closed....");
            console.log("The connection has been closed. Attempting to reconnect.");
            //obj.init(obj.botName);
        };

        obj.socket.onerror = function(){
            //alert("connection closed....");
            this._log("The was an error.");
            this.showReadyState("error");
        };

    };

    this.send = function(messageObj) {
        if (obj.socket.readyState === 1){
            obj.socket.send(JSON.stringify( messageObj));
        } else {
            console.log("Could not send message, ready state = "+obj.socket.readyState);
            if (obj.socket.readyState === 3){
                // Web socket is closed so try to re-establish connection
                console.log("I should reconnect here.");
                $timeout(function(){
                    obj.init(obj.botName);
                }, 5*1000);
            }
        }
    };

    this.sendCommand = function(command, kwargs){
        kwargs = kwargs || {};
        obj.send({'command':command, 'kwargs':kwargs});
    }

    this.init(ardyhConf.settings.botName);

}])

.service('$sensorValues', ['$rootScope', '$localStorage', '$q', '$http', 'ardyhConf', function($rootScope, $localStorage, $q, $http, ardyhConf) {
    var obj = this;
    this.objects = [];
    this.initGraphs = {
        'temp':[{
            'key':'Temp (C)',
            'values': []
        }],
        'humidity':[{
            'key':'Humidity',
            'values': []
        }],
        'light':[{
            'key':'Light',
            'values': []
        }]
    };
    this.graphs = this.initGraphs;

    this.updateGraphs = function(entity){
        /*
            
            entity
            - 
        */

        try {
            var values = entity.data;
        } catch(e) {
            console.log("Could not find sensor values.")
            console.log(e);
            return;
        }
        // var maxHistory = $localStorage.getObject('settings').maxHistory;
        var maxHistory = ardyhConf.maxHistory;
        var timestamp = new Date(entity.timestamp);
        var light = values.light
        if (typeof(light) === 'number' && light > 10000) light = null;

        obj.graphs.temp[0].values.push([timestamp.valueOf(), values.temp]);
        obj.graphs.humidity[0].values.push([timestamp.valueOf(), values.humidity]);
        obj.graphs.light[0].values.push([timestamp.valueOf(), light]);


        if (obj.graphs.temp[0].values.length > maxHistory){
             obj.graphs.temp[0].values.shift();
        }
        if (obj.graphs.humidity[0].values.length > maxHistory){
             obj.graphs.humidity[0].values.shift();
        }
        if (obj.graphs.light[0].values.length > maxHistory){
             obj.graphs.light[0].values.shift();
        }
        
    }

    this.fetch = function() {
        /*
            Returns a promoise
        */ 
        obj.graphs = obj.initGraphs;
        var defer = $q.defer();
        var botName = "rpi2.solalla.ardyh";
        var resource = "http://ardyh.solalla.com:9093/sensor-values/"+botName+"/?limit="+ardyhConf.settings.maxHistory;



        $http.get(resource)
            .success(function(data, status){
                _.each(data.reverse(), function(entity){
                    obj.updateGraphs(entity);
                });
                defer.resolve(obj.graphs, status);
            })
            .error(function(data, status){
                defer.reject(data, status);
            });
        return defer.promise;

    };

    this.load = function(onLoad){
        if (obj.objects.length > 0){
            onLoad();
            return;
        } 

        //$apigee.init();
        obj.graphs = obj.initGraphs;

    };


    // $rootScope.$on('new-sensor-values', function(event, data){
    //     $rootScope.$apply(function(){
    //         obj.updateGraphs(data);
    //     });
    // });

    $rootScope.$on('max-history-update', function(event, data){
        obj.objects = [];
    });
}])

.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);
"use strict";
var service = angular.module('rasphi.services', []).
  value('version', '0.1');

// This example is taken from https://github.com/totaljs/examples/tree/master/angularjs-websocket
service.service('$user', function( $localStorage){
    var obj = this;

    this.object = {
        username:null,
        token:null,
        profile:null
    };

    this.login = function(username, password, stayLoggedIn, callback){
            var error = null;
            var resp = {};
            callback(error, resp);

    };

    this.load = function(callback){
        obj.object = $localStorage.getObject('user');
        callback(obj.object);
    };
});
'user strict';

angular.module('rasphiWebappApp')
.directive('botGraphs', function($sensorValues){
    return{
        scope:true,
        templateUrl: 'views/partials/bot-graphs.html',
        restrict: 'EA',
        link: function(scope, elem, attrs){

            scope.graphs = {
                'temp':[{
                    'key':'Temp (C)',
                    'values': []
                }],
                'humidity':[{
                    'key':'Humidity',
                    'values': []
                }],
                'light':[{
                    'key':'Light',
                    'values': []
                }]
            };

            //Grab archived data
            $sensorValues.fetch()
            .then(function(data, status){
                console.log("successly fetch sensorValues");
                scope.graphs = $sensorValues.graphs;
            },function(data, status) {
                console.log("failed to fetch sensorValues");
            });

            scope.tempColor = function(){
                return function(d, i) {
                    return '#E01B5D'
                }
            }
        }   
    };
});