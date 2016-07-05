'use strict';

angular
    .module('pinchApp')
    .controller('navCtrl', navCtrl)
    .controller('homeCtrl', homeCtrl)
    .controller('ppageCtrl', ppageCtrl)
    .controller('profileSettingCtrl', profileSettingCtrl)
    .controller('projectpageCtrl', projectpageCtrl)
    .controller('projectSettingCtrl', projectSettingCtrl)


function homeCtrl() {
    console.log('homeCtrl loaded');
}

function projectSettingCtrl($scope, $http, $stateParams, Project, $state, $location) {
    console.log('projectSettingCtrl loaded');
    var isAuthor = false;
    var projectId = $stateParams.projectId;

    Project.getOnePorject(projectId).then(res => {
        console.log('projects: ', res.data);
        $scope.project = res.data;
        $scope.updateProjectData = $scope.project;
        $scope.project.author.forEach(author => {
            // in case, project has mutiple authors
            if (author._id == $scope.currentUser._id) {
                isAuthor = true;
            }
        })
        if (isAuthor) {
            console.log('isAuthor');
        } else {
            console.log('is not Author');
            $state.go('home');
        }
    }, err => {
        console.log('err when get this project: ', err);
    })
    $scope.request = {
        people: [],
        supply: [],
        money: []
    };

    $scope.init = () => {
        var checkUrl = $location.$$path.includes('danger') || $location.$$path.includes('request') || $location.$$path.includes('privacy')
        if (!checkUrl) {
            $state.go('projectSetting_general');
        }
    };

    $scope.addChoiceToPeople = (people) => {
        if ($scope.request.people.indexOf(people) !== -1) {
            $scope.request.people.splice($scope.request.people.indexOf(people), 1);
        } else {
            $scope.request.people.push(people);
        }
        console.log($scope.request.people);
    };

    $scope.addChoiceToSupply = (supply) => {
        if ($scope.request.supply.indexOf(supply) !== -1) {
            $scope.request.supply.splice($scope.request.supply.indexOf(supply), 1);
        } else {
            $scope.request.supply.push(supply);
        }
        console.log($scope.request.supply);
    }
    $scope.addChoiceToMoney = (money) => {
        if ($scope.request.money.indexOf(money) !== -1) {
            $scope.request.money.splice($scope.request.money.indexOf(money), 1);
            $scope.request.money = [];
        } else {
            $scope.request.money = [];
            $scope.request.money.push(money);
        }
        console.log($scope.request.money);
    }
    $scope.deleteProject = (projectFullName) => {
        if ($scope.deleteProjectInput == projectFullName) {
            let projectId = $stateParams.projectId;
            Project.deleteOne(projectId).then(res => {
                console.log('project deleted');
                console.log('res: ', res.data);
                $state.go('ppage', {
                    userId: $scope.currentUser._id
                });
            }, err => {
                console.log('user is not logged in.');
            })
        } else {
            console.log('no');
        }
    }

    $scope.dangerNotified = false;
    $scope.dangerNotifty = () => {
        $scope.dangerNotified = !$scope.dangerNotified;
    }
    $scope.sameToTheProjectName = (projectFullName) => {
        return $scope.deleteProjectInput == projectFullName;
    }
    $scope.okayToDelete = (projectFullName) => {
        console.log('$scope.dangerNotified: ', $scope.dangerNotified);
        return $scope.deleteProjectInput == projectFullName && $scope.dangerNotified;
    }
}

