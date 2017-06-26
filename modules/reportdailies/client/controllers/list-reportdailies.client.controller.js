(function() {
    'use strict';

    angular
        .module('reportdailies')
        .controller('ReportdailiesListController', ReportdailiesListController);

    ReportdailiesListController.$inject = ['ReportdailiesService', 'ReportdailiesDayService'];

    function ReportdailiesListController(ReportdailiesService, ReportdailiesDayService) {
        var vm = this;
        vm.reportDate = null;
        vm.searchReport = searchReport;
        vm.reportdailies = ReportdailiesService.query();

        function searchReport(reportDate) {
            ReportdailiesDayService.getReportDailies('2017-06-25').then(function(report) {
                console.log(report);
            }, function(error) {
                console.error(error);
            });
        }
    }
}());
