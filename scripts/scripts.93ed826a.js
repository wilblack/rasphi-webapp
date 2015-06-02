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
    'growbot.services',
    'nvd3ChartDirectives',
    'mgcrea.ngStrap',
    'angular-carousel',

    'firebase',
    'firebase.services',

  ])


  .constant('ardyhConf', {
      'firebaseName': 'rasphi',
      'version':'0.06.02',
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
      .when('/journal', {
        templateUrl: 'views/journal.html',
        controller: 'JournalCtrl'
      })

      .when('/log-form', {
        templateUrl: 'views/log-form.html',
        controller: 'LogFormCtrl'
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
app.controller("HomeCtrl", function($rootScope, $scope, $ardyh, $sensorValues, $images, ardyhConf, $localStorage, $user) {
    $scope.page = 'home';
    $scope.ardyhConf = ardyhConf;
    $scope.current = {'botName':'rpi2'};
    $scope.units = {'temp':'f'};
    $scope.images = [];
    
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
        $scope.images = data.slice(-12).reverse();
    }, function(data, status){
        
    });



    $rootScope.$on('ardyh-connection-open', function(event, data){
        $scope.refreshSensorValues();
    })

    
});
angular.module('rasphiWebappApp')
.controller('SettingsCtrl', function($rootScope, $scope, $ardyh, $sensorValues, ardyhConf, $localStorage, $user, $ionicLoading) {

})
var app = angular.module("rasphiWebappApp");
app.controller("LogFormCtrl", function($rootScope, $scope, $journal, ardyhConf, $ardyh, $user, $location) {
    $scope.page = 'log-form';


    $scope.entryChoices = $journal.entryTypeChoices;
   

    $scope.getTimestamp = function(){
        var now = new Date();
        return now.toISOString();
    }
    $scope.entry = {
        "date": $scope.getTimestamp(),
        "time": $scope.getTimestamp(),
        "entry":"",
        "type":"other",
        "id": null
    };


    $scope.saveEntry = function(){
        var entry = angular.copy($scope.entry);
        if (!entry.id) {
            entry.id = $ardyh.generateUUID();
        } 
        $journal.save(entry);
        $location.path("journal");
    }


});
var app = angular.module("rasphiWebappApp");
app.controller("JournalCtrl", function($rootScope, $scope, $journal, ardyhConf, $user, ardyhConf) {
    $scope.page = 'journal';
    $scope.ardyhConf = ardyhConf;
    $scope.journal = $journal;

    $scope.type2color = function(type){
        var color = $journal.type2color(type);
        return {'color':color};
    };

    $scope.type2icon = function(type){
        var icon = $journal.type2icon(type);
        return icon;
        
    };

});
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

    this.generateUUID = function() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };
    this.init(ardyhConf.settings.botName);

}])

.service('$images',['$rootScope', '$http', '$q', '$ardyh', 'ardyhConf', function($rootScope, $http, $q, $ardyh, ardyhConf){
    var obj = this;
    obj.url = "http://ardyh.solalla.com/growbot";
    
    this.fetchList = function(){
        var defer = $q.defer();
        $http.get(obj.url)
            .success(function(data, status){
                var hrefs = data.match(/href="([^"]*")/g)
                var out = _.map(hrefs, function(href){
                    var pieces = href.split('href="')
                    if (pieces.length == 2 ){
                        return obj.url + "/" + pieces[1].replace('"', '');
                    } else {
                        return null;
                    }
                });
                out = _.compact(out);
                defer.resolve(out, status);
            })
            .error(function(data, status){
                defer.reject(data, status);
            });
        return defer.promise;
    };

    this.captureImage = function(){

        $ardyh.sendCommand('capture_image',{})
    }


}])

