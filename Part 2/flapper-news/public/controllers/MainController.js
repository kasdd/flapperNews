(function() {
    'use strict';

    angular.module("flapperNews").controller('MainController', MainController)
    
    MainController.$inject = [ '$scope', 'postService', 'auth', '$stateParams']

    function MainController($scope, postService, auth, stateParams){
        var vm = this;

        vm.isLoggedIn = auth.isLoggedIn;
        vm.user = auth.currentUser;
        vm.posts = [];
        vm.getPosts = getPosts;
        vm.addPost = addPost;
        vm.incrementUpvotes = incrementUpvotes;
        vm.incrementDownvotes = incrementDownvotes;

        activate();    //Haalt alle onze posts op wanneer deze controller wordt aangesproken.

        function activate(){
            getPosts();
        }

        function addPost() {
            if ($scope.title === '') {
                vm.error = "Gelieve een titel in te geven";
                return;
            }
            vm.error = null;

            postService.create({
                title: vm.title,
                link: vm.link,
            }).then(function(data){
                vm.posts.push(data.data);
            //De $scope items leegmaken (anders blijven ze staan na submit)
            vm.title = '';
            vm.link = '';
            });
        };

        function incrementUpvotes(post) {
            postService.upvote(post);
        };

        function incrementDownvotes(post) {
            postService.downvote(post);
        };

        function getPosts() {
            postService.getAll().then(function(data) {
                vm.posts = data.data;
                return vm.posts;
            });
        };
    }
})();
