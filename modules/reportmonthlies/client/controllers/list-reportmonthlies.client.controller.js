(function() {
    'use strict';

    angular
        .module('reportmonthlies')
        .controller('ReportmonthliesListController', ReportmonthliesListController);

    ReportmonthliesListController.$inject = ['ReportmonthlyService'];

    function ReportmonthliesListController(ReportmonthlyService) {
        var vm = this;
        // vm.reportmonthlies = ReportmonthliesService.query();
        vm.reportDate = new Date();
        vm.searchReport = searchReport;
        vm.reportData = null;
        vm.startCall = false;

        function searchReport(reportDate) {
            vm.reportData = null;
            var date = new Date(reportDate).getDate();
            var month = new Date(reportDate).getMonth() + 1;
            var year = new Date(reportDate).getFullYear();
            var inputDate = year + "-" + ((month) < 10 ? "0" + month : month) + "-" + (date < 10 ? "0" + date : date);
            console.warn(inputDate);
            ReportmonthlyService.getReportMonthlies(inputDate, '5951ef170cd34d10005badaf').then(function(report) {
                console.log(report);
                vm.reportData = report;
                if (vm.reportData.data.length) {
                    vm.startCall = false;
                } else {
                    vm.startCall = true;
                }
            }, function(error) {
                console.error(error);
                vm.startCall = true;
            });
        }
    }
}());
