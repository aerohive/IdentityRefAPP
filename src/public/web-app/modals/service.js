angular.module("Modals").factory("connectionStatusService", function ($http, $q, $rootScope) {
    var status = {};
    var promise = null;

    function getStatus(userName) {
        status = {};

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/status",
            method: "GET",
            params: {userName: userName},
            timeout: canceller.promise
        });

        if (promise) promise.abort();
        promise = request.then(
            function (response) {
                if (response.data) {
                    if (response.data.error) return response.data;
                    else {
                        status = response.data;
                        return status;
                    }
                } else return true;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        getStatus: getStatus
    }
});

angular.module("Modals").factory("sendCredentialsService", function ($http, $q, $rootScope) {

    var promise = null;

    function deliver(credentialId, deliverMethod, email, phone) {

        var hmCredentialDeliveryInfoVo = {
            credentialId: credentialId,
            deliverMethod: deliverMethod,
            email: email,
            phone: phone
        };
        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/credentials/deliver",
            method: "POST",
            data: {hmCredentialDeliveryInfoVo: hmCredentialDeliveryInfoVo},
            timeout: canceller.promise
        });

        if (promise) promise.abort();
        promise = request.then(
            function (response) {
                if (response.data) {
                    if (response.data.error) return response.data;
                    else {
                        status = response.data;
                        return status;
                    }
                } else return true;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        deliver: deliver
    }
});

angular.module("Modals").factory("iOSProfileService", function ($http, $q, $rootScope) {
    var status = {};
    var promise = null;

    function sendProfile(userName, activeTime, ssid, password, destEmail) {
        status = {};

        if (!destEmail) destEmail = userName;

        var data = {
            userName: userName,
            activeTime: activeTime,
            ssid: ssid,
            password: password,
            destEmail: destEmail
        };

        var canceller = $q.defer();
        var request = $http({
            url: "/mailer/ios",
            method: "POST",
            data: data,
            timeout: canceller.promise
        });

        if (promise) promise.abort();
        promise = request.then(
            function (response) {
                if (response.data) {
                    if (response.data.error) return response.data;
                    else {
                        status = response.data;
                        return status;
                    }
                } else return true;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        sendProfile: sendProfile
    }
});


angular.module("Modals").factory("renewUserService", function ($http, $q, $rootScope) {

    function renewCredentials(id) {

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/credentials/renew",
            method: "PUT",
            params: {id: id},
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response) {
                 if ( response.data && response.data.error) return response.data;
                 else return response;
                }
                else return true;
            },
            function (response) {
                if (response.status && response.status >= 0) {
                    $rootScope.$broadcast('serverError', response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }

    return {
        renewCredentials: renewCredentials
    }
});
