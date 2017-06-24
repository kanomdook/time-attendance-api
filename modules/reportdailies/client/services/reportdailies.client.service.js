// Reportdailies service used to communicate Reportdailies REST endpoints
(function () {
  'use strict';

  angular
    .module('reportdailies')
    .factory('ReportdailiesService', ReportdailiesService);

  ReportdailiesService.$inject = ['$resource'];

  function ReportdailiesService($resource) {
    return $resource('api/reportdailies/:reportdailyId', {
      reportdailyId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
}());
