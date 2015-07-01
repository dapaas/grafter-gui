'use strict';

/**
 * @ngdoc function
 * @name grafterizerApp.controller:PropertydialogCtrl
 * @description
 * # PropertydialogCtrl
 * Controller of the grafterizerApp
 */
var app = angular.module('grafterizerApp');
app.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
		if(input === undefined){
			return;
		}
        return input.slice(start);
    }
});

//var localVocabulary = JSON.parse(localStorage['localVocabulary']);


var object = new Array();

app.controller('PropertydialogCtrl', function ($scope, $http, $mdDialog, $timeout, $log, transformationDataModel) {
	$scope.propertyValue= {
        value: ''
    };
	
	$scope.dragProcess = false;
	$scope.showProgress = false;
	$scope.showManageDialogToolBar = false;
	$scope.showSearchDialogToolBar = true;
	$scope.showAddDialogToolBar = false;

    console.log("scope current property", $scope.property);
    if(!$scope.property){
        $scope.property = new transformationDataModel.Property("", "", []);
	}
	else{
		$scope.propertyValue.value = $scope.property.prefix + ":" + $scope.property.propertyName;
	}

    $scope.addProperty = function () {
		if($scope.propertyValue.value.indexOf(":") >= 0){
			$scope.property.prefix = $scope.propertyValue.value.substring(0, $scope.propertyValue.value.indexOf(":"));
			$scope.property.propertyName = $scope.propertyValue.value.substring($scope.propertyValue.value.indexOf(":") + 1, $scope.propertyValue.value.length);
		}
		
        $mdDialog.hide($scope.property);
    };
	
    $scope.closeDialog = function () {
        $mdDialog.cancel();
    };
	
	$scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.items = [];
    $scope.numberOfPages=function(){
        return Math.ceil($scope.items.length/$scope.pageSize);                
    }
	
	var keywordscope;
	
	$scope.search = function(Para) {
		if(Para === undefined){
			return;
		}
		$scope.showProgress = true;
		$scope.items = [];
		keywordscope = Para;
		$http.get('http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/search/' + Para).success(function(response){
			
			for (var i = response.result.length - 1; i >= 0; i--) {
				var tmp = response.result[i]
				var str = tmp.value;
				$scope.items.push(str);
			}

			$scope.showProgress = false;
		}).error(function(data, status, headers, config) {
    		console.log("error api/vocabulary/search");
			$scope.showProgress = false;
    	});
		
		
		var localClassAndProperty = JSON.parse(window.sessionStorage['localClassAndProperty']);
		
		for (var i = localClassAndProperty.length - 1; i >= 0; i--) {
			var str = localClassAndProperty[i].value;
        	if (str.indexOf(keywordscope) != -1) {
        		$scope.items.push(localClassAndProperty[i].value);
        	}
        }

		$scope.hideValue = true;
	};
    
    var VocabularCollection;
    
	
	//local
	$scope.switchToManageDialog = function() {	
    	$scope.selection = "manageDialog";
		
		var localVocabulary = JSON.parse(sessionStorage["localVocabulary"]);
		
		$scope.VocabItems = localVocabulary;
		
		$scope.VocabItemsServer = [];
		$http.get('http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/getAll').success(function(response){
			for (var i = response.result.length - 1; i >= 0; i--) {
				$scope.VocabItemsServer.push(response.result[i].name);
			}
    	}).error(function(data, status, headers, config) {
    		console.log("error /api/vocabulary/getAll");
    	});
		
		$scope.showManageDialogToolBar = true;
		$scope.showSearchDialogToolBar = false;
		$scope.showAddDialogToolBar = false;
	}

    $scope.switchToSearchDialog = function() {
    	$scope.selection = "searchDialog";
		$scope.showManageDialogToolBar = false;
		$scope.showSearchDialogToolBar = true;
		$scope.showAddDialogToolBar = false;
    	
    }
    
    $scope.switchToAddDialog = function() {
    	$scope.selection = "addVocabDialog";
		$scope.showManageDialogToolBar = false;
		$scope.showSearchDialogToolBar = false;
		$scope.showAddDialogToolBar = true;
    }
    
	//local
    $scope.deleteItem = function(name, vocabNamespace) {
		var localClassAndProperty = JSON.parse(window.sessionStorage['localVocabulary']);
		window.sessionStorage.removeItem('localVocabulary');
		for (var i = localVocabulary.length - 1; i >= 0; i--) {
        	if (localVocabulary[i] === name) {
        		localVocabulary.splice(i, 1);
				
        	}
        }
		$scope.VocabItems = localVocabulary;
		
		window.sessionStorage.setItem('localVocabulary', JSON.stringify(localVocabulary));
		
		var localClassAndProperty = JSON.parse(window.sessionStorage['localClassAndProperty']);
		window.sessionStorage.removeItem('localClassAndProperty');
		
		for (var i = localClassAndProperty.length - 1; i >= 0; i--) {
			var str = localClassAndProperty[i];
        	if (str.value.indexOf(name) === 0) {
        		localClassAndProperty.splice(i, 1);
        	}
        }
		
		window.sessionStorage.setItem('localClassAndProperty', JSON.stringify(localClassAndProperty));
    }
	
	/*
	//server
	$scope.deleteItem = function(name, vocabNamespace) {
		
        $http.post('http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/delete/', {name: name, namespace: vocabNamespace}).success(function(response){
        if(response.http_code == "200"){
        	for (var i = VocabularCollection.length - 1; i >= 0; i--) {
        		if (VocabularCollection[i].name === name) {
        		    VocabularCollection.splice(i, 1);
        		}
        	}
        	//$scope.manageTableParams.reload();
        }
		}).error(function(data, status, headers, config) {
			alert("error");
		});
    }
*/
	//server
    $scope.addVocabToTableServer = function(vocabName, vocabPrefix, vocabLoc) {
    	$http.post('http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/add', {name:vocabName, namespace:vocabPrefix, path:vocabLoc}).success(function(response){
			$scope.switchToManageDialog();
		}).error(function(data, status, headers, config) {
			alert("error");
		});        
    }
/*
	//server
	$scope.switchToManageDialog = function() {	
    	$scope.selection = "manageDialog";
		$http.get('http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/getAll').success(function(response){
			$scope.VocabItems = response.result;
    	}).error(function(data, status, headers, config) {
    		alert("error");
    	});
		$scope.showManageDialogToolBar = true;
		$scope.showSearchDialogToolBar = false;
		$scope.showAddDialogToolBar = false;
	}
	*/
	
	//local
	$scope.addVocabToTable = function(vocabName, vocabPrefix, vocabLoc) {
		if(vocabName === undefined || vocabPrefix === undefined){
			return;
		}
		if(vocabLoc === undefined && object.length === 0){
			return;
		}
		
		$scope.showProgress = true;
    	$http.post('http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/getClassAndPropertyFromVocabulary', {name:vocabName, path:vocabLoc, data:object.data}).success(function(response){
			var localClassAndProperty = JSON.parse(sessionStorage["localClassAndProperty"]);
			for (var i = response.result.length - 1; i >= 0; i--) {
				localClassAndProperty.push(response.result[i]);
			}
			window.sessionStorage.setItem('localClassAndProperty', JSON.stringify(localClassAndProperty));
			
			var localVocabulary = JSON.parse(sessionStorage["localVocabulary"]);
			localVocabulary.push(vocabName);
			window.sessionStorage.setItem('localVocabulary', JSON.stringify(localVocabulary));
			
			$scope.switchToManageDialog();
			$scope.showProgress = false;
		}).error(function(data, status, headers, config) {
			console.log("error api/vocabulary/getClassAndPropertyFromVocabulary");
		});        
    }
	
	$scope.addResult = function(value) {
		$scope.propertyValue.value = value;
    };
	
	$scope.data = {
		cb: true
	};
	
	$scope.onChange = function(cbState) {
		if(cbState === true){
			$scope.localPath = false;
		}
		else{
			$scope.localPath = true;
		}
	};
});


