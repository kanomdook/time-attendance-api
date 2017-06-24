// Reportsummarymonthlies service used to communicate Reportsummarymonthlies REST endpoints
(function () {
  'use strict';

  angular
    .module('reportsummarymonthlies')
    .factory('ReportsummarymonthliesService', ReportsummarymonthliesService);

  ReportsummarymonthliesService.$inject = ['$resource'];

  function ReportsummarymonthliesService($resource) {
    return $resource('api/reportsummarymonthlies/:reportsummarymonthlyId', {
      reportsummarymonthlyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
