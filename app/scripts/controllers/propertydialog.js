'use strict';

/**
 * @ngdoc function
 * @name grafterizerApp.controller:PropertydialogCtrl
 * @description
 * # PropertydialogCtrl
 * Controller of the grafterizerApp
 */

angular.module('grafterizerApp').controller('PropertydialogCtrl', function(
    $scope,
    $http,
    $mdDialog,
    $timeout,
    $log,
    transformationDataModel,
    leObject,
    $rootScope) {

    var object = leObject.object;

    var localVocabulary = new Array();;
    window.sessionStorage.setItem('localVocabulary', JSON.stringify(localVocabulary));
    $scope.propertyValue = {
        value: ''
    };

    var vocabItemTemplate = {
        name: '',
        namespace: '',
        classes: [],
        properties: []
    };

    var lowercaseTemplate = {
        name: '',
        lowercase:''
    }

    $scope.showSearchDialog = true;
    $scope.dragProcess = false;
    $scope.showProgress = false;
    $scope.showManageDialog = false;
    $scope.showAddDialog = false;
    $scope.showSearchResult  = false;
    $scope.showSearchEmptyResult = false;
    $scope.showEmptySearchResult = false;
    $scope.showProgressCircular = false;
    $scope.showSearchPagination = false;
    $scope.namespaceInputDisable = false;

    if (!$scope.property) {
        $scope.property = new transformationDataModel.Property('', '', []);
    } else {
        $scope.propertyValue.value = $scope.property.prefix + ':' + $scope.property.propertyName;
    }

    $scope.addProperty = function() {
        if ($scope.propertyValue.value.indexOf(':') >= 0) {
            $scope.property.prefix = $scope.propertyValue.value.substring(0, $scope.propertyValue.value.indexOf(':'));
            $scope.property.propertyName = $scope.propertyValue.value.substring($scope.propertyValue.value.indexOf(':') +
            1, $scope.propertyValue.value.length);
        }

        $mdDialog.hide($scope.property);
    };

    $scope.closeDialog = function() {
        $mdDialog.cancel();
    };

    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.items = [];
    $scope.numberOfPages = function() {
        return Math.ceil($scope.items.length / $scope.pageSize);
    };

    $scope.search = function(Para) {
        if (Para === undefined) {
            return;
        }

        $scope.showProgress = true;
        $scope.items = [];
        //get search result from server
        $http.get(
          //'http://localhost:8080/ManageVocabulary/api/vocabulary/search/' +
            'http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/search/' +
        Para).success(
        function(response) {
            for (var i = response.propertyResult.length - 1; i >= 0; i--) {
                $scope.items.push(response.propertyResult[i].value);
            }
            if ($scope.items.length > $scope.pageSize){
                $scope.showSearchPagination = true;
            }
            else{
                $scope.showSearchPagination = false;
            }

            if ($scope.items.length > 0){
                $scope.showSearchResult = true;
                $scope.showSearchEmptyResult = false;
            }
            else{
                $scope.showSearchResult = false;
                $scope.showSearchEmptyResult = true;
            }

            $scope.showProgress = false;
        }).error(function(data, status, headers, config) {
            console.log('error api/vocabulary/search');
            $scope.showProgress = false;
        });

        //get search result from local
        var localVocabulary = JSON.parse(
        window.sessionStorage.getItem('localVocabulary'));

        for (var i = localVocabulary.length - 1; i >= 0; i--) {
            /*var classList = localVocabulary[i].classes;
            for( var item = classList.length - 1; item >= 0; item-- ){
                if( classList[item].indexOf(Para) != -1 ) {
                    $scope.items.push(classList[item].value);
                }
            }
            */

            var propertyList = localVocabulary[i].properties;
            if (propertyList != null){
                for( var item = propertyList.length - 1; item >= 0; item-- ){
                  if( propertyList[item].lowername.indexOf(Para.toLowerCase()) != -1 ) {
                    $scope.items.push(propertyList[item].name);
                  }
                }
            }
        }

        $scope.currentPage = 0;

    };

    //show current saved vocabulary and operations
    $scope.switchToManageDialog = function() {
        $scope.selection = 'manageDialog';

        //show local vocabulary
        var localVocabulary = JSON.parse(sessionStorage.getItem('localVocabulary'));

        var VocabList = [];
        if (localVocabulary != null){
          for (var i = localVocabulary.length - 1; i >= 0; i--) {
            VocabList.push(localVocabulary[i]);
          }
        }

        $scope.VocabItems = VocabList;
        $scope.showProgressCircular = true;

        //show server vocabulary
        $scope.VocabItemsServer = [];
        $http.get(
          //'http://localhost:8080/ManageVocabulary/api/vocabulary/getAll'
            'http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/getAll'
        ).success(
            function(response) {
              for (var i = response.result.length - 1; i >= 0; i--) {
                  vocabItemTemplate = new Object();
                  vocabItemTemplate.name = response.result[i].name;
                  vocabItemTemplate.namespace = response.result[i].namespace;

                  $scope.VocabItemsServer.push(vocabItemTemplate);

                  if ($scope.VocabItemsServer.length + $scope.VocabItems.length> $scope.pageSize){
                      $scope.showVocabularyPagination = true;
                  }
                  else{
                      $scope.showVocabularyPagination = false;
                  }
              }
              $scope.showProgressCircular = false;
            }).error(function(data, status, headers, config) {
            console.log('error /api/vocabulary/getAll');
            $scope.showProgressCircular = false;
        });

        $scope.showManageDialog = true;
        $scope.showSearchDialog = false;
        $scope.showAddDialog = false;
    };

    $scope.switchToSearchDialog = function() {
        $scope.selection = 'searchDialog';
        $scope.showManageDialog = false;
        $scope.showSearchDialog = true;
        $scope.showAddDialog = false;

    };

    $scope.switchToAddDialog = function(name, namespace) {
        $scope.selection = 'addVocabDialog';

        $scope.showManageDialog = false;
        $scope.showSearchDialog = false;
        $scope.showAddDialog = true;

        $scope.vocabName = null;
        $scope.vocabNamespace = null;

        // if namespace is not null, then we are editing vocabulary,
        if (name != undefined){
            $scope.vocabName = name;
        }

        if (namespace != undefined && namespace != "") {
            $scope.vocabNamespace = namespace;
            $scope.namespaceInputDisable = true;
        }
        else{
            $scope.namespaceInputDisable = false;
        }
    };

    //delete local vocabulary
    $scope.deleteItem = function(vocabNamespace) {
        //delete from local storage
        var localVocabulary = JSON.parse(window.sessionStorage.getItem('localVocabulary'));
        for (var i = localVocabulary.length - 1; i >= 0; i--) {
            if( localVocabulary[i].namespace === vocabNamespace ){
                localVocabulary.splice(i, 1);
            }
        }

        //delete from GUI
        var VocabList = [];
        for (var i = localVocabulary.length - 1; i >= 0; i--) {
            vocabItemTemplate.name = localVocabulary[i].name;
            vocabItemTemplate.namespace = localVocabulary[i].namespace;
            VocabList.push(vocabItemTemplate);
        }
        $scope.VocabItems = VocabList;

        window.sessionStorage.setItem('localVocabulary', JSON.stringify(localVocabulary));
    };

    //editing vocabulary
    $scope.editItem = function(name, namespace){
        $scope.switchToAddDialog(name, namespace);
    };

    //delete vocabulary from server
    $scope.deleteItemFromServer = function(name, vocabNamespace) {

          $http.post('http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/delete/', {name: name, namespace: vocabNamespace}).success(function(response){
          if(response.http_code == '200'){
            for (var i = VocabularCollection.length - 1; i >= 0; i--) {
              if (VocabularCollection[i].name === name) {
                  VocabularCollection.splice(i, 1);
              }
            }
            //$scope.manageTableParams.reload();
          }
      }).error(function(data, status, headers, config) {
        alert('error');
      });
    }

    //add vocabulary to server
    $scope.addVocabtoServer = function(vocabName, vocabNamespace, vocabLoc) {
        $http.post(
          //'http://localhost:8080/ManageVocabulary/api/vocabulary/add'
          'http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/add'
          , {
          name: vocabName,
          namespace: vocabNamespace,
          path: vocabLoc
        }).success(function(response) {
          $scope.switchToManageDialog();
        }).error(function(data, status, headers, config) {
          console.log('error', data);
        });
    };

    //add vocabulary to local
    $scope.addVocabtoLocal = function(vocabName, vocabNamespace, vocabLoc) {
        if (vocabName === "" || vocabNamespace === "") {
            return;
        }

        // if path is empty, just add vocabulary name to local storage.
        if (vocabLoc === undefined && !object.data) {
            var localVocabulary = JSON.parse(window.sessionStorage.getItem('localVocabulary'));

            if ($scope.namespaceInputDisable === true){
                for (var i = localVocabulary.length - 1; i >= 0; i--) {
                    if( localVocabulary[i].namespace === vocabNamespace ){
                        localVocabulary[i].name = vocabName;
                    }
                }
            }
            else{
                vocabItemTemplate = new Object();

                vocabItemTemplate.name = vocabName;
                vocabItemTemplate.namespace = vocabNamespace;

                localVocabulary.push(vocabItemTemplate);
                $rootScope.transformation.rdfVocabs.push(new transformationDataModel.RDFVocabulary(vocabName, vocabNamespace, [], []));
            }

            window.sessionStorage.setItem('localVocabulary', JSON.stringify(localVocabulary));

            $scope.switchToManageDialog();

            return;
        }

        if(vocabLoc === undefined || vocabLoc === ""){
            vocabLoc = object.filename;
        }

        $scope.showProgress = true;
        $http.post(
          //'http://localhost:8080/ManageVocabulary/api/vocabulary/getClassAndPropertyFromVocabulary'
            'http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/getClassAndPropertyFromVocabulary'
            , {
                name: vocabName,
                namespace: vocabNamespace,
                path: vocabLoc,
                data: object.data
            }).success(function(response) {
                //add vocabulary name, a list of classes, a list of properties in local storage
                var localVocabulary = JSON.parse(window.sessionStorage.getItem('localVocabulary'));

                var classArray = [];
                var propertyArray = [];
                for (var i = response.classResult.length - 1; i >= 0; i--) {
                    //lower case is easier for search
                    lowercaseTemplate = new Object();
                    lowercaseTemplate.name = response.classResult[i].value;
                    lowercaseTemplate.lowername = response.classResult[i].value.toLowerCase();
                    classArray.push(lowercaseTemplate);
                    //console.log(response.classResult[i].value);
                }
                for (var i = response.propertyResult.length - 1; i >= 0; i--) {
                    lowercaseTemplate = new Object();
                    lowercaseTemplate.name = response.propertyResult[i].value;
                    lowercaseTemplate.lowername = response.propertyResult[i].value.toLowerCase();
                    propertyArray.push(lowercaseTemplate);
                    //console.log(response.propertyResult[i].value);
                }
                //console.log(response.classResult.length);
                //console.log(response.propertyResult.length);

                vocabItemTemplate = new Object();

                if ($scope.namespaceInputDisable === true){
                    //editing vocabulary
                    for (var i = localVocabulary.length - 1; i >= 0; i--) {
                        if (localVocabulary[i].namespace === vocabNamespace){
                            localVocabulary[i].name = vocabName;
                            localVocabulary[i].classes = classArray;
                            localVocabulary[i].properties = propertyArray;
                        }
                    }
                }
                else {
                    //adding new vocabulary
                    vocabItemTemplate.name = vocabName;
                    vocabItemTemplate.namespace = vocabNamespace;
                    vocabItemTemplate.classes = classArray;
                    vocabItemTemplate.properties = propertyArray;

                    localVocabulary.push(vocabItemTemplate);
                }

                window.sessionStorage.setItem('localVocabulary', JSON.stringify(localVocabulary));

                $scope.switchToManageDialog();
                $scope.showProgress = false;
            }).error(function(data, status, headers, config) {
                console.log('error api/vocabulary/getClassAndPropertyFromVocabulary');
                $scope.showProgress = false;
            });
    };

    $scope.addResult = function(value) {
      $scope.propertyValue.value = value;
    };

    $scope.noOperation = function(){

    }

    // let us choose how to add vocabulary path
    //------------------------------------------
    $scope.choices = [
        "Add vocabulary path by url",
        "Add local vocabulary",
        "Add vocabulary later"
    ];

    $scope.localPath = false;
    $scope.remotePath = false;

    $scope.onChange = function(choice) {
        if (choice === "Add vocabulary path by url"){
            $scope.localPath = false;
            $scope.remotePath = true;
        }
        else if (choice === "Add local vocabulary") {
          $scope.localPath = true;
          $scope.remotePath = false;
        } else {
          $scope.localPath = false;
          $scope.remotePath = false;
        }
    };
    //-----------------------------------------

  });
