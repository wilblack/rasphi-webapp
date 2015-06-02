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


.service('$journal', function($localStorage){
    var obj = this;
    obj.entries = $localStorage.getArray('entries');

    obj.entryTypeChoices = [
        {'value':'other', 'verbose':null, 'color':'#333333', 'icon':'glyphicon glyphicon-record'},
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
        console.log(out)
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
        obj.entries.push(entry);
        $localStorage.setArray('entries', obj.entries);
    }

});