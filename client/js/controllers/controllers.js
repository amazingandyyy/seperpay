'use strict';

angular
    .module('pinchApp')
    .controller('homeCtrl', homeCtrl)
    .controller('authCtrl', authCtrl)
    .controller('dashboardCtrl', dashboardCtrl)
    .controller('dashboardPlanCtrl', dashboardPlanCtrl)

function homeCtrl($rootScope) {
    console.log('homeCtrl loaded')
    $rootScope.previousState
    $rootScope.currentState
    $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        console.log('Previous state:' + $rootScope.previousState)
        console.log('Current state:' + $rootScope.currentState)
    })
    $rootScope.$on('animStart', function($event, element, speed) {})
    $rootScope.$on('animEnd', function($event, element, speed) {})
}

function authCtrl($scope, $auth, $state, Account, $window) {
    console.log('authCtrl loaded')

    $scope.getCurrentUser = () => {
        getCurrentUser()
    }

    $scope.auth_enter = (authData) => {
        $auth.signup(authData)
            .then(res => {
                $auth.setToken(res)
                $state.go('dashboard', {}, {
                    reload: true
                })
                console.log('res @auth_enter: ', res.data)
                getCurrentUser()
                    // toastr.info('You have successfully created a new account and have been signed-in');
            }, err => {
                console.log('err @auth_enter: ', err)
                    // toastr.error(response.data.message);
            })
    }

    $scope.authenticate = (provider) => {
        $auth.authenticate(provider);
    }
    $scope.logout = () => {
        $auth.logout()
        $scope.currentUser = null;
        $state.go('home', {}, {
            reload: true
        })
        $window.location.reload();
    }

    function getCurrentUser() {
        if ($auth.getToken()) {
            Account.getCurrentUser($auth.getToken())
                .then(res => {
                    console.log('res @getCurrentUser: ', res.data)
                    $scope.currentUser = res.data
                }, err => {
                    $state.go('authEntrance')
                })
        }
    }

}

function dashboardCtrl($scope, $auth, $state, Account, $rootScope, Payment, $interval) {
    console.log('dashboardCtrl loaded')
    Account.getCurrentUser($auth.getToken())
        .then(res => {
            if (!$rootScope.currentUser) {
                $rootScope.currentUser = res.data
            }
            console.log('res @getCurrentUser: ', res.data)
            checkVerifyPhoneSentStatus(res.data)
        }, err => {
            $state.go('home')
        })

    function checkVerifyPhoneSentStatus(currentUserData) {
        $scope.verifyPhoneSentOut = false

        let expiredTime = Number(currentUserData.phone.verifyCode.expiredAt)
        let nowTime = Date.now()
        if (expiredTime > nowTime) {
            $scope.verifyPhoneSentOut = true;
        }
        $scope.verifyPhoneCountDown = () => {
            return `${expiredTime}`
        }
    }

    $scope.sendVerifyCode = (phone) => {
        console.log('phone: ', phone)
        if (phone.length > 5) {
            var userObj = {
                userData: $rootScope.currentUser,
                phone: phone
            }
            Account.sendVerifyCode(userObj)
                .then(res => {
                    console.log('res @sendVerifyCode: ', res.data)
                    $rootScope.currentUser.phone.data = phone;
                    $scope.verifyPhoneSentOut = true;
                }, err => {
                    console.log('err @sendVerifyCode: ', err);
                })
        }
    }
    $scope.verifyCode = (code) => {
        console.log('code: ', code)
        if (code.length !== 0) {
            var userObj = {
                userData: $rootScope.currentUser,
                code: code
            }
            Account.verifyCode(userObj)
                .then(res => {
                    console.log('res @verifyCode: ', res.data)
                    $rootScope.currentUser.phone.verified = true;
                }, err => {
                    console.log('err @verifyCode: ', err);
                })
        }
    }

    $scope.doCheckout = (token) => {
        console.log('fff');
        console.log('token: ', token);
        var dataObj = {
            stripeToken: token,
            userData: $rootScope.currentUser
        }
        Payment.chargeNow(dataObj).then(res => {
            console.log('res: ', res.data);
        }, function(err) {
            console.log('err: ', err);
        })
    }
}

function dashboardPlanCtrl($scope, Account, $stateParams, $state, Plan, $rootScope) {
    console.log('dashboardPlanCtrl loaded');

    if ($rootScope.currentState == 'dashboard_plan_single') {
        $scope.updateTimes = (times) => {
            $scope.installmentsGraphData = []
            for (var i = 0; i < times; i++) {
                var installment = ~~(($scope.plan.total / times));
                var height = ~~(200 * (2 / times))
                $scope.installmentsGraphData.push({
                    price: installment,
                    style: {
                        height: `${height}px`,
                        width: `90%`
                    }
                })
            }
        }

        $scope.previewSinglePlan = (plan) => {
            Plan.addSinglePreview(plan).then(res => {
                $state.go('dashboard_plan_single_preview')
            }, err => console.log('err @addSinglePreview: ', err))
        }
    }

    if ($rootScope.currentState == 'dashboard_plan_single_preview') {
        Plan.getSinglePreview().then(res => {
            console.log('res @getSinglePreview: ', res)
            $scope.planPreview = res;
            $scope.planPreview.installment = (res.total - res.downpay) / res.times
        }, err => console.log('err @getSinglePreview: ', err))

        var uuid = createUUID()
        console.log('uuid: ', uuid)

        function createUUID() {
            var s = [];
            var hexDigits = "0123456789abcdef";
            for (var i = 0; i < 36; i++) {
                s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
            }
            s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
            s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
            s[8] = s[13] = s[18] = s[23] = "-";

            var uuid = s.join("");
            return uuid;
        }
    }
}
