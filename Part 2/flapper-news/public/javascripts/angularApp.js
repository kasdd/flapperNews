angular.module('flapperNews').config(flapperNewsStates);

flapperNewsStates.$inject = ['$stateProvider', '$urlRouterProvider'];

function flapperNewsStates($stateProvider, $urlRouterProvider){
    $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainController',
            controllerAs: 'ctrl'
        }).state('posts', { //Wat we hier definieeren geven we door tussen onze states (in dit geval het url (id) om de juiste post terug te geven)
            url: '/posts/:id',
            templateUrl: '/posts.html',
            controller: 'PostController',
            controllerAs: 'ctrl',
            resolve: {
                post: ['$stateParams', 'postService',
                    function ($stateParams, postService) {
                        return postService.get($stateParams.id);
                    }]
            }
        }).state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthController',
            controllerAs: 'ctrl',
            onEnter: ['$state', 'auth',
                function ($state, auth) {
                    if (auth.isLoggedIn()) {  //Wanneer ingelogd gaan we naar homestate
                        $state.go('home');
                    }
                }]
        }).state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthController',
            controllerAs: 'ctrl',
            onEnter: ['$state', 'auth',
                function ($state, auth) {
                    if (auth.isLoggedIn()) { //Wanneer geregistreerd gaan we naar homestate
                        $state.go('home');
                    }
                }]
        });

        $urlRouterProvider.otherwise('home');
}