(function () {
	'use strict';
	angular
		  .module('grafterizerApp')
		  .controller('DemoCtrl', DemoCtrl);

	function DemoCtrl ($scope, $http) {
		// list of `state` value/display objects
		this.querySearch = querySearch;
		this.selectedItemChange = selectedItemChange;

		function querySearch (query) {
			return $http.get("http://ec2-54-154-72-62.eu-west-1.compute.amazonaws.com:8081/ManageVocabulary/api/vocabulary/autocomplete")
            .then(function(data){
				var allStates = "";
                var labels = data.data.result;
				
				for(var i = 0; i < labels.length; i++){
					allStates += labels[i].value;
					allStates += ", ";
				}
				
				var temp = allStates.split(/, +/g).map( function (state) {
					return {
					  value: state.toLowerCase(),
					  display: state
					};
				});
				
				var results = query ? temp.filter( createFilterFor(query) ) : [];
				return results;
            })
		}
		
		function selectedItemChange(item) {
			$scope.propertyValue.value = item.value;
		}

		function createFilterFor(query) {
			var lowercaseQuery = angular.lowercase(query);

			return function filterFn(state) {
				return (state.value.indexOf(lowercaseQuery) === 0);
			};
		}
	}
})();


(function() {
  'use strict';
  app.directive('fileDropzone', function() {
    return {
        restrict: 'A',
        scope: {
            file: '=',
            fileName: '='
        },
		link: function($scope, element, attrs) {

			var processDragOverOrEnter, validMimeTypes;
			processDragOverOrEnter = function(event) {
				if (event != null) {
					event.preventDefault();
				}
				event.dataTransfer.effectAllowed = 'copy';
				return false;
			};
			validMimeTypes = attrs.fileDropzone;

			element.bind('dragover', processDragOverOrEnter);
			element.bind('dragenter', processDragOverOrEnter);
			return element.bind('drop', function(event) {
				
			var file, name, reader, size, type;
			if (event != null) {
				event.preventDefault();
			}
			reader = new FileReader();
			reader.onloadstart = function(e) {
				  $scope.dragProcess = true;
			}
			reader.onload = function(evt) {
				object = {};
				object.filename = file.name;
				object.data = evt.target.result;
				$scope.dragProcess = false;
				$scope.fileName.value = file.name;
				$scope.$apply();
			};
			file = event.dataTransfer.files[0];
			name = file.name;
			type = file.type;
			size = file.size;
			reader.readAsText(file);
			  
			return false;
			});
        }
    };
  });

}).call(this);

(function() {
  'use strict';  
    app.controller('FileTestCtrl', function($scope) {
					$scope.fileName= {
				value: ''
			};
        $scope.image = null;
        $scope.fileName.value = object.filename;
    });
}).call(this);



