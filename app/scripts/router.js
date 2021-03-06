;(function(angular) {
  "use strict";

angular.module("testApp")
  .controller("ContentCtrl", function($stateParams, $location){
    //alert("SHOULD RUN ONCE PER PAGE LOAD!!!!!!!!!!!!!!!!!!!!!");
    this.stateParams = $stateParams;
    this.$location = $location;
    this.bbqParams = $.deparam.querystring();
    this.date = new Date();

    var count = 0;
    this.hashbrown = function() {
      count = count + 1;
      $location.hash("count=" + count);
    };
  });

  angular.module("testApp").provider("UrlPathWhitelist", function() {
    var whitelist = [];

    this.add = function(mapping) {
      whitelist.push(mapping);
    };

    this.$get = function() {
      console.info(whitelist);
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

          if (!definition.abstract && definition.url) {
            var name = arguments[0];
            var url = definition.url;
            var unrouted = definition.unrouted === true;

            UrlPathWhitelistProvider.add({
              name: name,
              url: url,
              unrouted: unrouted
            });
          }

          return stateFn.apply(this, arguments);
        };
      }
    ]);

  angular.module("testApp").config([
    "$stateProvider",
    "$urlRouterProvider",
    function($stateProvider) {
      $stateProvider
        .state("a", {
          url: "/a",
          unrouted: true
        });

      $stateProvider
        .state("ab", {
          url: "/a/b",
          unrouted: true
        });

      $stateProvider
        .state("home", {
          url: "/",
          views: {
            "header": {
              templateUrl: "views/headers/header1.html"
            },
            "content": {
              templateUrl: "views/contents/home.html",
              controller: "ContentCtrl",
              controllerAs: "HomePage"
            }
          },
          data: {
            pageTitle: "Home page"
          }
        });

      $stateProvider
        .state("search", {
          url: "/search?q&int&float&str&{date:any}",
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
        });

      $stateProvider
        .state("details", {
          url: "/details",
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

      $stateProvider
        .state("wildcard-ext", {
          url: "/:slug/:code",
          views: {
            "content": {
              templateUrl: "views/contents/wildcard.html",
              controller: "ContentCtrl",
              controllerAs: "wildCardPage"
            }
          }
        });

      $stateProvider
        .state("wildcard", {
          url: "/:slug",
          views: {
            "content": {
              templateUrl: "views/contents/wildcard.html",
              controller: "ContentCtrl",
              controllerAs: "wildCardPage"
            }
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
    "RouteHelper",
    "$urlRouter",
    "$state",
    "$sniffer",
    "$urlMatcherFactory",
    function($window, $location, $rootScope, UrlPathWhitelist, RouteHelper, $urlRouter, $state, $sniffer, $urlMatcherFactory) {
      var shouldReload = false;
      var firstLocationChange = true;

      $rootScope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
        //alert("locationChangeStart")

        // Always ignore hash changes
        var newHref = getLocation(newUrl);
        var oldHref = getLocation(oldUrl);
        var samePath = newHref.pathname === oldHref.pathname;
        var sameSearch = newHref.search === oldHref.search;
        if (samePath && sameSearch && !firstLocationChange) {
          return;
        }
        firstLocationChange = false;

        // First check-up on shouldReload
        if (shouldReload) {
          event.preventDefault();
          // $window.location.href = newUrl;
          $rootScope.$$watchers = [];
          RouteHelper.redirectToUrl(newUrl);
          return;
        }

        // Test current location path with the mappings in the whitelist
        var path = $location.path();
        var stateName = null;
        var mapping;
        for (var i = 0; i < UrlPathWhitelist.length; i++) {
          mapping = UrlPathWhitelist[i];
          var matcher = $urlMatcherFactory.compile(mapping.url);
          if (matcher.regexp.test(path)) {
            stateName = mapping.unrouted ? null : mapping.name;
            break;
          }
        }

        // Unmapped states should refresh page
        if (stateName == null) {
          event.preventDefault();
          // $window.location.href = newUrl;
          $rootScope.$$watchers = [];
          RouteHelper.redirectToUrl(newUrl);
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
            $rootScope.$$watchers = [];
            RouteHelper.redirectToUrl(newUrl);
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
