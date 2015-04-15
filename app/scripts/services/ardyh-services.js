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
        var maxHistory = $localStorage.getObject('settings').maxHistory;
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

        var defer = $q.defer();
        var botName = "rpi2.solalla.ardyh";
        var resource = "http://ardyh.solalla.com:9093/sensor-values/"+botName+"/?limit="+ardyhConf.settings.maxHistory;
        var data = {
            "limit":500,
        };


        $http.get(resource)
            .success(function(data, status){
                _.each(data, function(entity){
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