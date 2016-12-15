(function () {

    angular.module('flapperNews').controller('PostController', PostController)

    PostController.$inject = ['postService', 'auth', 'post']

    function PostController(postService, auth, post) {
        var vm = this;
        vm.post = post;

        vm.addComment = addComment;
        vm.deleteComment = deleteComment;
        vm.upvote = incrementUpvotes;
        vm.downvote = downvoteComment;
        vm.isLoggedIn = auth.isLoggedIn;

        function addComment() {
            console.log(vm.body);
            if (vm.body === '') {
                return;
            }
            postService.addComment(post._id, {
                body: vm.body,
                author: 'user'
            }).success(function (comment) {
                vm.post.comments.push(comment);
            });
            vm.body = '';
        }

        function incrementUpvotes(comment) {
            postService.upvoteComment(vm.post, comment);
        };

        function downvoteComment(comment) {
            postService.downvoteComment(vm.post, comment);
        };

        function deleteComment(comment){
            console.log(comment);
            postService.deleteComment(vm.post, comment).success(function(comment){
                vm.post.comments.splice(comment._id, 1);
            });
        }
    }
})();