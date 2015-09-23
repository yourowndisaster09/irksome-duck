;(function(angular) {
  "use strict";

  angular.module("testApp", [
    "ui.router"
  ]);

  angular.module("testApp").config([
    "$stateProvider",
    function($stateProvider) {
      $stateProvider
        .state("home", {
          url: "/",
          views: {
            "header": {
              templateUrl: "views/headers/header1.html"
            },
            "content": {
              templateUrl: "views/contents/home.html"
            },
            "footer": {
              templateUrl: "views/footers/footer1.html"
            }
          },
          data: {
            pageTitle: "Home page"
          }
        })
        .state("search", {
          url: "/search",
          views: {
            "header": {
              templateUrl: "views/headers/header2.html"
            },
            "content": {
              templateUrl: "views/contents/search.html"
            }
          },
          data: {
            pageTitle: "Search page"
          }
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
        })
        .state("checkout", {
          url: "/checkout",
          views: {
            "header": {
              templateUrl: "views/headers/header1.html"
            },
            "content": {
              templateUrl: "views/contents/checkout.html"
            },
            "footer": {
              templateUrl: "views/footers/footer1.html"
            }
          },
          data: {
            pageTitle: "Checkout page"
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
      $locationProvider.html5Mode(true);
    }
  ]);

  var hasPushState = window.history && window.history.pushState;

  if (!hasPushState) {
    angular.module("testApp").run([
      "$location",
      function($location) {
      }
    ]);
  }

  angular.module("testApp").run([
    "$log",
    "$rootScope",
    "$location",
    function($log, $rootScope, $location) {
      $rootScope.$$location = $location;

      $rootScope.$on("$locationChangeStart", function(event) {
        console.info("locationChangeStart");
      });
      $rootScope.$on("$locationChangeSuccess", function(event) {
        console.info("locationChangeSuccess");
      });
      $rootScope.$on("$stateChangeError", function(event) {
        console.info("stateChangeError");
      });
      $rootScope.$on("$stateChangeSuccess", function(event, toState) {
        console.info("stateChangeSuccess");
        $rootScope.stateData = toState.data;
      });
    }
  ]);

})(angular);
