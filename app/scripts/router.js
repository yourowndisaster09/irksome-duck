;(function(angular) {
  "use strict";

angular.module("testApp")
  .controller("ContentCtrl", function($stateParams, $location){
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
      var shouldRefresh = false, first = true;

      $rootScope.$on("$locationChangeStart", function(event, newUrl, oldUrl) {
        var newHref = getLocation(newUrl);
        var oldHref = getLocation(oldUrl);
        var samePath = newHref.pathname === oldHref.pathname;
        var sameSearch = newHref.search === oldHref.search;

        if (samePath && sameSearch && !first) {
          return;
        }
        first = false;

        if (shouldRefresh) {
          event.preventDefault();
          alert("LEAVING VIA SHOULD REFRESH");
          $window.location.href = newUrl;
          return;
        }

        var path = $location.path(),
          stateName = null;

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
          alert("LEAVING VIA NO MAPPING");
          $window.location.href = newUrl;
          return;
        }

        if (!history) {
          event.preventDefault();
          alert("NO HISTORY GO MANUAL");
          $state.go(stateName, $location.search(), {
            location: false
          });
        }
      });

      $rootScope.$on("$stateChangeStart", function(event, toState, toParams) {
        if (!history) {
          if (shouldRefresh) {
            var newUrl = $state.href(toState, toParams);
            event.preventDefault();
            alert("LEAVING VIA STATECHANGE");
            $window.location.href = newUrl;
          } else {
            alert("SHOULD REFRESH BECAUSE NO HISTORY");
            shouldRefresh = true;
          }
        }
      });

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