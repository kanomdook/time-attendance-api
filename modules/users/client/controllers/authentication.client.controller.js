'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'NgMap', '$uibModal','$geolocation',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, NgMap, $uibModal,$geolocation) {
    $geolocation.getCurrentPosition({
            timeout: 60000,
            enableHighAccuracy: true
         }).then(function(position) {
            $scope.myPosition = {
              lat:position.coords.latitude,
              lng:position.coords.longitude
            };
         });

    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.showGoogleMap = function () {
      var modal = $uibModal.open({
        animation: true,
        templateUrl: 'myModalContent.html',
        size: 'lg',
        controller: function ($scope) {
          $scope.cancel = function () {
            modal.dismiss('cancel');
          };
          $scope.ok = function(){
            
          };
        }
      });
    };

    $scope.hideRegisterForm = false;
    $scope.hideCompanyForm = true;

    $scope.init = function () {
      $http.get('json/postcode.json').success(function (response) {
        $scope.postcode = response.postcodeData;
      }).error(function (error) {

      });
      $http.get('json/country-language.json').success(function (response) {
        $scope.country = response.countryData;
      }).error(function (error) {

      });
    };

    $scope.nextStep = function () {
      $scope.hideRegisterForm = true;
      $scope.hideCompanyForm = false;
    };

    $scope.backStep = function () {
      $scope.hideCompanyForm = true;
      $scope.hideRegisterForm = false;
    };

    $scope.createData = function (credentials, company) {
      $http.post('/api/auth/signup', credentials).success(function (user) {
        createCompany(company, user, credentials);
      }).error(function (err) {
        console.log('Error' + err);
      });
    };

    function createCompany(company, user, credentials) {
      company.user = user._id;
      $http.post('/api/companies', company).success(function (comp) {
        updateUser(user, comp._id, credentials);
      }).error(function (err) {
        console.log('Error' + err);
      });
    }

    function updateUser(user, comp_id, credentials) {
      user.company = comp_id;
      user.password = credentials.password;
      $http.put('/api/users', user).success(function (res) {
        $window.location.reload();
      }).error(function (err) {
        console.log('Error' + err);
      });
    }

    $scope.signup = function (isValid) {
      $scope.error = null;
      $scope.startCall = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.startCall = false;

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $scope.startCall = false;
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.startCall = false;

        $scope.error = response.message;
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;
      $scope.startCall = true;
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        $scope.startCall = false;
        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;
        $scope.startCall = false;
        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        $scope.startCall = false;
        $scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);
