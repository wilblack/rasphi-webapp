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
      'version':'0.06.02b',
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
