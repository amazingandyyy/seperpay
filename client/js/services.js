'use strict';

angular
    .module('pinchApp')
    .service('Account', Account)
    .service('Payment', Payment)
    .factory('focus', focus)
    .service('Plan', Plan)
    // .directive('stateLoadingIndicator', stateLoadingIndicator)
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

function Plan($q) {
    var previewPlan = {}
    this.addSinglePreview = (plan) => {
        return $q((res, rej) => {
            previewPlan = plan
            res(previewPlan)
        })
    }
    this.getSinglePreview = () => {
        return $q((res, rej) => {
            if(previewPlan){
                res(previewPlan)
            }
        })
    }
}
// function stateLoadingIndicator($rootScope) {
//     return {
//         restrict: 'E',
//         template: "<div ng-show='isStateLoading' class='loading-indicator'>" +
//             "<div class='loading-indicator-body'>" +
//             "<h3 class='loading-title'>Loading...</h3>" +
//             "<div class='spinner'><chasing-dots-spinner></chasing-dots-spinner></div>" +
//             "</div>" +
//             "</div>",
//         replace: true,
//         link: function(scope, elem, attrs) {
//             scope.isStateLoading = false;
//
//             $rootScope.$on('$stateChangeStart', function() {
//                 console.log('start')
//                 scope.isStateLoading = true;
//             });
//             $rootScope.$on('$stateChangeSuccess', function() {
//                 console.log('complete')
//                 scope.isStateLoading = false;
//             });
//         }
//     };
// }
