;(function(angular, $) {
  "use strict";

  angular.module("testApp")
    .directive("tooltipTemplate", [
      "$templateCache",
      "$compile",
      "$timeout",
      "$parse",
      function($templateCache, $compile, $timeout, $parse) {
        return {
          restrict: "A",
          replace: false,
          terminal: true,
          priority: 1000,
          link: function link(scope, element, attrs) {
            if (!attrs.tooltipTemplate) {
              return;
            }
            // http://stackoverflow.com/questions/19224028/add-directives-from-directive-in-angularjs
            element.removeAttr("tooltip-template");
            element.removeAttr("data-tooltip-template");

            var childScope = scope.$new();
            var template = $templateCache.get(attrs.tooltipTemplate);
            var linkedTemplate = $compile(template)(childScope);

            function setTooltip() {
              var linkedEl = $("<div></div>").append(linkedTemplate);
              element.attr("tooltip-html-unsafe", linkedEl.html());

              $compile(element)(scope);
            }

            if (attrs.tooltipTemplateRefresh) {
              var compileTimeout;

              childScope.$watchCollection(
                function() {
                  var collection = [];
                  var keys = $parse(attrs.tooltipTemplateRefresh)(scope);
                  for (var i = 0; i < keys.length; i++) {
                    collection.push($parse(keys[i])(childScope));
                  }
                  return collection;
                },
                function(newVal, oldVal){
                  console.info(newVal, oldVal)
                  if (compileTimeout) {
                    $timeout.cancel(compileTimeout);
                  }
                  compileTimeout = $timeout(function(){
                    setTooltip();
                  }, 100);
                }
              );
            } else {
              setTooltip();
            }

          }
        };
      }
    ])

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
          template: "<h1>TEST</h1><strong>{{testCtrl.result}}</strong><button class='ng-hide' ng-show='!!testCtrl.result' ng-click='testCtrl.clearResult()'>CLEAR RESULT</button>",
          link: function(scope, element, attrs, ctrl) {
            var deferred = $q.defer();
            setTimeout(function(){
              deferred.resolve("I AM UPDATED!!!");
            }, 5000);

            deferred.promise.then(function(result){
              console.info("promise resolved", result);
              ctrl.setResult(result);
            });
          }
        };
      }
    ]);

})(angular, jQuery);