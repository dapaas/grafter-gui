'use strict';

/**
 * @ngdoc overview
 * @name grafterizerApp
 * @description
 * # grafterizerApp
 *
 * Main module of the application.
 */
angular
    .module('grafterizerApp', [
    'ui.router',
    'ngMaterial',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ngFileUpload',
    'ui.grid',
    'ui.grid.autoResize',
    'angular-loading-bar',
    'lbServices',
    'ncy-angular-breadcrumb',
    'angularMoment',
    //'http-auth-interceptor',
    'ui.sortable',
    'ui.codemirror',
    'ui.grid.selection', 
    'ui.grid.resizeColumns',
    'ui.grid.exporter',
    'ngMessages',
    'RecursionHelper',
    'vAccordion'
])
    .config(function (
            $mdThemingProvider,
             $stateProvider,
             $urlRouterProvider,
             $urlMatcherFactoryProvider,
             cfpLoadingBarProvider,
             $breadcrumbProvider,
             $locationProvider) {

    $urlRouterProvider.otherwise("/transformations/new");

    // TODO enable in production
    // $locationProvider.html5Mode(true);

    // Workaround for https://github.com/angular-ui/ui-router/issues/1119
    var valToString = function(val) {
        return val !== null ? val.toString() : val;
    };
    
    $urlMatcherFactoryProvider.type('nonURIEncoded', {
        encode: valToString,
        decode: valToString,
        is: function () { return true; }
    });


    $stateProvider
        .state('main', {
        url: '/',
        views: {
            main: {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            } 
        },
        ncyBreadcrumb: {
            label: 'Home page'
        }
    })
        .state('about', {
        url: '/about',
        views: {
            main: {
                templateUrl: 'views/about.html',
                controller: 'AboutCtrl'
            }
        }
    })
        .state('upload', {
        url: '/upload',
        views: {
            main: {
                templateUrl: 'views/upload.html',
                controller: 'UploadCtrl'
            }
        }
    })
        .state('grid', {
        url: '/grid',
        views: {
            main: {
                templateUrl: 'views/grid.html',
                controller: 'GridCtrl'
            }
        }
    })
        .state('datapages', {
        url: '/datapages',
        views: {
            main: {
                templateUrl: 'views/datapages.html',
                controller: 'DatapagesCtrl'
            }
        },
        ncyBreadcrumb: {
            label: 'Datapages'
        }
    })
        .state('transformations', {
        url: '/transformations',
        views: {
            main: {
                templateUrl: 'views/transformations.html',
                controller: 'TransformationsCtrl'
            }
        },
        ncyBreadcrumb: {
            label: 'Transformations'
        }
    })
        .state('transformations.new', {
        url: '/new',
        views: {
            "main@": {
                controller: 'TransformationNewCtrl',
                templateUrl: 'views/transformation.html'
            },
            "actions@": {
                templateUrl: 'views/actions.html',
                controller: 'ActionsCtrl'
            }
        },
        ncyBreadcrumb: {
            label: '{{document.title || "New transformation"}}'
        }
    })
        .state('transformations.transformation', {
        url: '/{id:nonURIEncoded}',
        views: {
            "main@": {
                templateUrl: 'views/transformation.html',
                controller: 'TransformationCtrl'
            },
            "actions@": {
                templateUrl: 'views/actions.html',
                controller: 'ActionsCtrl'
            }
        },
        ncyBreadcrumb: {
            label: '{{document.title || "File "+id}}'
        }
    })
        .state('transformations.transformation.preview', {
            url: '^/preview/{id:nonURIEncoded}',
            params: {
                'distribution': null
            },
            views: {
                "preview": {
                    templateUrl: 'views/preview.html',
                    controller: 'PreviewCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'Preview'
            }
        })
        .state('files', {
        url: '/files',
        views: {
            main: {
                templateUrl: 'views/files.html',
                controller: 'FilesCtrl'
            }
        },
        ncyBreadcrumb: {
            label: 'Files'
        }
    })
        .state('files.file', {
        url: '/:id',
        views: {
            "main@": {
                templateUrl: 'views/file.html',
                controller: 'FileCtrl'
            },
            "actions@": {
                templateUrl: 'views/actions.html',
                controller: 'ActionsCtrl'
            }
        },
        ncyBreadcrumb: {
            label: '{{document.title || "File "+id}}'
        }
    })
        .state('demo', {
        url: '/demo',
        views: {
            "main@": {
                templateUrl: 'views/demo.html',
                controller: 'DemoCtrl'
            },
            "actions@": {
                templateUrl: 'views/actions.html',
                controller: 'ActionsCtrl'
            }
        },
        ncyBreadcrumb: {
            label: 'Demo'
        }
    })
        .state('screenshot', {
        url: '/screenshot',
        views: {
            "main@": {
                templateUrl: 'views/screenshot.html',
                controller: 'DemoCtrl'
            }
        }
    })
        .state('distributions', {
        url: '/distributions',
        views: {
            "main@": {
                templateUrl: 'views/distributions.html',
                controller: 'DistributionsCtrl'
            }
        }
    })
        .state('datasets', {
        url: '/datasets',
        views: {
            "main@": {
                templateUrl: 'views/datasets.html',
                controller: 'DatasetsCtrl'
            }
        },
        ncyBreadcrumb: {
            label: 'Datasets'
        }
    })
        .state('datasets.dataset', {
        url: '/datasets/{id:nonURIEncoded}',
        views: {
            "main@": {
                templateUrl: 'views/dataset.html',
                controller: 'DatasetCtrl'
            }//,
            // "actions@": {
            //   templateUrl: 'views/actions.html',
            //   controller: 'ActionsCtrl'
            // }
        },
        ncyBreadcrumb: {
            label: '{{document.title || id}}'
        }
    })
      .state('distribution', {
        url: '/distribution/{id:nonURIEncoded}',
        views: {
          "main@": {
            templateUrl: 'views/distribution.html',
            controller: 'DistributionCtrl'
          }
        },
        ncyBreadcrumb: {
          label: '{{document.title || id}}'
        }
      });

    cfpLoadingBarProvider.includeSpinner = false;

    $breadcrumbProvider.setOptions({
        template:
        '<ol class="breadcrumb">'+
        '<li ng-repeat="step in steps" ng-class="{active: $last}" ng-switch="$last || !!step.abstract">'+
        '<a ng-switch-when="false" href="{{step.ncyBreadcrumbLink}}">{{step.ncyBreadcrumbLabel}}</a>'+
        '<span ng-switch-when="true">{{step.ncyBreadcrumbLabel}}</span>'+
        '</li>'+
        '</ol>'
    });

    /*var colors = [
      'red',
      'pink',
      'purple',
      'deep-purple',
      'indigo',
      'blue',
      'light-blue',
      'cyan',
      'teal',
      'green',
      'light-green',
      'lime',
      'yellow',
      'amber',
      'orange',
      'deep-orange',
      'brown',
      'grey',
      'blue-grey'
    ];

    $mdThemingProvider.theme('default')
	    .primaryPalette(colors[Math.floor(Math.random()*colors.length)])
	    .accentPalette(colors[Math.floor(Math.random()*colors.length)]);*/

    jsedn.Symbol.prototype.validRegex = new RegExp(/.*/);
});
