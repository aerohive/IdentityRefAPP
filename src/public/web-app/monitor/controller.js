angular.module('Monitor').controller("MonitorCtrl", function ($scope, monitorService, userGroupsService, userTypesService) {
    $scope.requestForMonitor = null;
    var requestForUserGroups = null;
    var initialized = false;
    var devices = [];
    $scope.devices = [];
    $scope.userTypes = userTypesService.getUserTypes();

    // pagination var
    $scope.itemsByPage = 10;
    $scope.currentPage = 1;

    // filter only on connected user by default
    $scope.connected = true;
    $scope.notConnected = false;


    $scope.query = {
        show: false,
        filter: ""
    };

    $scope.removeFilter = function () {
        $scope.query.show = false;
        $scope.query.filter = '';
    };

    if (requestForUserGroups) requestForUserGroups.abort();
    requestForUserGroups = userGroupsService.getUserGroups();
    requestForUserGroups.then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise.userGroups;
            $scope.userGroupsLoaded = function () {
                return userGroupsService.isLoaded();
            };
            $scope.requestForMonitor = monitorService.getDevices();
            $scope.requestForMonitor.then(function (promise) {
                initialized = true;
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error, "MonitorCtrl");
                else {
                    devices = promise;
                    $scope.monitorLoaded = function () {
                        return monitorService.isLoaded()
                    };
                    filterConnectionState();
                }
            });
        }
    });

    function filterConnectionState() {
        if (devices) {
            if ($scope.connected == false && $scope.notConnected == false) {
                devices.forEach(function (device) {
                    if ($scope.query.filter === "" || device.userName.toString().toLowerCase().indexOf($scope.query.filter.toString().toLowerCase()) >= 0) $scope.devices = angular.copy(devices);
                });
            } else {
                $scope.devices = [];
                if ($scope.connected == true) {
                    devices.forEach(function (device) {
                        if (device.clients.length > 0) {
                            if ($scope.query.filter === "" || device.userName.toString().toLowerCase().indexOf($scope.query.filter.toString().toLowerCase()) >= 0) $scope.devices.push(device);
                        }
                    })
                }
                if ($scope.notConnected == true) {
                    devices.forEach(function (device) {
                        if (device.clients.length == 0) {
                            if ($scope.query.filter === "" || device.userName.indexOf($scope.query.filter) >= 0)$scope.devices.push(device);
                        }
                    })
                }
            }
        }

    }

    $scope.page = function (num) {
        $scope.itemsByPage = num;
    };
    $scope.isCurPage = function (num) {
        return num === $scope.itemsByPage;
    };

    $scope.$watch('userTypes', function () {
        $scope.refresh();
    }, true);

    $scope.$watch("userGroups", function () {
        $scope.refresh();
    }, true);
    $scope.$watch("connected", function () {
        filterConnectionState();
    });
    $scope.$watch("notConnected", function () {
        filterConnectionState();
    });
    $scope.$watch("query.filter", function () {
        filterConnectionState();
    });

    $scope.refresh = function () {
        if (initialized) {
            $scope.requestForMonitor.abort();
            $scope.requestForMonitor = monitorService.getDevices();
            $scope.requestForMonitor.then(function (promise) {
                if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
                else {
                    devices = promise;
                    filterConnectionState();
                }
            });
        }
    };
    $scope.userString = function (user) {
        if (user.clients.length == 0) return user.userName + " is currently not connected.";
        else return user.userName + " is currently connected.";
    };
    $scope.userColor = function (user) {
        if (user.clients.length == 0) return "{color: '#aca5a3'}";
        else return "{color: '#75D064'}";
    };
    $scope.userConnected = function (user) {
        return user.clients.length > 0;
    };
    $scope.clientString = function (client) {
        return '<div style="text-align: left">' + client.hostName + " is currently connected <br>" +
            "Health: " + client.clientHealth + '<br>' +
            'Application Health: <span class="' + $scope.clientStringColorClass(client.applicationHealth) + '">' + client.applicationHealth + '</span><br>' +
            'Network Health: <span class="' + $scope.clientStringColorClass(client.networkHealth) + '">' + client.networkHealth + '</span><br>' +
            'Radio Health: <span class="' + $scope.clientStringColorClass(client.radioHealth) + '">' + client.radioHealth + '</span>' +
            '</div>';
    };
    $scope.clientStringColorClass = function (score) {
        if (score == 100) return "green";
        else if (score >= 50) return "yellow";
        else return "red";
    };
    $scope.clientColor = function (healthScore) {
        if (healthScore == 100) return "{color: '#75D064'}";
        else if (healthScore >= 50) return "{color: '#FFCF5C'}";
        else return "{color: '#d04d49'}";
    };
    $scope.showClients = function (user) {
        if (user.showClients == true) user.showClients = false;
        else if (user.clients.length > 0)user.showClients = true;
    };
    $scope.clientsLink = function (user) {
        if (user.clients.length > 0) return "{'color': '#0093D1', 'text-decoration': 'underline'}";
        else return "";
    }
});
