(function () {
  'use strict';

  angular
    .module('reportmonthlies')
    .controller('ReportmonthliesListController', ReportmonthliesListController);

  ReportmonthliesListController.$inject = ['ReportmonthliesService'];

  function ReportmonthliesListController(ReportmonthliesService) {
    var vm = this;

    vm.reportmonthlies = ReportmonthliesService.query();
  }
}());
