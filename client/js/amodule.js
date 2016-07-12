'use strict';

angular
    .module('pinchApp', [
        'ui.router',
        'satellizer',
        'ngAnimate',
        // 'ui.bootstrap',
        'ngFileUpload',
        'ngImgCrop',
        'stripe.checkout',
        'angular-loading-bar',
        'anim-in-out'
    ])
    .config(function($stateProvider, $urlRouterProvider, $authProvider) {
        Stripe.setPublishableKey('pk_test_t1eThhOKl6esrp6f4jyWqU4J')

        // $authProvider
        //     .facebook({
        //         clientId: '298165113849366'
        //     });

        $stateProvider
            .state(home)
            .state(authEntrance)
            .state(dashboard)
            .state(dashboard_payment)
            .state(dashboard_plan)
            .state(dashboard_plan_start)
            .state(dashboard_plan_choose)
            .state(dashboard_plan_single)
            .state(dashboard_plan_single_preview)
            .state(dashboard_plan_multiple)
            .state(dashboard_account)
            // .state(ppage)
            // .state(ppage_projects)
            // .state(ppage_liked)
            // .state(ppage_followers)
            // .state(projectpage)
            // .state(projectSetting)
            // .state(projectSetting_general)
            // .state(projectSetting_request)
            // .state(projectSetting_privacy)
            // .state(projectSetting_danger)
            // .state(profileSetting)
            // .state(profileSetting_general)
            // .state(profileSetting_request)
            // .state(profileSetting_privacy)
            // .state(profileSetting_danger)


        $urlRouterProvider.otherwise('/');
    });


let home = {
    name: 'home',
    url: '/',
    views: {
        main: {
            templateUrl: '/html/home.html',
            controller: 'homeCtrl'
        }
    }
}
let authEntrance = {
    name: 'authEntrance',
    url: '/entrance',
    views: {
        main: {
            templateUrl: '/html/entrance.html',
            controller: 'authCtrl'
        }
    }
}
let dashboard = {
    name: 'dashboard',
    url: '/dashboard',
    views: {
        main: {
            templateUrl: '/html/dashboard.html',
            controller: 'dashboardCtrl'
        }
    }
}

let dashboard_payment = {
    name: 'dashboard_payment',
    url: '/payment',
    parent: 'dashboard',
    views: {
        dashboard_section: {
            templateUrl: '/html/dashboard_payment.html',
            controller: 'dashboardCtrl'
        }
    }
}
let dashboard_plan = {
    name: 'dashboard_plan',
    url: '/plan',
    parent: 'dashboard',
    views: {
        dashboard_section: {
            templateUrl: '/html/dashboard_plan.html',
            controller: 'dashboardCtrl'
        }
    }
}
let dashboard_plan_start = {
    name: 'dashboard_plan_start',
    url: '/start',
    parent: 'dashboard_plan',
    views: {
        dashboard_child_section: {
            templateUrl: '/html/dashboard/dashboard_plan_start.html',
            controller: 'dashboardCtrl'
        }
    }
}
let dashboard_plan_choose = {
    name: 'dashboard_plan_choose',
    url: '/choose',
    parent: 'dashboard_plan',
    views: {
        dashboard_child_section: {
            templateUrl: '/html/dashboard/dashboard_plan_choose.html',
            controller: 'dashboardCtrl'
        }
    }
}
let dashboard_plan_single = {
    name: 'dashboard_plan_single',
    url: '/choose/single',
    parent: 'dashboard_plan',
    views: {
        dashboard_child_section: {
            templateUrl: '/html/dashboard/dashboard_plan_single.html',
            controller: 'dashboardPlanCtrl'
        }
    }
}
let dashboard_plan_single_preview = {
    name: 'dashboard_plan_single_preview',
    url: '/choose/single/preview',
    parent: 'dashboard_plan',
    views: {
        dashboard_child_section: {
            templateUrl: '/html/dashboard/dashboard_plan_single_preview.html',
            controller: 'dashboardPlanCtrl'
        }
    }
}
let dashboard_plan_multiple = {
    name: 'dashboard_plan_multiple',
    url: '/choose/mutiple',
    parent: 'dashboard_plan',
    views: {
        dashboard_child_section: {
            templateUrl: '/html/dashboard/dashboard_plan_multiple.html',
            controller: 'dashboardCtrl'
        }
    }
}
let dashboard_account = {
    name: 'dashboard_account',
    url: '/account',
    parent: 'dashboard',
    views: {
        dashboard_section: {
            templateUrl: '/html/dashboard_account.html',
            controller: 'dashboardCtrl'
        }
    }
}
