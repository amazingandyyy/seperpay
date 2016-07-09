'use strict';

angular
    .module('pinchApp', [
        'ui.router',
        'satellizer',
        // 'ui.bootstrap',
        'ngFileUpload',
        'ngImgCrop',
        'stripe.checkout'
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

    // let ppage = {
    //     name: 'ppage',
    //     url: '/m/:userId',
    //     views: {
    //         'main': {
    //             templateUrl: '/html/ppage.html',
    //             controller: 'ppageCtrl'
    //         },
    //         'right_section': {
    //             templateUrl: '/html/ppage_projects.html',
    //             controller: 'ppageCtrl'
    //         }
    //     }
    // }
    //
    // let ppage_projects = {
    //     name: 'ppage_projects',
    //     url: '/projects',
    //     parent: 'ppage',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/ppage_projects.html',
    //             controller: 'ppageCtrl'
    //         }
    //     }
    // }
    // let ppage_liked = {
    //     name: 'ppage_liked',
    //     url: '/liked',
    //     parent: 'ppage',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/ppage_liked.html',
    //             controller: 'ppageCtrl'
    //         }
    //     }
    // }
    // let ppage_followers = {
    //     name: 'ppage_followers',
    //     url: '/followers',
    //     parent: 'ppage',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/ppage_followers.html',
    //             controller: 'ppageCtrl'
    //         }
    //     }
    // }
    // let projectpage = {
    //     name: 'projectpage',
    //     url: '/:projectId',
    //     views: {
    //         main: {
    //             templateUrl: '/html/projectpage.html',
    //             controller: 'projectpageCtrl'
    //         }
    //     }
    // }
    // let projectSetting = {
    //     name: 'projectSetting',
    //     url: '/project/:projectId/setting',
    //     views: {
    //         main: {
    //             templateUrl: '/html/projectSetting.html',
    //             controller: 'projectSettingCtrl'
    //         }
    //     }
    // }
    // let projectSetting_general = {
    //     name: 'projectSetting_general',
    //     url: '/general',
    //     parent: 'projectSetting',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/projectSetting_general.html',
    //             controller: 'projectSettingCtrl'
    //         }
    //     }
    // }
    // let projectSetting_request = {
    //     name: 'projectSetting_request',
    //     url: '/request',
    //     parent: 'projectSetting',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/projectSetting_request.html',
    //             controller: 'projectSettingCtrl'
    //         }
    //     }
    // }
    // let projectSetting_privacy = {
    //     name: 'projectSetting_privacy',
    //     url: '/privacy',
    //     parent: 'projectSetting',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/projectSetting_privacy.html',
    //             controller: 'projectSettingCtrl'
    //         }
    //     }
    // }
    // let projectSetting_danger = {
    //     name: 'projectSetting_danger',
    //     url: '/danger',
    //     parent: 'projectSetting',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/projectSetting_danger.html',
    //             controller: 'projectSettingCtrl'
    //         }
    //     }
    // }
    // let profileSetting = {
    //     name: 'profileSetting',
    //     url: '/user/:userId/setting',
    //     views: {
    //         main: {
    //             templateUrl: '/html/profileSetting.html',
    //             controller: 'profileSettingCtrl'
    //         }
    //     }
    // }
    // let profileSetting_general = {
    //     name: 'profileSetting_general',
    //     url: '/general',
    //     parent: 'profileSetting',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/profileSetting_general.html',
    //             controller: 'profileSettingCtrl'
    //         }
    //     }
    // }
    // let profileSetting_request = {
    //     name: 'profileSetting_request',
    //     url: '/request',
    //     parent: 'profileSetting',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/profileSetting_request.html',
    //             controller: 'profileSettingCtrl'
    //         }
    //     }
    // }
    // let profileSetting_privacy = {
    //     name: 'profileSetting_privacy',
    //     url: '/privacy',
    //     parent: 'profileSetting',
    //     views: {
    //         right_section: {
    //             templateUrl: '/html/profileSetting_privacy.html',
    //             controller: 'profileSettingCtrl'
    //         }
    //     }
    // }
    // let profileSetting_danger = {
    //         name: 'profileSetting_danger',
    //         url: '/danger',
    //         parent: 'profileSetting',
    //         views: {
    //             right_section: {
    //                 templateUrl: '/html/profileSetting_danger.html',
    //                 controller: 'profileSettingCtrl'
    //             }
    //         }
    //     }
