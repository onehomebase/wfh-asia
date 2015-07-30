var app = angular.module('wfh', []);
app.config(['$httpProvider', function ($httpProvider) {
  // Intercept POST requests, convert to standard form encoding
  $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
  $httpProvider.defaults.transformRequest.unshift(function (data, headersGetter) {
    var key, result = [];

    if (typeof data === "string")
      return data;

    for (key in data) {
      if (data.hasOwnProperty(key))
        result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
    }
    return result.join("&");
  });
}]);

app.controller('CardController', ['$scope','$http','$timeout',function($scope,$http,$timeout) {
	function getRandomReason() {
        $scope.loading = true;
		$http.get('/getRandomReason').
		success(function(data, status, headers, config) {
			$scope.reason = data;
		}).
		error(function(data, status, headers, config) {
		// called asynchronously if an error occurs
		// or server returns response with an error status.
            $scope.loading = false;
		});
	};

	function submitVote(id, type) {
        $scope.loading = true;
		$http.post('/vote/'+id+'/'+type, {}).
		  success(function(data, status, headers, config) {
		    // this callback will be called asynchronously
		    // when the response is available
		  }).
		  error(function(data, status, headers, config) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
            $scope.loading = false;
		  });
	};

	function postReason() {
		$http.post('/reason', {"xReason": $scope.x.reason}).
		  success(function(data, status, headers, config) {
		    $scope.reason = {
		    	id: data.id,
		    	what: $scope.x.reason,
			votes: {up:0, down:0}
		    };
			$scope.isSubmittingReason = false;
			$scope.x.reason = "";
		  }).
		  error(function(data, status, headers, config) {
            $scope.loading = false;
		  });
	};

	var initializing = true;
    getRandomReason();

	$scope.isSubmittingReason = false;
	$scope.x = {reason: ""};

	$scope.vote = function(vote){
		submitVote( $scope.reason.id, vote );
		getRandomReason();
	};

	$scope.submit = function(type) {
		if (type=="cancel") {
			$scope.isSubmittingReason = false;
		}else if (type=="save"){
			if ($scope.x.reason.trim()!="") {
	            $scope.loading = true;
				postReason();				
			}else{
				alert("Please type your reason.");
			}
		}
	};

	$scope.$watch('reason', function() {
		if (initializing) {
			$timeout(function() { initializing = false; });
		} else {
			$scope.loading = false;
		}
	});
}]);

app.directive('focusMe', ['$timeout',function($timeout) {
  return {
    scope: { trigger: '=focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === true) { 
	        element[0].focus();
	        scope.trigger = false;
        }
      });
    }
  };
}]);
