;(function(angular) {
  "use strict";

angular.module("testApp")
  .controller("ContentCtrl", function($stateParams, $location){
    this.stateParams = $stateParams;
    this.locationParams = $location.search();
    this.bbqParams = $.deparam.querystring();
    this.date = new Date();
  });

  angular.module("testApp").provider("UrlPathWhitelist", function() {
    var whitelist = {};

    this.add = function(name, regex) {
      whitelist[name] = regex;
    };

    this.$get = function() {
      return whitelist;
    };
  });

  angular.module("testApp")
    .config([
      "$stateProvider",
      "UrlPathWhitelistProvider",
      function($stateProvider, UrlPathWhitelistProvider) {
        var stateFn = $stateProvider.state;

        $stateProvider.state = function() {
          var definition = arguments[1];

          if (!definition.abstract && definition.url && definition.pathRegex) {
            var name = arguments[0];
            var pathRegex = definition.pathRegex;
            UrlPathWhitelistProvider.add(name, pathRegex);
          }

          return stateFn.apply(this, arguments);
        };
      }
    ]);


  angular.module("testApp").config([
    "$stateProvider",
    "$urlRouterProvider",
    function($stateProvider, $urlRouterProvider) {
      $stateProvider
        .state("search", {
          url: "/search?q&int&float&str&{date:any}",
          pathRegex: /(^\/search)/,
          views: {
            "header": {
              templateUrl: "views/headers/header2.html"
            },
            "content": {
              templateUrl: "views/contents/search.html",
              controller: "ContentCtrl",
              controllerAs: "searchPage"
            }
          },
          data: {
            pageTitle: "Search page"
          },
          reloadOnSearch: true
        })
        .state("details", {
          url: "/details",
          pathRegex: /(^\/details)/,
          views: {
            "content": {
              templateUrl: "views/contents/details.html",
              controller: "ContentCtrl",
              controllerAs: "detailsPage"
            },
            "footer": {
              templateUrl: "views/footers/footer2.html"
            }
          },
          data: {
            pageTitle: "Details page"
          }
        });
    }
  ]);

  angular.module("testApp").config([
    "$uiViewScrollProvider",
    function($uiViewScrollProvider) {
      $uiViewScrollProvider.useAnchorScroll();
    }
  ]);

  // var android =
  //     int((/android (\d+)/.exec(lowercase((window.navigator || {}).userAgent)) || [])[1]),
  //   boxee = /Boxee/i.test(($window.navigator || {}).userAgent);
  var history = !!(window.history && window.history.pushState);

  angular.module("testApp").config([
    "$locationProvider",
    function($locationProvider) {
      var origGet = $locationProvider.$get[4];

      $locationProvider.$get = [
        "$rootScope",
        "$browser",
        "$sniffer",
        "$rootElement",
        function($rootScope, $browser, $sniffer, $rootElement) {
          var sniffer = $sniffer;
          if (!sniffer.history) {
            sniffer = {history: true};
          }
          return origGet($rootScope, $browser, sniffer, $rootElement);
        }
      ];

      $locationProvider.html5Mode(true);
    }
  ]);

  angular.module("testApp").run([
    "$window",
    "$location",
    "$rootScope",
    "UrlPathWhitelist",
    "$urlRouter",
    "$state",
    function($window, $location, $rootScope, UrlPathWhitelist, $urlRouter, $state) {
      var shouldRefresh = false;

      $rootScope.$on("$locationChangeStart", function(event, newUrl) {
        console.info("locationChangeStart");

        var path = $location.path();

        var stateName = null;
        for (var name in UrlPathWhitelist) {
          var regex = UrlPathWhitelist[name];
          if (regex.test(path)) {
            stateName = name;
            break;
          }
        }

        shouldRefresh = shouldRefresh || stateName == null;
        if (shouldRefresh) {
          event.preventDefault();
          $window.location.href = newUrl;
          return;
        }

      });

      $rootScope.$on("$stateChangeStart", function(event, toState, toParams) {
        if (shouldRefresh) {
          event.preventDefault();
          $window.location.href = $state.href(toState, toParams);
          return;
        }
        if (!history && !shouldRefresh) {
          shouldRefresh = true;
        }
      });
    }
  ]);

  angular.module("testApp").run([
    "$log",
    "$rootScope",
    function($log, $rootScope) {
      $rootScope.$on("$stateChangeSuccess", function(event, toState) {
        $rootScope.stateData = toState.data;
      });
    }
  ]);

})(angular);