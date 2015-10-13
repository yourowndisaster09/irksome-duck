'use strict';

/**
 * @ngdoc function
 * @name testApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module('testApp')
  .controller('MainCtrl', function ($location, $window, $state) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    this.getUrl = function(path, search) {
      var url = path;
      if (search != null) {
        url = url + '?' + $.param(search);
      }
      return url;
    };

    this.redirectTo = function(path, search) {
      $window.location.href = this.getUrl(path, search);
    };

    this.changeLocation = function(path, search) {
      var something = $location.path(path);
      if (search == null) {
        something.search(search);
      }
    };

    this.stateGo = function(stateName, stateParams, stateOptions) {
      if (stateParams == null) {
        stateParams = {};
      }
      if (stateOptions == null) {
        stateOptions = {};
      }
      $state.go(stateName, stateParams, stateOptions);
    }
  });
