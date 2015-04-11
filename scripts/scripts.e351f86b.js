"use strict";angular.module("rasphiWebappApp",["ngAnimate","ngCookies","ngResource","ngRoute","ngSanitize","ngTouch","ardyh.services","rasphi.services","nvd3ChartDirectives"]).constant("ardyhConf",{DATETIME_FORMAT:"hh:mm:ss tt, ddd MMM dd, yyyy",settings:{domain:"162.243.146.219:9093",maxHistory:500,updateDt:10,botName:"growbot.solalla.ardyh"}}).config(["$routeProvider",function(a){a.when("/",{templateUrl:"views/home.html",controller:"HomeCtrl"}).when("/about",{templateUrl:"views/about.html",controller:"AboutCtrl"}).when("/settings",{templateUrl:"views/settings.html",controller:"SettingsCtrl"}).otherwise({redirectTo:"/"})}]),angular.module("rasphiWebappApp").controller("HomeCtrl",["$rootScope","$scope","$ardyh","$sensorValues","ardyhConf","$localStorage","$user",function(a,b,c,d,e,f,g){b.page="home",b.current={botName:"rpi2"},b.units={temp:"f"},b.current.temp="--",b.current.humidity="--",b.current.pressure="--",b.refreshSensorValues=function(){console.log("[refreshSensorValues()]"),c.sendCommand("read_sensors")},b.graphs={temp:[{key:"Temp (C)",values:[]}],humidity:[{key:"Humidity",values:[]}],light:[{key:"Light",values:[]}]};var h=f.getObject("settings");"undefined"==typeof h.maxHistory&&f.setObject("settings",e.settings),d.load(function(){b.refreshSensorValues(),b.graphs=d.graphs}),b.xAxisTickFormatFunction=function(){return function(a){return new Date(a).toString("hh:mm tt")}},b.toggleUnits=function(a){"temp"===a&&(b.units.temp="c"===b.units.temp?"f":"c")},b.celsius2fahrenheit=function(a){return 1.8*a+32},a.$on("new-sensor-values",function(a,c){b.$apply(function(){b.current.temp=c.message.kwargs.temp,b.current.humidity=c.message.kwargs.humidity,b.current.timestamp=new Date(c.message.kwargs.timestamp).toString(e.DATETIME_FORMAT)})}),a.$on("graphs-updated",function(a,c){b.graphs=d.graphs}),a.$on("ardyh-connect-open",function(a,c){b.refreshSensorValues()})}]),angular.module("rasphiWebappApp").controller("SettingsCtrl",["$rootScope","$scope","$ardyh","$sensorValues","ardyhConf","$localStorage","$user","$ionicLoading",function(a,b,c,d,e,f,g,h){}]);var service=angular.module("ardyh.services",[]).value("version","0.1");service.service("$ardyh",["$rootScope","$timeout","$http","$localStorage","ardyhConf",function(a,b,c,d,e){var f=this,g=null,h=0,i=d.getObject("settings").domain||e.settings.domain;this.host="ws://"+i+"/ws",this.sendHandshake=function(a){var b={handshake:!0,bot_name:f.botName,subscriptions:["rpi2.solalla.ardyh"],bot_roles:[]};f.socket.send(JSON.stringify(b))},this.init=function(b){f.botName=b,f.host=f.host+"?"+b,f.socket=new WebSocket(f.host),f.socket.onopen=function(){console.log("connection opened to "+f.host),f.sendHandshake(),null===g&&(h=0,g=setInterval(function(){try{if(h++,h>=3)throw new Error("Too many missed heartbeats.");var a={heartbeat:"",bot_name:f.botName};f.send(a)}catch(b){console.log(b),clearInterval(g),g=null,console.warn("Closing connection. Reason: "+b.message),f.socket.close()}},5e3)),a.$broadcast("ardyh-connection-open",{})},f.socket.onmessage=function(b){try{var c=JSON.parse(b.data)}catch(d){console.log("[onmessage] Could not parse to JSON. data type is "+typeof c+"  Ignoring."),console.log(c)}if("heartbeat"in c)return void(h=0);var e=null;try{{c.bot_name}e=c.message.command}catch(d){return console.log("[onmessage] Could not find bot_name or command in message"),void console.log(c)}"sensor_values"===e&&(console.log("broadcasting new-sensor-values"),a.$broadcast("new-sensor-values",c))},f.socket.onclose=function(){console.log("The connection has been closed. Attempting to reconnect.")},f.socket.onerror=function(){this._log("The was an error."),this.showReadyState("error")}},this.send=function(a){1===f.socket.readyState?f.socket.send(JSON.stringify(a)):(console.log("Could not send message, ready state = "+f.socket.readyState),3===f.socket.readyState&&(console.log("I should reconnect here."),b(function(){f.init(f.botName)},5e3)))},this.sendCommand=function(a,b){b=b||{},f.send({command:a,kwargs:b})},this.init(e.settings.botName)}]).service("$sensorValues",["$rootScope","$localStorage",function(a,b){var c=this;this.objects=[],this.initGraphs={temp:[{key:"Temp (C)",values:[]}],humidity:[{key:"Humidity",values:[]}],light:[{key:"Light",values:[]}]},this.graphs=this.initGraphs,this.updateGraph=function(a){try{var d=a.message.kwargs}catch(e){return console.log("Could not find sensor values."),void console.log(e)}var f=b.getObject("settings").maxHistory,g=new Date(a.timestamp),h=d.light;"number"==typeof h&&h>1e4&&(h=null),c.graphs.temp[0].values.push([g.valueOf(),d.temp]),c.graphs.humidity[0].values.push([g.valueOf(),d.humidity]),c.graphs.light[0].values.push([g.valueOf(),h]),c.graphs.temp[0].values.length>f&&c.graphs.temp[0].values.shift(),c.graphs.humidity[0].values.length>f&&c.graphs.humidity[0].values.shift(),c.graphs.light[0].values.length>f&&c.graphs.light[0].values.shift()},this.load=function(a){return c.objects.length>0?void a():void(c.graphs=c.initGraphs)},a.$on("new-sensor-values",function(b,d){a.$apply(function(){c.updateGraph(d)})}),a.$on("max-history-update",function(a,b){c.objects=[]})}]).factory("$localStorage",["$window",function(a){return{set:function(b,c){a.localStorage[b]=c},get:function(b,c){return a.localStorage[b]||c},setObject:function(b,c){a.localStorage[b]=JSON.stringify(c)},getObject:function(b){return JSON.parse(a.localStorage[b]||"{}")}}}]);var service=angular.module("rasphi.services",[]).value("version","0.1");service.service("$user",["$localStorage",function(a){obj=this,this.object={username:null,token:null,profile:null},this.login=function(a,b,c,d){var e=null,f={};d(e,f)},this.load=function(b){obj.object=a.getObject("user"),b(obj.object)}}]);