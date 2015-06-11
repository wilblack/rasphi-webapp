'use strict';

/**
 * @ngdoc overview
 * @name rasphiWebappApp
 * @description
 * # rasphiWebappApp
 *
 * Main module of the application.
 */

window.isAuthenticated = function($location, $localStorage){
  var ref = new Firebase("https://rasphi.firebaseio.com");
  var authData = ref.getAuth();
  if (authData){
    return true;
  } else {
    $location.path("login")
  }
}

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
    'mgcrea.ngStrap',
    'angular-carousel',
    'nvd3',
    'firebase',
    'firebase.services',
    'angularSpinner'


  ])


  .constant('ardyhConf', {
      'firebaseName': 'rasphi',
      'version':'0.06.07',
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
        controller: 'HomeCtrl',
        resolve: {
            authenticated: isAuthenticated

        }
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
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
      .when('/log-form/:entryId', {
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
