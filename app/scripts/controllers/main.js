"use strict";

/**
 * @ngdoc function
 * @name testApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the testApp
 */
angular.module("testApp")
  .controller("MainCtrl", [
    "$location",
    "$window",
    "$state",
    "RouteHelper",
    function ($location, $window, $state, RouteHelper) {
      this.redirectTo = function(path, search) {
        RouteHelper.redirectTo(path, search);
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
          reload: true,
        });
      };
    }
  ])

  .factory("UrlHelper", [
    function() {
      return {
        cleanSearch: function(searchStr) {
          return searchStr
            .replace(/\+/g,"%20")
            .replace(/%40/gi, "@")
            .replace(/%3A/gi, ":")
            .replace(/%24/g, "$")
            .replace(/%2C/gi, ",");
        },
        getUrl: function(path, search, hash) {
          var url = path;
          if (search != null) {
            var searchStr = $.param(search);
            // Prevent extra location.replace that might hurt performance on nonHtml5 browsers
            url = url + "?" + this.cleanSearch(searchStr);
          }
          if (hash != null) {
            url += "#" + hash;
          }
          return url;
        },
        cleanUrl: function(url) {
          return $.param.querystring(url, this.cleanSearch($.param.querystring(url)), 2);
        }
      };
    }
  ])

  .factory("RouteHelper", ["$window", "UrlHelper",
    function($window, UrlHelper) {
      return {
        redirectTo: function(path, search, hash) {
          $window.location.href = UrlHelper.getUrl(path, search, hash);
          return;
        },
        redirectToUrl: function(url) {
          $window.location.href = UrlHelper.cleanUrl(url);
          return;
        }
      };
    }
  ]);
