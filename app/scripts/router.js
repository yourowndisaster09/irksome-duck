;(function(angular) {
  "use strict";

  angular.module("testApp").config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state("search", {
          url: "/search?q&int&float&str&{date:any}",
          views: {
            "header": {
              templateUrl: "views/headers/header2.html"
            },
            "content": {
              templateUrl: "views/contents/search.html",
              controller: function($stateParams, $location){
                this.bbqParams = $.deparam.querystring();
                this.stateParams = $stateParams;
                this.locationParams = $location.search();
                this.date = new Date();
              },
              controllerAs: "searchPage"
            }
          },
          data: {
            pageTitle: "Search page"
          },
          reload: true
        })
        .state("details", {
          url: "/details",
          views: {
            "content": {
              templateUrl: "views/contents/details.html"
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
      // console.log("Forcing LocationHtml5Url location mode");
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

  angular.module("testApp").constant("ROUTING_WHITELIST", {
    SEARCH_PAGE: {
      regex: /(^\/search)/,
      stateName: "search"
    },
    DETAILS_PAGE: {
      regex: /(^\/details)/,
      stateName: "details"
    }
  });

  angular.module("testApp").run([
    "$sniffer",
    "$window",
    "$location",
    "$rootScope",
    "ROUTING_WHITELIST",
    function($sniffer, $window, $location, $rootScope, ROUTING_WHITELIST) {
      if (!$sniffer.history) {
        return;
      }

      $rootScope.$on("$locationChangeStart", function(event, newUrl) {
        console.info("url at $locationChangeStart:", window.location.href);

        var path = $location.path();

        var key, stateName;
        for (key in ROUTING_WHITELIST) {
          var value = ROUTING_WHITELIST[key];
          if (value.regex.test(path)) {
            stateName = value.stateName;
            break;
          }
        }

        if (stateName == null) {
          event.preventDefault();
          $window.location.href = newUrl;
          return;
        }
      });

      $rootScope.$on("$locationChangeSuccess", function(){
        console.info("url at $locationChangeSuccess:", window.location.href);
      });

      $rootScope.$on("$stateChangeStart", function(){
        console.info("url at $stateChangeStart:", window.location.href);
      });

      $rootScope.$on("$stateChangeSuccess", function(){
        console.info("url at $stateChangeSuccess:", window.location.href);
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