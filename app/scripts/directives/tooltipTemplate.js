;(function(angular, $) {
  "use strict";

  angular.module("testApp")

    .directive("tooltipTemplate", [
      "$templateCache",
      "$compile",
      function($templateCache, $compile) {
        return {
          restrict: "A",
          replace: false,
          terminal: true,
          priority: 1000,
          link: function(scope, element, attrs) {
            if (!attrs.tooltipTemplate) {
              return;
            }
            var template = $templateCache.get(attrs.tooltipTemplate);
            var templateEl = $compile(template)(scope);

            var result = $("<div></div>").append(templateEl);

            // http://stackoverflow.com/questions/19224028/add-directives-from-directive-in-angularjs

            element.removeAttr("tooltip-template");
            element.removeAttr("data-tooltip-template");

            element.attr("tooltip-html-unsafe", result.html());
            $compile(element)(scope);
          }
        };
      }
    ])

    .directive("testDirective", [
      function() {
        return {
          restrict: "A",
          template: "<strong>{{waitForResult}}</strong>",
          link: function(scope) {
            setTimeout(function(){
              scope.waitForResult = "I AM UPDATED!!!";
            }, 5000);
          }
        };
      }
    ]);

})(angular, jQuery);