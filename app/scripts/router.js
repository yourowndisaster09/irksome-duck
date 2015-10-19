;(function(angular) {
  "use strict";

angular.module("testApp")
  .controller("ContentCtrl", function($stateParams, $location){
    console.error("SHOULD RUN ONCE PER PAGE LOAD!!!!!!!!!!!!!!!!!!!!!");
    this.stateParams = $stateParams;
    this.locationParams = $location.search();
    this.bbqParams = $.deparam.querystring();
    this.date = new Date();

    var count = 0;
    this.hashbrown = function() {
      count = count + 1;
      $location.hash("count=" + count);
    };
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
            sniffer = {
              history: true
            };
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
    "$sniffer",
    function($window, $location, $rootScope, UrlPathWhitelist, $urlRouter, $state, $sniffer) {
      var shouldReload = false;
      var firstLocationChange = true;

      $rootScope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
        // First check-up on shouldReload
        if (shouldReload) {
          event.preventDefault();
          $window.location.href = newUrl;
          return;
        }

        // Always ignore hash changes
        var newHref = getLocation(newUrl);
        var oldHref = getLocation(oldUrl);
        var samePath = newHref.pathname === oldHref.pathname;
        var sameSearch = newHref.search === oldHref.search;
        if (samePath && sameSearch && !firstLocationChange) {
          return;
        }
        firstLocationChange = false;

        // Test current location path with the mappings in the whitelist
        var path = $location.path();
        var stateName = null;
        for (var name in UrlPathWhitelist) {
          var regex = UrlPathWhitelist[name];
          if (regex.test(path)) {
            stateName = name;
            break;
          }
        }

        // Unmapped states should refresh page
        if (stateName == null) {
          event.preventDefault();
          $window.location.href = newUrl;
          return;
        }

        // Manually transition to state if no history
        if (!$sniffer.history) {
          event.preventDefault();
          $state.go(stateName, $location.search(), {
            location: false
          });
        }
      });

      if (!$sniffer.history) {
        // We should always reload page whenever state changes except the first manual transition.
        // I did not use notify:false on the manual transition because it will also not
        // emit $stateChangeSuccess which triggers recompiling of views.
        $rootScope.$on("$stateChangeStart", function(event, toState, toParams) {
          if (shouldReload) {
            var newUrl = $state.href(toState, toParams);
            event.preventDefault();
            $window.location.href = newUrl;
          } else {
            shouldReload = true;
          }
        });
      }

      function getLocation(href) {
        var l = document.createElement("a");
        l.href = href;
        return l;
      }
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