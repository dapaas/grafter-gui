'use strict';

/**
 * @ngdoc directive
 * @name grafterizerApp.directive:columns
 * @description
 * # columns
 */
angular.module('grafterizerApp')
  .directive('columns', function(transformationDataModel) {
    return {
      templateUrl: 'views/columnsfunction.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        if (!scope.function) {
          scope.function = new transformationDataModel.ColumnsFunction(
            [],null,0);
        }

        scope.$parent.generateCurrFunction = function() {
          return new transformationDataModel.ColumnsFunction(scope.function.columnsArray,
                  scope.function.useLazy,
                  scope.function.numberOfColumns);
        };
      }
    };
  });
