'use strict';

angular
    .module('pinchApp')
    .controller('homeCtrl', homeCtrl)
    .controller('authCtrl', authCtrl)
    .controller('dashboardCtrl', dashboardCtrl)
    .controller('dashboardPlanCtrl', dashboardPlanCtrl)

function homeCtrl($scope, $auth, $state, Account, $window, $rootScope, $location) {
    $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        console.log($rootScope.previousState, ' >>> ', $rootScope.currentState)
        if ($rootScope.currentState == 'authEntrance' && $scope.currentUser) $state.go('dashboard')
        $scope.currentUrl = $location.$$path;
        getCurrentUser()
    })

    function getCurrentUser() {
        if ($auth.getToken()) {
            Account.getCurrentUser($auth.getToken())
                .then(res => {
                    console.log('@CurrentUser: ', res.data)
                    $rootScope.currentUser = res.data
                }, (err) => $state.go('authEntrance'))
        } else if (!$auth.getToken() && $location.$$path.includes('dashboard')) {
            $state.go('authEntrance')
        }
    }
}

function authCtrl($scope, $auth, $state, Account, $window, $rootScope) {
    $scope.auth_enter = (authData) => {
        $auth.signup(authData)
            .then(res => {
                $auth.setToken(res);
                $state.go('dashboard', {}, {
                    reload: true
                })
                console.log('res @auth_enter: ', res.data)
            }, (err) => console.log('err @auth_enter: ', err))
    }

    $scope.authenticate = (provider) => {
        $auth.authenticate(provider);
    }

}

function dashboardCtrl($scope, $auth, $state, Account, $rootScope, Payment, $window) {
    // console.log('dashboardCtrl loaded')
    // checkVerifyPhoneSentStatus($rootScope.currentUser)

    $scope.logout = () => {
        console.log('check');
        $auth.logout()
        $scope.currentUser = null;
        $state.go('landing', {}, {
            reload: true
        })
        $window.location.reload();
    }

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
            console.log('userObj: ', userObj);
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
                    if (res.data.msg) {
                        if (res.data.msg == 'incorrect') {
                            console.log('err: incorrect');
                        } else if (res.data.msg = 'expired')
                            console.log('err: expired');

                    } else {
                        $rootScope.currentUser.phone.verified = true;
                    }
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

        $scope.defaultPlanTimes = (times) => {
            if (!times) {
                return $scope.plan.times = 3
            }
            return $scope.plan
        }

        $scope.previewSinglePlan = (plan) => {
            console.log('plan: ', plan);
            Plan.addSinglePreview(plan).then(res => {
                $state.go('dashboard_plan_single_preview')
            }, (err) => console.log('err @addSinglePreview: ', err))
        }

        $scope.plan = {}

        $scope.singlePayment = () => {
            return (($scope.plan.total - $scope.plan.downpay) / $scope.plan.times)
        }

        $scope.intervalSelected = (choice) => {
            if ($scope.plan.interval == choice) {
                $scope.plan.interval = null
            } else {
                $scope.plan.interval = choice
            }
        }
    }

    if ($rootScope.currentState == 'dashboard_plan_single_preview') {
        Plan.getSinglePreview().then(res => {
            console.log('res @getSinglePreview: ', res)
            $scope.planPreview = res;
            $scope.planPreview.installment = (res.total - res.downpay) / res.times
        }, (err) => console.log('err @getSinglePreview: ', err))

        $scope.saveSinglePlan = (plan) => {
            console.log(plan)
            let saveSinglePlanInfo = {
                planDetails: plan,
                creator: $rootScope.currentUser
            }
            console.log('saveSinglePlanInfo: ', saveSinglePlanInfo);
            Plan.saveSinglePlan(saveSinglePlanInfo)
                .then(res => {
                    console.log('res @saveSinglePlan: ', res.data)
                        // $state.go('dashboard_plan_start', {}, { reload: true });
                    $state.go('dashboard_plan_details', {
                        planId: res.data._id
                    }, {
                        reload: true
                    });
                }, (err) => console.log('err @saveSinglePlan: ', err))
        }

        $scope.dashboard_plan_single_preview_goback = (plan) => {
            if ($rootScope.previousState == 'dashboard_plan_details_edit') {
                $state.go('dashboard_plan_details_edit', {planId: plan._id})
            }else if($rootScope.previousState == 'dashboard_plan_single'){
                $state.go('dashboard_plan_single')
            }
        }
    }

    $scope.getAllPlans = () => {
        let currentUserId = $rootScope.currentUser._id
        console.log('currentUserId: ', currentUserId);
    }

    if ($rootScope.currentState == 'dashboard_plan_details') {
        Plan.getSinglePlan($state.params.planId)
            .then(res => {
                console.log('res @getSinglePlan: ', res.data)
                $scope.plan = res.data.data;
                $scope.planId = res.data._id
                $scope.itCreator = () => {
                    return res.data.creator.includes($rootScope.currentUser._id)
                }
            }, (err) => console.log('err @getSinglePlan: ', err))
    }
    if ($rootScope.currentState == 'dashboard_plan_details_edit') {
        console.log($state.params.planId);

        Plan.getSinglePlan($state.params.planId)
            .then(res => {
                if (!res.data.creator.includes($rootScope.currentUser._id)) {
                    // it's not creator, then block the user out
                    $state.go('dashboard')
                }
                console.log('res @getSinglePlan: ', res.data)
                $scope.plan = res.data.data
                $scope.plan._id = res.data._id
                $scope.itCreator = () => {
                    return res.data.creator.includes($rootScope.currentUser._id)
                }
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

                $scope.defaultPlanTimes = (times) => {
                    if (!times) {
                        return $scope.plan.times = 3
                    }
                    return $scope.plan
                }

                $scope.previewSinglePlan = (plan) => {
                    Plan.addSinglePreview(plan).then(res => {
                        $state.go('dashboard_plan_single_preview')
                    }, (err) => console.log('err @addSinglePreview: ', err))
                }

                $scope.singlePayment = () => {
                    return (($scope.plan.total - $scope.plan.downpay) / $scope.plan.times)
                }

                $scope.intervalSelected = (choice) => {
                    if ($scope.plan.interval == choice) {
                        $scope.plan.interval = null
                    } else {
                        $scope.plan.interval = choice
                    }
                }
            }, (err) => console.log('err @getSinglePlan: ', err))
    }
}
