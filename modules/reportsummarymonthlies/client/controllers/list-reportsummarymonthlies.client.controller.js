(function () {
  'use strict';

  angular
    .module('reportsummarymonthlies')
    .controller('ReportsummarymonthliesListController', ReportsummarymonthliesListController);

  ReportsummarymonthliesListController.$inject = ['ReportsummarymonthliesService'];

  function ReportsummarymonthliesListController(ReportsummarymonthliesService) {
    var vm = this;

    vm.reportsummarymonthlies = ReportsummarymonthliesService.query();
  }
}());
