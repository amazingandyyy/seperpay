'use strict';

angular
    .module('pinchApp')
    .service('Account', Account)
    .service('Payment', Payment)
    .factory('focus', focus)
    .service('Plan', Plan)
    .service('Storage', Storage)

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

function Payment($http) {
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

function Plan($q, Storage, $http) {
    this.addSinglePreview = (plan) => {
        return $q((res, req) => {
            localStorage.planPreviewData = JSON.stringify(plan)
            res(localStorage.planPreviewData)
        })
    }
    this.getSinglePreview = () => {
        return $q((res, rej) => {
            res(JSON.parse(localStorage.planPreviewData))
        })
    }

    this.saveSinglePlan = (data) => {
        return $http({
            method: 'POST',
            url: `/api/plans/saveSinglePlan`,
            data: data
        })
    }

}

function Storage($q) {
    this.get = () => {
        // return $q((res, rej) => {
        //     if (!localStorage.seperpay) {
        //         localStorage.seperpay = {}
        //         res(JSON.parse(localStorage.seperpay))
        //     } else if (localStorage.seperpay) {
        //         res(JSON.parse(localStorage.seperpay))
        //     }
        // })
    }

    this.save = (obj) => {
        console.log('obj: ', obj);
        // var key = obj
        // var obj = JSON.stringify(obj)
        // localStorage
    }
}
