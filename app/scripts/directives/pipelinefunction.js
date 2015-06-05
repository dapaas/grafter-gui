'use strict';

/**
 * @ngdoc directive
 * @name grafterizerApp.directive:pipelineFunction
 * @description
 * # pipelineFunction
 */
angular.module('grafterizerApp')
    .directive('pipelineFunction', function ($mdDialog) {
    return {
        template: '<md-button class="md-raised" ng-click="editFunction()">{{function.name}}</md-button>',
        restrict: 'E',
        scope: {
            function:'='
        },
        link: function postLink(scope, element, attrs) {
            scope.editFunction = function() {
                scope.selectedFunctionName = scope.function.name;
                scope.originalFunction = new Object();
                angular.copy(scope.function, scope.originalFunction);
                $mdDialog.show({
                    templateUrl: 'views/editPipelineFunctionDialog.html',
                    scope: scope,
                    preserveScope: true
                }).then(function(pipeFunct) {
                    scope.function = pipeFunct;
                }, function() {
                    angular.copy(scope.originalFunction, scope.function);
                });
            }
            //element.text('this is the pipelineFunction directive');
        }
    };
});