.service('$sensorValues', ['$rootScope', '$localStorage', '$q', '$http', 'ardyhConf', function($rootScope, $localStorage, $q, $http, ardyhConf) {
    var obj = this;
    this.status = '';
    this.objects = [];
    this.initGraphs = {
        'temp':[{
            'key':'Temp (F)',
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
            - timestamp
            - data
              - light
              - temp
              - humidity
        */

        if (obj.status === 'pending') return;

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

        var light = values.light;
        var temp = values.temp;
        var humidity = values.humidity;
        
        if (typeof(temp) === 'number') temp = temp * (9/5) + 32;
        if (typeof(light) === 'number' && light > 10000) light = null;

        if (temp === 0) temp = null;
        if (humidity === 0) humidity = null;

        obj.graphs.temp[0].values.push([timestamp.valueOf(), temp]);
        obj.graphs.humidity[0].values.push([timestamp.valueOf(), humidity]);
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

    this.clearGraphs = function(){
        _.each(obj.graphs.temp[0].values, function(){
            obj.graphs.temp[0].values.shift();
        });
        _.each(obj.graphs.light[0].values, function(){
            obj.graphs.light[0].values.shift();
        });
        _.each(obj.graphs.humidity[0].values, function(){
            obj.graphs.humidity[0].values.shift();
        });
    }

    this.fetch = function(filters) {
        /*
            Returns a promoise
        */ 
        obj.status = 'pending';
        obj.clearGraphs();


        var defer = $q.defer();
        var botName = "rpi2.solalla.ardyh";
        var resource = "http://ardyh.solalla.com:9093/sensor-values/"+botName+"/?b=";
        var value;

        if (filters){
            for (var filter in filters){
                console.log(filter);
                value = filters[filter];
                resource = resource + "&"+filter+"="+value;
            }
            console.log(resource);
        }

        $http.get(resource)
            .success(function(data, status){
                obj.status = '';
                _.each(data.reverse(), function(entity){
                    obj.updateGraphs(entity);
                });
                defer.resolve(obj.graphs, status);
            })
            .error(function(data, status){
                obj.status = '';
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
    },
    setArray: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getArray: function(key) {
      return JSON.parse($window.localStorage[key] || '[]');
    }
  }
}]);
"use strict";
var service = angular.module('growbot.services', []).
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
})


.service('$journal', function($localStorage, $fbJournal){
    var obj = this;
    obj.entries = $fbJournal.data;

    obj.entryTypeChoices = [
        {'value':'other', 'verbose':null, 'color':'#333333', 'icon':'glyphicon glyphicon-info-sign'},
        {'value':'feed', 'verbose':'Feeding', 'color':'#00FF00', 'icon':'glyphicon glyphicon-leaf'},
        {'value':'water', 'verbose':'Watering', 'color':'#0000FF', 'icon':'glyphicon glyphicon-tint'},
        {'value':'spray', 'verbose':'Spray', 'color':'#0077FF', 'icon':'glyphicon glyphicon-certificate'},
        {'value':'humidty', 'verbose':'Humidity Change', 'color':'#00FFFF', 'icon':'glyphicon glyphicon-cloud'},
        {'value':'light', 'verbose':'Lighting Change', 'color':'#FF7700', 'icon':'glyphicon glyphicon-lamp'}
    ];   
    
    obj.type2color = function(type) {
        var out = null;
        out = _.find(obj.entryTypeChoices, function(item){
            return (item.value === type);
        });
        return out.color;
    };

    obj.type2icon = function(type) {
        var out = null;
        out = _.find(obj.entryTypeChoices, function(item){
            return (item.value === type);
        });
        return out.icon;
    };


    obj.save = function(entry){
        obj.entries.$add(entry);
        
        //$localStorage.setArray('entries', obj.entries);
    }

});
'use strict';

var service = angular.module('firebase.services', []).
  value('version', '1.0');

service.service( '$firebaseApi', ['$rootScope', 
                           '$http', 
                           '$q', 
                           'ardyhConf', 
                           '$bot', 
                           '$group', 
                           '$user', 
                 function($rootScope, 
                          $http, 
                          $q, 
                          ardyhConf, 
                          $bot, 
                          $group,
                          $user,
                          $journal
) {

    var obj = this;
    this.bot = $bots;
    this.user = $user;
    this.group = $group;
    this.journal = $journal;
}])


.service( '$bot', ['$rootScope', '$http', '$q', '$firebaseArray', 'ardyhConf', function($rootScope, $http, $q, $firebaseArray, ardyhConf) {
    var obj = this;
    this.name = 'bot'
    this.ref = new Firebase("https://"+ardyhConf.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref);
}])

.service( '$group', ['$rootScope', '$http', '$q', '$firebaseArray', 'ardyhConf', function($rootScope, $http, $q, $firebaseArray, ardyhConf) {
    var obj = this;
    this.name = 'group'
    this.ref = new Firebase("https://"+ardyhConf.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref);
}])

.service( '$user', ['$rootScope', '$http', '$q', '$firebaseArray', 'ardyhConf', function($rootScope, $http, $q, $firebaseArray, ardyhConf) {
    var obj = this;
    this.name = 'user'
    this.ref = new Firebase("https://"+ardyhConf.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref);
}])

.service( '$fbJournal', ['$rootScope', '$http', '$q', '$firebaseArray', 'ardyhConf', function($rootScope, $http, $q, $firebaseArray, ardyhConf) {
    var obj = this;
    this.name = 'journal'
    this.ref = new Firebase("https://"+ardyhConf.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref.orderByChild('date'));
}])
'user strict';

angular.module('rasphiWebappApp')
.directive('botGraphs', function($sensorValues){
    return{
        scope:true,
        templateUrl: 'views/partials/bot-graphs.html',
        restrict: 'EA',
        link: function(scope, elem, attrs){
            var emptyGraphs = {
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

            scope.graphs = emptyGraphs;

            //Grab archived data


            // $sensorValues.fetch()
            // .then(function(data, status){
            //     console.log("successly fetch sensorValues");
            //     scope.graphs = $sensorValues.graphs;
            // },function(data, status) {
            //     console.log("failed to fetch sensorValues");
            // });

            scope.tempColor = function(){
                

                return function(d, i) {
                    var color = "#408E2F";
                    return color;
                }
            };


            scope.xAxisTickFormatFunction = function(){
                return function(d){
                    return new Date(d).toString("ddd hh:mmt");
                };
            };

            scope.timeFilterCallback = function(value) {
                
                scope.timestampFilter = value;
                var now = new Date();
                var days = value.split("-")[1];
                var then = now.addDays(-parseInt(days, 10)).addHours(-7);
                console.log("then: ", then.toISOString());
                var filters = {
                    "timestamp_gte":then.toISOString()
                };
                
                $sensorValues.fetch(filters)
                .then(function(data, status){
                    console.log("successly fetch sensorValues: ", $sensorValues.graphs.temp[0].values.length);
                    scope.graphs = emptyGraphs;
                    scope.graphs = $sensorValues.graphs;
                },function(data, status) {
                    console.log("failed to fetch sensorValues");
                });
            };

            scope.timeFilterCallback('last-1-days');
        }   
    };
})

.directive('changeDirection', function($sensorValues){
    return{
        scope:{
            previous: "=",
            current: "="
            },
        templateUrl: 'views/partials/change-direction.html',
        restrict: 'EA',
        link: function(scope, elem, attrs){

            
        }
    };
});

