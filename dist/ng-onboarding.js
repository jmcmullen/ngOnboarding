(function() {
  var app;

  app = angular.module("ngOnboarding", []);

  app.provider("ngOnboardingDefaults", function() {
    return {
      options: {
        overlay: true,
        overlayOpacity: 0.6,
        overlayClass: 'onboarding-overlay',
        popoverClass: 'onboarding-popover',
        titleClass: 'onboarding-popover-title',
        contentClass: 'onboarding-popover-content',
        arrowClass: 'onboarding-arrow',
        buttonContainerClass: 'onboarding-button-container',
        buttonClass: "onboarding-button",
        showButtons: true,
        nextButtonText: 'Next',
        previousButtonText: 'Previous',
        showDoneButton: true,
        doneButtonText: 'Done',
        closeButtonClass: 'onboarding-close-button',
        closeButtonText: '&times;',
        stepClass: 'onboarding-step-info',
        actualStepText: 'Step',
        totalStepText: 'of',
        showStepInfo: true
      },
      $get: function() {
        return this.options;
      },
      set: function(keyOrHash, value) {
        var k, v, _results;
        if (typeof keyOrHash === 'object') {
          _results = [];
          for (k in keyOrHash) {
            v = keyOrHash[k];
            _results.push(this.options[k] = v);
          }
          return _results;
        } else {
          return this.options[keyOrHash] = value;
        }
      }
    };
  });

  app.directive('onboardingPopover', [
    'ngOnboardingDefaults', '$sce', '$timeout', function(ngOnboardingDefaults, $sce, $timeout) {
      return {
        restrict: 'E',
        scope: {
          enabled: '=',
          steps: '=',
          onFinishCallback: '=',
          index: '=stepIndex'
        },
        replace: true,
        link: function(scope, element, attrs) {
          var attributesToClear, curStep, setupOverlay, setupPositioning;
          curStep = null;
          attributesToClear = ['title', 'top', 'right', 'bottom', 'left', 'width', 'height', 'position', 'style'];
          scope.next = function() {
            return scope.index = scope.index + 1;
          };
          scope.previous = function() {
            return scope.index = scope.index - 1;
          };
          scope.finished = function() {
            scope.enabled = false;
            setupOverlay(false);
            if (scope.onFinishCallback) {
              return scope.onFinishCallback();
            }
          };
          scope.$watch('index', function(newVal, oldVal) {
            var attr, k, v, _i, _len;
            if (typeof newVal === 'undefined') {
              scope.enabled = false;
              setupOverlay(false);
              return;
            }
            curStep = scope.steps[scope.index];
            scope.lastStep = scope.index + 1 === scope.steps.length;
            scope.showNextButton = scope.index + 1 < scope.steps.length;
            scope.showPreviousButton = scope.index > 0;
            scope.stepCount = scope.steps.length;
            for (_i = 0, _len = attributesToClear.length; _i < _len; _i++) {
              attr = attributesToClear[_i];
              scope[attr] = null;
            }
            for (k in ngOnboardingDefaults) {
              v = ngOnboardingDefaults[k];
              if (curStep[k] === void 0) {
                scope[k] = v;
              }
            }
            for (k in curStep) {
              v = curStep[k];
              scope[k] = v;
            }
            scope.description = $sce.trustAsHtml(scope.description);
            scope.nextButtonText = $sce.trustAsHtml(scope.nextButtonText);
            scope.previousButtonText = $sce.trustAsHtml(scope.previousButtonText);
            scope.doneButtonText = $sce.trustAsHtml(scope.doneButtonText);
            scope.closeButtonText = $sce.trustAsHtml(scope.closeButtonText);
            scope.actualStepText = $sce.trustAsHtml(scope.actualStepText);
            scope.totalStepText = $sce.trustAsHtml(scope.totalStepText);
            setupOverlay();
            return setupPositioning();
          });
          setupOverlay = function(showOverlay) {
            var $attachTo, $onboardingFocus, attachTo, onboardingFocus;
            if (showOverlay == null) {
              showOverlay = true;
            }
            onboardingFocus = document.querySelectorAll('.onboarding-focus');
            $onboardingFocus = angular.element(onboardingFocus);
            $onboardingFocus.removeClass('onboarding-focus');
            if (showOverlay) {
              if (curStep['attachTo'] && scope.overlay) {
                attachTo = document.querySelectorAll(curStep['attachTo'])[0];
                $attachTo = angular.element(attachTo);
                return $attachTo.addClass('onboarding-focus');
              }
            }
          };
          return setupPositioning = function() {
            var $attachTo, attachTo, bottom, left, right, top, xMargin, yMargin;
            attachTo = document.querySelectorAll(curStep['attachTo'])[0];
            $attachTo = angular.element(attachTo)[0];
            scope.position = curStep['position'];
            xMargin = 15;
            yMargin = 15;
            if (attachTo) {
              if (!(scope.left || scope.right)) {
                left = null;
                right = null;
                if (scope.position === 'right') {
                  left = $attachTo.getBoundingClientRect().left + $attachTo.offsetWidth + xMargin;
                } else if (scope.position === 'left') {
                  right = window.innerWidth - $attachTo.getBoundingClientRect().left + xMargin;
                } else if (scope.position === 'top' || scope.position === 'bottom') {
                  left = $attachTo.getBoundingClientRect().left;
                }
                if (curStep['xOffset']) {
                  if (left !== null) {
                    left = left + curStep['xOffset'];
                  }
                  if (right !== null) {
                    right = right - curStep['xOffset'];
                  }
                }
                scope.left = left;
                scope.right = right;
              }
              if (!(scope.top || scope.bottom)) {
                top = null;
                bottom = null;
                if (scope.position === 'left' || scope.position === 'right') {
                  top = $attachTo.getBoundingClientRect().top;
                } else if (scope.position === 'bottom') {
                  top = $attachTo.getBoundingClientRect().top + $attachTo.outerHeight + yMargin;
                } else if (scope.position === 'top') {
                  bottom = window.innerHeight - $attachTo.getBoundingClientRect().top + yMargin;
                }
                if (curStep['yOffset']) {
                  if (top !== null) {
                    top = top + curStep['yOffset'];
                  }
                  if (bottom !== null) {
                    bottom = bottom - curStep['yOffset'];
                  }
                }
                scope.top = top;
                scope.bottom = bottom;
              }
            }
            if (scope.position && scope.position.length) {
              return scope.positionClass = "onboarding-" + scope.position;
            } else {
              return scope.positionClass = null;
            }
          };
        },
        template: "<div class='onboarding-container' ng-show='enabled'>\n  <div class='{{overlayClass}}' ng-style='{opacity: overlayOpacity}', ng-show='overlay'></div>\n  <div class='{{popoverClass}} {{positionClass}}' ng-style=\"{width: width + 'px', height: height + 'px', left: left + 'px', top: top + 'px', right: right + 'px', bottom: bottom + 'px'}\">\n    <div class='{{arrowClass}}'></div>\n    <h3 class='{{titleClass}}' ng-show='title' ng-bind='title'></h3>\n    <a href='' ng-click='finished()' class='{{closeButtonClass}}' ng-bind-html='closeButtonText'></a>\n    <div class='{{contentClass}}'>\n      <p ng-bind-html='description'></p>\n    </div>\n    <div class='{{buttonContainerClass}}' ng-show='showButtons'>\n      <span ng-show='showStepInfo' class='{{stepClass}}'>{{actualStepText}} {{index + 1}} {{totalStepText}} {{stepCount}}</span>\n      <a href='' ng-click='previous()' ng-show='showPreviousButton' class='{{buttonClass}}' ng-bind-html='previousButtonText'></a>\n      <a href='' ng-click='next()' ng-show='showNextButton' class='{{buttonClass}}' ng-bind-html='nextButtonText'></a>\n      <a href='' ng-click='finished()' ng-show='showDoneButton && lastStep' class='{{buttonClass}}' ng-bind-html='doneButtonText'></a>\n    </div>\n  </div>\n</div>"
      };
    }
  ]);

}).call(this);
