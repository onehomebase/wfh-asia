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

app.controller('CardController', ['$scope','$http','$timeout','$location', function($scope,$http,$timeout,$location) {
	function getRandomReason() {
        $scope.loading = true;
		$http.get('/getRandomReason/'+$scope.x.country).
		success(function(data, status, headers, config) {
            if (data.status==200) {
                $scope.reason = data;
            }else{
                alert(data.message);
                $scope.isSubmittingReason = true;
                $scope.loading = false;
            }
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
		$http.post('/reason', {"xReason": $scope.x.reason, "xCountry": $scope.x.country}).
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
    var uriParams = $location.search();
    
    $scope.isSubmittingReason = false;
	$scope.x = {reason: "", country:""};
    
    $scope.country_title = {
        "ph": "Sick leave ako ngayon dahil...",
        "sg": "I'm working from home today because...",
        "my": "I'm working from home today because..."
    };

    if ($scope.country_title[uriParams.country]!=undefined) {
        $scope.x.country = uriParams.country;
    }
    
    if ($scope.x.country!="") {
        getRandomReason();
    }
    
    $scope.changeCountry = function(){
        $location.search('country', $scope.x.country);
    };
        
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