function projectpageCtrl($scope, $http, $stateParams, Project) {
    console.log('projectpageCtrl loaded');
    $scope.state = {}
    $scope.state.isAuthor = false
    var projectId = $stateParams.projectId;
    // console.log('projectId: ', projectId);
    Project.getOnePorject(projectId).then(res => {
        console.log('projectData: ', res.data);
        $scope.project = res.data
        console.log('$scope.currentUser._id: ', $scope.currentUser._id)
        console.log('$scope.project.author: ', $scope.project.author)
        var authors = res.data.author
        for (var author in authors) {
            if ($scope.currentUser._id == authors[author]._id) {
                return $scope.state.isAuthor = true;
            }
        }
    }, err => {
        console.log('err when get this project: ', err);
    })
    $scope.like = (likerId, projectId) => {
        console.log(likerId, 'clicks likeBtn of', projectId);
        if ($scope.state.isAuthor) {
            console.log('likeEvent triggered')
            Project.like(projectId, likerId).then(res => {
                        console.log('res: ', res);
                //         if (res.data.eventType == 'follow') {
                //             console.log('check');
                //             console.log('follwing: res, ', res.data)
                //             var follower = res.data.follower
                //             var followingReceiver = res.data.followingReceiver
                //             $scope.user.followersList.push(follower)
                //             checkFollowStatus()
                //         } else if (res.data.eventType == 'unfollow') {
                //             console.log('check');
                //             console.log('unfollwing: res, ', res.data)
                //             var unfollower = res.data.unfollower
                //             var unfollowingReceiver = res.data.unfollowingReceiver
                //             var index = $scope.user.followersList.indexOf(follower)
                //             $scope.user.followersList.splice(index, 1)
                //             checkFollowStatus()
                //         }
            }, err => {
                console.log('err when like/unlike: ', err)
            })
        }
    }
}

function profileSettingCtrl($scope, $http, $stateParams, Account, $state, $window, Upload, $location) {
    console.log('profileSettingCtrl loaded');

    if ($stateParams.userId == $scope.currentUser._id) {
        // console.log('isAuthUser');
        $scope.updateUserData = angular.copy($scope.currentUser);
    } else {
        // console.log('is not AuthUser');
        $state.go('home');
    }
    $scope.init = () => {
        var checkUrl = $location.$$path.includes('danger') || $location.$$path.includes('request') || $location.$$path.includes('privacy')
        if (!checkUrl) {
            $state.go('profileSetting_general');
        }
    };

    $scope.updateUserDataSubmitted = () => {
        var uriUserId = $scope.updateUserData._id;
        var updateUserData = $scope.updateUserData;
        Account.updateUserData(uriUserId, updateUserData).then(res => {
            $scope.updateUserData = res.data;
            $window.location.reload();
        }, err => {
            console.log('err when get update user data: ', err);
        })
    }
    $scope.photoUploading = false
    $scope.uploadFiles = (file) => {
        $scope.photoUploading = true;
        var file = file[0]
        var userId = $scope.currentUser._id;
        console.log('photo: ', file);
        if (file) {
            Upload.upload({
                url: `/api/upload/${userId}`,
                data: {
                    newFile: file
                }
            }).then(res => {
                console.log('res after upload: ', res.data);
                $window.location.reload();
            }, err => {
                console.log('err when upload file: ', err);
            })
        }
    }

}

function ppageCtrl($scope, $state, $rootScope, $stateParams, Project, Account, $timeout, $location) {
    console.log('ppageCtrl loaded')
    $scope.state = {}
    $scope.state.isTheUser = false
    $scope.state.followStatus = false
    var displayUser;
    var uriUserId = $stateParams.userId;
    if (uriUserId == $scope.currentUser._id) {
        $scope.state.isTheUser = true;
    }
    if ($scope.state.isTheUser) {
        console.log('isTheUser')
    } else {
        console.log('is not TheUser')
    }
    $scope.init = () => {
        checkingUrl()
    }

    function checkingUrl() {
        var checkUrl = $location.$$path.includes('starred') || $location.$$path.includes('followers')
        if (!checkUrl) {
            $state.go('ppage_projects');
        }
    }
    Account.getUserData(uriUserId).then(res => {
        $scope.user = res.data
        displayUser = res.data
        $scope.projects = res.data.projects.reverse();
        console.log('cards here: ', res.data.projects);
        $timeout(function() {
            checkFollowStatus()
        }, 0)
    }, err => {
        console.log('err when get userData: ', err);
    })

    $scope.createTime = (createAtTime) => {
        return moment(createAtTime).fromNow();
    }

    $scope.follow = (currentUser, followTarget) => {
        console.log('ffffff');
        console.log(currentUser, followTarget);
        if (currentUser !== followTarget && followTarget == uriUserId) {
            console.log('followEvent triggered')
            Account.follow(currentUser, followTarget).then(res => {
                console.log('res: ', res);
                if (res.data.eventType == 'follow') {
                    console.log('check');
                    console.log('follwing: res, ', res.data)
                    var follower = res.data.follower
                    var followingReceiver = res.data.followingReceiver
                    $scope.user.followersList.push(follower)
                    checkFollowStatus()
                } else if (res.data.eventType == 'unfollow') {
                    console.log('check');
                    console.log('unfollwing: res, ', res.data)
                    var unfollower = res.data.unfollower
                    var unfollowingReceiver = res.data.unfollowingReceiver
                    var index = $scope.user.followersList.indexOf(follower)
                    $scope.user.followersList.splice(index, 1)
                    checkFollowStatus()
                }
            }, err => {
                console.log('err when follow/unfollow: ', err)
            })
        }
    }
    var checkFollowStatus = () => {
            console.log('checkFollowStatus trigerred');
            console.log('displayUser: ', displayUser);
            if (displayUser.followersList.length > 0) {
                var followersList = displayUser.followersList
                console.log('checked');
                for (var follower in followersList) {
                    console.log('currentUser: ', $scope.currentUser._id);
                    console.log('followersList[follower]._id: ', followersList[follower]._id);
                    if (followersList[follower]._id == $scope.currentUser._id) {
                        $scope.state.followStatus = true
                    } else {
                        $scope.state.followStatus = false
                    }
                }
            } else {
                $scope.state.followStatus = false
            }
        }
        // checkFollowStatus()
}

