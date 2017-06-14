(function () {
  'use strict';

  angular
    .module('leaves')
    .controller('LeavesListController', LeavesListController);

  LeavesListController.$inject = ['LeavesService'];

  function LeavesListController(LeavesService) {
    var vm = this;

    vm.leaves = LeavesService.query();
  }
}());
