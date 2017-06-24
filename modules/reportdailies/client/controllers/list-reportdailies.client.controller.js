(function () {
  'use strict';

  angular
    .module('reportdailies')
    .controller('ReportdailiesListController', ReportdailiesListController);

  ReportdailiesListController.$inject = ['ReportdailiesService'];

  function ReportdailiesListController(ReportdailiesService) {
    var vm = this;

    vm.reportdailies = ReportdailiesService.query();
  }
}());
