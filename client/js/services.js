'use strict';

angular
    .module('pinchApp')
    .service('Account', Account)
    .service('Project', Project)
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

function Project($http) {
    this.createOne = (newPojectObj) => {
        return $http({
            method: 'POST',
            url: '/api/projects/',
            data: newPojectObj
        })
    }
    this.getAll = () => {
        return $http({
            method: 'GET',
            url: '/api/projects/all'
        })
    }
    this.getOnePorject = (projectId) => {
        return $http({
            method: 'GET',
            url: `/api/projects/${projectId}`
        })
    }
    this.deleteOne = (projectId) => {
        return $http({
            method: 'DELETE',
            url: `/api/projects/${projectId}`
        })
    }
    this.deleteOne = (projectId) => {
        return $http({
            method: 'DELETE',
            url: `/api/projects/${projectId}`
        })
    }
    this.like = (projectId, likerId) => {
        return $http({
            method: 'PUT',
            url: `/api/projects/event/like`,
            data: {
                projectId: projectId,
                likerId: likerId
            }
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
