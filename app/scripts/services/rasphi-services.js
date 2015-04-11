var service = angular.module('rasphi.services', []).
  value('version', '0.1');

// This example is taken from https://github.com/totaljs/examples/tree/master/angularjs-websocket
service.service('$user', function( $localStorage){
    obj = this;

    this.object = {
        username:null,
        token:null,
        profile:null,
    };

    this.login = function(username, password, stayLoggedIn, callback){
            var error = null;
            var resp = {};
            callback(error, resp);

    }

    this.load = function(callback){
        obj.object = $localStorage.getObject('user');
        callback(obj.object);
    }
})