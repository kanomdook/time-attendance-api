(function () {
  'use strict';

  angular
    .module('leaves')
    .controller('LeavesListController', LeavesListController);

  LeavesListController.$inject = ['LeavesService', '$http'];

  function LeavesListController(LeavesService, $http) {
    var vm = this;

    vm.leaves = LeavesService.query();
    vm.searchLeave = searchLeave;
    function searchLeave(startDate, endDate, leaveType) {
      if (leaveType === 'All') {
        vm.leaves = LeavesService.query();
      } else {
        $http.post('/api/getLeaveByLeaveTypeAndDate', { leaveType: leaveType, startDate: startDate, endDate: endDate }).success(function (leaves) {
          vm.leaves = leaves;
        }).error(function (error) {
        });
      }
    }
  }
}());
