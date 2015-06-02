'use strict';

var service = angular.module('firebase.services', []).
  value('version', '1.0');

service.service( '$firebaseApi', ['$rootScope', 
                           '$http', 
                           '$q', 
                           'config', 
                           '$bot', 
                           '$group', 
                           '$user', 
                 function($rootScope, 
                          $http, 
                          $q, 
                          config, 
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


.service( '$bot', ['$rootScope', '$http', '$q', '$firebaseArray', 'config', function($rootScope, $http, $q, $firebaseArray, config) {
    var obj = this;
    this.name = 'bot'
    this.ref = new Firebase("https://"+config.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref);
}])

.service( '$group', ['$rootScope', '$http', '$q', '$firebaseArray', 'config', function($rootScope, $http, $q, $firebaseArray, config) {
    var obj = this;
    this.name = 'group'
    this.ref = new Firebase("https://"+config.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref);
}])

.service( '$user', ['$rootScope', '$http', '$q', '$firebaseArray', 'config', function($rootScope, $http, $q, $firebaseArray, config) {
    var obj = this;
    this.name = 'user'
    this.ref = new Firebase("https://"+config.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref);
}])

.service( '$journal', ['$rootScope', '$http', '$q', '$firebaseArray', 'config', function($rootScope, $http, $q, $firebaseArray, config) {
    var obj = this;
    this.name = 'journal'
    this.ref = new Firebase("https://"+config.firebaseName+".firebaseio.com/" + obj.name);
    this.data = $firebaseArray(this.ref);
}])