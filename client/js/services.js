'use strict';

angular
    .module('pinchApp')
    .service('Account', Account)
    .service('Payment', Payment)
    .factory('focus', focus)

function Account($http) {
    this.getCurrentUser = () => {
        return $http({
            method: 'GET',
            url: `/api/auth/currentUser`
        })
    }
    this.sendVerifyCode = (userObj) => {
        return $http({
            method: 'POST',
            url: `/api/verify/phone`,
            data: userObj
        })
    }
    this.verifyCode = (userObj) => {
        return $http({
            method: 'PUT',
            url: `/api/verify/phone`,
            data: userObj
        })
    }
    this.getUserData = (uriUserId) => {
        return $http({
            method: 'GET',
            url: `/api/users/${uriUserId}`
        })
    }
    this.updateUserData = (uriUserId, updateUserData) => {
        return $http({
            method: 'PUT',
            url: `/api/users/${uriUserId}`,
            data: updateUserData
        })
    }
}

function Payment($http){
    this.chargeNow = (dataObj) => {
        return $http({
            method: 'POST',
            url: `/api/payment/chargeNow`,
            data: dataObj
        })
    }
}

function focus($rootScope, $timeout) {
    return function(name) {
        $timeout(function() {
            $rootScope.$broadcast('focusOn', name);
        }, 0);
    }
}
