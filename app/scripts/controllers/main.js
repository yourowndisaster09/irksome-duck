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
        var searchStr = $.param(search);
        // Prevent extra location.replace that might hurt performance on nonHtml5 browsers
        searchStr = searchStr.replace(/\+/g,'%20');
        url = url + '?' + searchStr;
      }
      return url;
    };

    this.redirectTo = function(path, search) {
      $window.location.href = this.getUrl(path, search);
    };

    this.changeLocation = function(path, search) {
      if (search == null) {
        search = {};
      } 
      $location.path(path).search(search);
    };

    this.stateGo = function(stateName, stateParams) {
      if (stateParams == null) {
        stateParams = {};
      }
      $state.go(stateName, stateParams, {
        inherit: false,
        reload: true
      });
    };
  });
