angular.module('Credentials').controller("CredentialsCtrl", function ($scope, $rootScope, $mdDialog, userTypesService, userGroupsService, credentialsService, exportService, deleteUser) {
    $scope.hmngType = $rootScope.hmngType;

    $scope.test = null;
    var requestForUserGroups = null;
    var initialized = false;
    $scope.exportFields = exportService.getFields();
    $scope.userTypes = userTypesService.getUserTypes();

    $scope.requestForCredentials = null;
    $scope.credentials = null;
    var credentials = [];
    // table items
    $scope.selectAllChecked = false;
    $scope.selectedItems = 0;
    // pagination
    $scope.itemsByPage = 10;
    $scope.currentPage = 1;

    $scope.table = {
        show: false,
        filter: "",
        order: 'userName'
    };

    $scope.removeFilter = function () {
        $scope.table.show = false;
        $scope.table.filter = '';
    };


    requestForUserGroups = userGroupsService.getUserGroups();
    requestForUserGroups.then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise.userGroups;
            $scope.userGroupsLoaded = function () {
                return userGroupsService.isLoaded();
            };
            $scope.requestForCredentials = credentialsService.getCredentials();
            $scope.requestForCredentials.then(function (promise) {
                initialized = true;
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    credentials = promise;
                    $scope.credentials = promise;
                    $scope.credentialsLoaded = function () {
                        return credentialsService.isLoaded()
                    };
                }
            });
        }
    });


    $scope.$watch("userGroups", function () {
        $scope.selectAllChecked = false;
        $scope.selectAll();
        $scope.refresh();
    }, true);
    $scope.$watch('userTypes', function () {
        $scope.refresh();
    }, true);

    $scope.$watch("table.filter", function () {
        $scope.credentials = [];
        credentials.forEach(function (credential) {
            if ($scope.table.filter == ""
                || (credential.userName && credential.userName.toString().toLowerCase().indexOf($scope.table.filter.toString().toLowerCase()) >= 0)
                || (credential.email && credential.email.toString().toLowerCase().indexOf($scope.table.filter.toString().toLowerCase()) >= 0)
                || (credential.phone && credential.phone.indexOf($scope.table.filter) >= 0))
                $scope.credentials.push(credential);
        })

    });

    $scope.onlyOneSelected = function () {
        return $scope.selectedItems === 1;
    };
    $scope.moreThanOneSelected = function () {
        return $scope.selectedItems >= 1;
    };


    $scope.selectAll = function () {
        if ($scope.credentials){
            $scope.credentials.forEach(function (cred) {
                cred.selected = $scope.selectAllChecked;
            });
            if ($scope.selectAllChecked) $scope.selectedItems = $scope.credentials.length;
            else $scope.selectedItems = 0;
        }
    };
    $scope.selectOne = function (cred, row) {
        if (row) cred.selected = !cred.selected;

        if (cred.selected) {
            $scope.selectedItems++;
        } else $scope.selectedItems--;
        $scope.selectAllChecked = $scope.selectedItems == $scope.credentials.length;
    };


    $scope.sendBySms = function () {
        var credentials = [];
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                credentials.push(credential);
            }
        });
        if (credentials.length == 1) {
            $mdDialog.show({
                controller: 'DialogSendBySmsController',
                templateUrl: 'modals/modalSendBySmsContent.html',
                locals: {
                    items: {
                        account: credentials[0]
                    }
                }
            });
        }
    };
    $scope.sendByEmail = function () {
        var credentials = [];
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                credentials.push(credential);
            }
        });
        if (credentials.length == 1) {
            $mdDialog.show({
                controller: 'DialogSendByEmailController',
                templateUrl: 'modals/modalSendByEmailContent.html',
                locals: {
                    items: {
                        account: credentials[0]
                    }
                }
            });
        }
    };
    $scope.refresh = function () {
        if (initialized) {
            $scope.selectAllChecked = false;
            $scope.selectAll();
            $scope.requestForCredentials = credentialsService.getCredentials();
            $scope.requestForCredentials.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    credentials = promise;
                    $scope.credentials = promise;
                }
            });
        }
    };

    $scope.deleteCredentials = function (ev) {
        var ids = [];
        var userNames = [];
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                ids.push(credential.id);
                userNames.push(credential.userName);
            }
        });
        if (ids.length == 1) {
            $mdDialog.show({
                controller: 'DialogConfirmController',
                templateUrl: 'modals/modalConfirmContent.html',
                locals: {
                    items: {
                        userName: userNames[0],
                        action: 'delete'
                    }
                }
            }).then(function () {
                credentialsService.setIsLoaded(false);
                var deleteCredentials = deleteUser.deleteCredentials(ids);
                deleteCredentials.then(function (promise) {
                    credentialsService.setIsLoaded(true);
                    if (promise && promise.error) $scope.$broadcast("apiWarning", promise.error);
                    else $scope.refresh();
                });
            });
        } else if (ids.length > 1) {
            $mdDialog.show({
                controller: 'DialogConfirmController',
                templateUrl: 'modals/modalConfirmContent.html',
                locals: {
                    items: {
                        numberOfAccounts: ids.length,
                        action: 'delete'
                    }
                }
            }).then(function () {
                credentialsService.setIsLoaded(false);
                var deleteCredentials = deleteUser.deleteCredentials(ids);
                deleteCredentials.then(function (promise) {
                    credentialsService.setIsLoaded(true);
                    if (promise && promise.error) $scope.$broadcast("apiWarning", promise.error);
                    else $scope.refresh();
                });
            })
        }
    };
    $scope.renewCredentials = function (ev) {
        var user;
        $scope.credentials.forEach(function (credential) {
            if (credential.selected) {
                user = credential;
            }
        });
        if (user) {
            $mdDialog.show({
                controller: 'DialogConfirmController',
                templateUrl: 'modals/modalConfirmContent.html',
                locals: {
                    items: {
                        userName: user.userName,
                        action: 'renew'
                    }
                }
            }).then(function () {
                $rootScope.$broadcast("renewSingleUser", user);
            });
        }
    };
    $scope.exportSelectedUsers = function () {
        var credentials = [];
        $scope.credentials.forEach(function(cred){
            if (cred.selected) credentials.push(cred);
        });
        $mdDialog.show({
            templateUrl: 'modals/modalExportContent.html',
            controller: 'DialogExportController',
            locals: {
                items: {
                    credentials: credentials,
                    exportFields: $scope.exportFields
                }
            }
        });
    }
});
