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
        vm.exportReport = exportReport;
        vm.reportdailies = ReportdailiesService.query();
        vm.reportData = null;
        vm.showNull = false;

        function searchReport(reportDate) {
            vm.startCall = true;
            var date = new Date(reportDate).getDate();
            var month = new Date(reportDate).getMonth() + 1;
            var year = new Date(reportDate).getFullYear();
            var inputDate = year + "-" + ((month) < 10 ? "0" + month : month) + "-" + (date < 10 ? "0" + date : date);
            console.warn(inputDate);
            ReportdailiesDayService.getReportDailies(inputDate).then(function(report) {
                console.log(report);
                vm.reportData = report;
                vm.startCall = false;
                if (vm.reportData.data.length) {
                    vm.showNull = false;
                } else {
                    vm.showNull = true;
                }
            }, function(error) {
                console.error(error);
                vm.startCall = false;
                vm.showNull = true;
            });
        }

        // function exportReport(report) {
            // ReportdailiesDayService.exportReportDailies(report);
        // }
    }
}());
