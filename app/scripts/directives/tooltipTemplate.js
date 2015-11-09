;(function(angular, $) {
  "use strict";

  angular.module("template/tooltip/boomer-popup.html", []).run(["$templateCache", function($templateCache) {
    $templateCache.put("template/tooltip/boomer-popup.html",
      "<div class=\"tooltip {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
      "  <div class=\"tooltip-arrow\"></div>\n" +
      "  <div class=\"tooltip-inner\">HAHAHAH</div>\n" +
      "</div>\n" +
      "");
  }]);

  angular.module("testApp").directive("boomer", [
    "$tooltip",
    function($tooltip) {
      return $tooltip("boomer", "tooltip", "mouseenter");
    }
  ]);

  angular.module("testApp").directive( "boomerPopup", [
    "$compile",
    function ($compile) {
      return {
        restrict: "EA",
        replace: true,
        scope: { placement: "@", animation: "&", isOpen: "&" },
        templateUrl: "template/tooltip/boomer-popup.html",
        link: function(scope, element, attrs) {
          console.info("hehehe");
          var $inner = element.find(".tooltip-inner");
          var html = $compile(attrs.content)(scope);
          $inner.html(html);
        }
      };
    }
  ]);




  angular.module("testApp")
//     .directive("tooltipTemplate", [
//       "$templateCache",
//       "$compile",
//       "$timeout",
//       "$parse",
//       function($templateCache, $compile, $timeout, $parse) {
//         return {
//           restrict: "A",
//           replace: false,
//           terminal: true,
//           priority: 1000,
//           scope: true,
//           link: function link(scope, element, attrs) {
//             if (!attrs.tooltipTemplate) {
//               return;
//             }
//             // http://stackoverflow.com/questions/19224028/add-directives-from-directive-in-angularjs
//             element.removeAttr("tooltip-template");
//             element.removeAttr("data-tooltip-template");

//             var childScope = scope.$new();
//             var template = $templateCache.get(attrs.tooltipTemplate);
//             var templateEl = $("<div></div>").html(template);
//             var linkedTemplate = $compile(templateEl)(childScope);
//             var initialCompiled = false;

//             function setTooltip(compileScope) {
//               console.info(linkedTemplate.html())
//               element.removeAttr("tooltip-html-unsafe");
//               element.attr("tooltip-html-unsafe", linkedTemplate.html());

//               if (compileScope) {
//                 scope = compileScope;
//               }

//               $compile(element)(scope);
//               initialCompiled = true;
//             }

//             if (attrs.tooltipTemplateRefresh) {
//               var compileTimeout;

//               childScope.$watchCollection(
//                 function() {
//                   var collection = [];
//                   var keys = $parse(attrs.tooltipTemplateRefresh)(scope);
//                   for (var i = 0; i < keys.length; i++) {
//                     collection.push($parse(keys[i])(childScope));
//                   }
//                   return collection;
//                 },
//                 function(newVal, oldVal){
//                   if (!initialCompiled) {
//                     initialCompiled = true;
//                     setTooltip();
//                     return;
//                   }
//                   console.info(newVal, oldVal);
//                   if (compileTimeout) {
//                     $timeout.cancel(compileTimeout);
//                   }
//                   compileTimeout = $timeout(function(){
//                     var newScope = scope.$parent;
//                     scope.$destroy();
//                     $(element).off();
//                     setTooltip(newScope);
//                   }, 100);
//                 }
//               );
//             } else {
//               setTooltip();
//             }

//           }
//         };
//       }
//     ])

    .directive("testDirective", [
      "$q",
      function($q) {
        return {
          restrict: "A",
          controller: function(){
            var self = this;

            this.setResult = function(result){
              self.result = result;
            };

            this.clearResult = function(){
              self.result = "CLEARED!";
            };
          },
          controllerAs: "testCtrl",
          scope: false,
          template: "<h1>TEST</h1><strong>{{testCtrl.result}}</strong><button class='ng-hide test-click-btn' ng-show='!!testCtrl.result' ng-click='testCtrl.clearResult()'>CLEAR RESULT</button>",
          link: function(scope, element, attrs, ctrl) {
            var deferred = $q.defer();
            setTimeout(function(){
              deferred.resolve("I AM UPDATED!!!");
            }, 5000);

            deferred.promise.then(function(result){
              console.info("promise resolved", result);
              ctrl.setResult(result);
            });

            $("body").on("click", ".test-click-btn", function(event){
              var $target = $(event.target);
              var $element = $(element);
              console.info(element, $target);
              console.info($.contains($element[0], $target[0]));
            })
          }
        };
      }
    ]);

})(angular, jQuery);