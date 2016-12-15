(function () {

    angular.module("flapperNews").controller('AuthController', AuthController)

    AuthController.$inject = ['$state', 'auth']

    function AuthController($state, auth) {
        var vm = this;

        vm.user = {};
        vm.register = register;
        vm.logIn = logIn;
        vm.logOut = logOut;

        function register() {
            auth.register(vm.user).error(function (error) {
                vm.error = error;
            }).then(function () {
                $state.go('home');
            })
        };

        function logIn() {
            auth.logIn(vm.user).error(function (error) {
                vm.error = error;
            }).then(function () {
                $state.go('home');
            });
        };

        function logOut(){
        auth.logOut().then(function(){
          $state.go('home');
        });
      }
    }
})();
