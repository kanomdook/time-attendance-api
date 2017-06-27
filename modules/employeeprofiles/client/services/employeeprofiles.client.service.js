// Employeeprofiles service used to communicate Employeeprofiles REST endpoints
(function () {
  'use strict';

  angular
    .module('employeeprofiles')
    .factory('EmployeeprofilesService', EmployeeprofilesService)
    .service('EmployeeService', EmployeeService);

  EmployeeprofilesService.$inject = ['$resource'];

  function EmployeeprofilesService($resource) {
    return $resource('api/employee/company/:employeeprofileId', {
      employeeprofileId: '@_id'
    }, {
        update: {
          method: 'PUT'
        }
      });
  }

  EmployeeService.$inject = ['$http', '$q'];

  function EmployeeService($http, $q) {
    this.getChenckinByMonth = function (yearMonth, userid) {
      var deferred = $q.defer();
      $http.get('/api/checkins/yearmonth&userid/' + yearMonth + '/' + userid).success(function (checkins) {
        deferred.resolve(checkins);
      }).error(function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };

    this.getleaveByUser = function (userid) {
      var deferred = $q.defer();
      $http.get('/api/leaves/userid/' + userid).success(function (leaves) {
        deferred.resolve(leaves);
      }).error(function (error) {
        deferred.reject(error);
      });
      return deferred.promise;
    };
  }
}());