function navCtrl($http, $scope, $auth, Account, $rootScope, $timeout, $window, $state, focus, Project, $location) {
    // console.log('navCtrl loaded');
    $scope.currentUser = '';
    $scope.loginloading = false;
    $scope.logoutloading = false;
    $rootScope.hideNav = false;
    $rootScope.createModal = false;

    $scope.authenticate = (provider) => {
            $scope.loginloading = true;
            $auth.authenticate(provider).then(data => {
                Account.getCurrentUser().then(res => {
                    console.log('user logged in: ', res.data);
                    $scope.currentUser = res.data;
                    $scope.loginloading = false;
                    console.log('$scope.currentUser._id: ', $scope.currentUser._id);
                    if ($state.current.name == 'home') {
                        $state.go('ppage', {
                            userId: $scope.currentUser._id
                        });
                    } else {
                        $window.location.reload();
                    }
                }, err => {
                    console.log('user is not logged in.');
                })
            }, err => {
                console.log('err when log user in: ', err);
            })
        }
        // console.log('$auth.isAuthenticated()): ', $auth.isAuthenticated()));
    if ($auth.isAuthenticated()) {
        Account.getCurrentUser().then(res => {
            $scope.currentUser = res.data;
            console.log('navCtrl triggered and currentUser: ', $scope.currentUser);
        }, err => {
            console.log('user is not logged in.');
        })
    }

    $scope.isAuthenticated = () => {
        return $auth.isAuthenticated();
    }

    $scope.logout = () => {
        $scope.logoutloading = true;
        $auth.logout();
        $timeout(function() {
            $scope.logoutloading = false;
            // $state.go('home');
            $window.location.reload();
        }, 0)
    }

    $scope.goppage = () => {
        console.log('$location.$$path: ', $location.$$path);
        if ($location.$$path.includes('projects')) {
            // console.log('stay on the page, or refresh the page')
            $window.location.reload()
        } else {
            $state.go('ppage', {
                userId: $scope.currentUser._id
            })
        }
    }

    $scope.create = () => {
        $scope.projectInitalizing = false;
        $scope.newProjectName = '';
        $scope.newProjectPitch = '';
        $scope.createModal = true;
        $timeout(function() {
            focus('focusMe');
        }, 100)
    }
    $scope.createProject = () => {
        $scope.projectInitalizing = true;
        console.log('create project called: ', $scope.newProjectName);
        var newPojectObj = {
            title: $scope.newProjectName,
            pitch: $scope.newProjectPitch
        }
        Project.createOne(newPojectObj).then(res => {
            console.log('add new behavior[createNewProject]: ', res.data);
            $timeout(function() {
                $scope.projectInitalizing = false;
                $scope.createModal = false;
                if ($state.current.name == 'ppage') {
                    $window.location.reload();
                } else {
                    $state.go('ppage', {
                        userId: $scope.currentUser._id
                    });
                }
            }, Math.random() * 1500 + 300);
        }, err => {
            console.log('err when create project: ', err);
        })
    }
}
