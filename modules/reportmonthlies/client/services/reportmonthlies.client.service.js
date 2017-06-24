// Reportmonthlies service used to communicate Reportmonthlies REST endpoints
(function () {
  'use strict';

  angular
    .module('reportmonthlies')
    .factory('ReportmonthliesService', ReportmonthliesService);

  ReportmonthliesService.$inject = ['$resource'];

  function ReportmonthliesService($resource) {
    return $resource('api/reportmonthlies/:reportmonthlyId', {
      reportmonthlyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
