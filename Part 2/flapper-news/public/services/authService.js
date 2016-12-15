(function() {

    'use strict';

    angular.module('flapperNews').factory('auth', authService);

    authService.$inject = ['$http', '$window']

    function authService($http, $window) {

        var service = {
            saveToken: saveToken,
            getToken: getToken,
            isLoggedIn: isLoggedIn,
            currentUser: currentUser,
            currentUserId:currentUserId,
            register: register,
            logIn: logIn,
            logOut: logOut
        };


        return service;

        function saveToken(token) {
            $window.localStorage['flapper-news-token'] = token;
        };

        function getToken() {
            return $window.localStorage['flapper-news-token'];
        };

        function isLoggedIn() {
            var token = getToken();

            if (token) {
                var payload = angular.fromJson($window.atob(token.split('.')[1]));
                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        //Geeft de huidige gebruiker terug
        function currentUser() {
            if (isLoggedIn()) {
                var token = getToken();
                var payload = angular.fromJson($window.atob(token.split('.')[1]));
                return payload.username;
            }
        };

        function currentUserId(){
          if (isLoggedIn()) {
              var token = getToken();
              var payload = angular.fromJson($window.atob(token.split('.')[1]));
              return payload._id;

          }
        };

        function register(user) {
            return $http.post('/register', user).success(function(data) {
                saveToken(data.token);
            });
        };

        function logIn(user) {
            return $http.post('/login', user).success(function(data) {
                saveToken(data.token);
            }).error(function(err) {
                return err;
            });
        };

        function logOut() {
            $window.localStorage.removeItem('flapper-news-token');
        };
    }
})();