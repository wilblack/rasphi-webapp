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
        {'value':'other', 'verbose':"Info", 'color':'#333333', 'icon':'glyphicon glyphicon-info-sign'},
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

    obj.getEntryById = function(entryId){
        return obj.entries.$getRecord(entryId);
    }

    obj.save = function(entry){
        var timestampStr = entry.date.split("T")[0] + "T" + entry.time.split("T")[1];
        entry.timestamp = Date.parse(timestampStr).getTime();
        entry.timestamp_reverse = -entry.timestamp;
        console.log(entry)
        if (entry.$id) {
            obj.entries.$save(entry);
        } else {
            obj.entries.$add(entry);
        }


        
        //$localStorage.setArray('entries', obj.entries);
    }

});