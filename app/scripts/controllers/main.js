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

    this.redirectTo = function(href) {
      console.info("redirectTo");
      $window.location.href = href;
    };

    this.changeLocation = function(href, params) {
      console.info("changeLocation");
      if (params == null) {
        params = {};
      }
      $location.path(href).search(params);
    };

    this.stateGo = function(stateName, stateParams, stateOptions) {
      console.info("state.go");
      if (stateParams == null) {
        stateParams = {};
      }
      if (stateOptions == null) {
        stateOptions = {};
      }
      $state.go(stateName, stateParams, stateOptions);
    }
  });
