(function() {
    'use strict';

    angular
        .module('reportdailies')
        .controller('ReportdailiesListController', ReportdailiesListController);

    ReportdailiesListController.$inject = ['ReportdailiesService', 'ReportdailiesDayService'];

    function ReportdailiesListController(ReportdailiesService, ReportdailiesDayService) {
        var vm = this;
        vm.reportDate = new Date();
        vm.searchReport = searchReport;
        vm.reportdailies = ReportdailiesService.query();

        function searchReport(reportDate) {
            var date = new Date(reportDate).getDate();
            var month = new Date(reportDate).getMonth() + 1;
            var year = new Date(reportDate).getFullYear();
            var inputDate = year + "-" + ((month) < 10 ? "0" + month : month) + "-" + (date < 10 ? "0" + date : date);
            console.warn(inputDate);
            ReportdailiesDayService.getReportDailies('2017-06-25').then(function(report) {
                console.log(report);
            }, function(error) {
                console.error(error);
            });
        }
    }
}());
