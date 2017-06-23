(function() {
    'use strict';

    // Employeeprofiles controller
    angular
        .module('employeeprofiles')
        .controller('EmployeeprofilesController', EmployeeprofilesController);

    EmployeeprofilesController.$inject = ['$scope', '$state', '$window', 'Authentication', 'employeeprofileResolve', 'FileUploader', '$timeout', '$http'];

    function EmployeeprofilesController($scope, $state, $window, Authentication, employeeprofile, FileUploader, $timeout, $http) {
        var vm = this;

        vm.authentication = Authentication;
        vm.employeeprofile = employeeprofile;
        vm.error = null;
        vm.form = {};
        vm.remove = remove;
        vm.save = save;
        vm.init = init;

        $scope.postcode = null;
        $scope.language = null;

        if (!vm.employeeprofile._id) {
            vm.employeeprofile.images = [];
            vm.employeeprofile.address = {
                country: {
                    cca2: "TH",
                    cca3: "THA",
                    en: {
                        common: "Thailand",
                        official: "Kingdom of Thailand"
                    },
                    th: "ราชอาณาจักรไทย",
                    currency: "THB"
                }
            };
        }

        function init() {
            $http.get('json/postcode.json').success(function(response) {
                $scope.postcode = response.postcodeData;
            }).error(function(error) {

            });
            $http.get('json/country-language.json').success(function(response) {
                $scope.country = response.countryData;
            }).error(function(error) {

            });
        }


        // Create file uploader instance
        $scope.uploader = new FileUploader({
            url: 'api/users/picture',
            alias: 'newProfilePicture'
        });

        // Set file uploader image filter
        $scope.uploader.filters.push({
            name: 'imageFilter',
            fn: function(item, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // Called after the user selected a new picture file
        $scope.uploader.onAfterAddingFile = function(fileItem) {
            if ($window.FileReader) {
                var fileReader = new FileReader();
                fileReader.readAsDataURL(fileItem._file);

                fileReader.onload = function(fileReaderEvent) {
                    $timeout(function() {
                        vm.employeeprofile.image = fileReaderEvent.target.result;
                    }, 0);
                };
            }
        };

        // Called after the user has successfully uploaded a new picture
        $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
            // Show success message
            $scope.success = true;

            // Populate user object
            //  vm.employeeprofile.image = response;

            // Clear upload buttons
            $scope.cancelUpload();
        };

        // Called after the user has failed to uploaded a new picture
        $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
            // Clear upload buttons
            $scope.cancelUpload();

            // Show error message
            $scope.error = response.message;
        };

        // Change user profile picture
        $scope.uploadProfilePicture = function() {
            // Clear messages
            $scope.success = $scope.error = null;

            // Start upload
            $scope.uploader.uploadAll();
        };

        // Cancel the upload process
        $scope.cancelUpload = function() {
            $scope.uploader.clearQueue();
            $scope.imageURL = vm.employeeprofile.image;
        };

        // Remove existing Employeeprofile
        function remove() {
            if ($window.confirm('Are you sure you want to delete?')) {
                vm.employeeprofile.$remove($state.go('employeeprofiles.list'));
            }
        }

        // Save Employeeprofile
        function save(isValid) {

            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.form.employeeprofileForm');
                return false;
            }
            // TODO: move create/update logic to service
            if (vm.employeeprofile._id) {
                vm.employeeprofile.$update(successCallback, errorCallback);
            } else {
                vm.employeeprofile.company = vm.authentication.user.company;
                vm.employeeprofile.leader = null;
                vm.employeeprofile.$save(successCallback, errorCallback);
            }

            function successCallback(res) {
                $state.go('employeeprofiles.view', {
                    employeeprofileId: res._id
                });
            }

            function errorCallback(res) {
                vm.error = res.data.message;
            }
        }
    }
}());
