var app = angular.module('flapperNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl'
        });

        $stateProvider.state('posts', { //Wat we hier definieeren geven we door tussen onze states (in dit geval het url (id) om de juiste post terug te geven)
            url: '/posts/{id}',
            templateUrl: '/posts.html',
            controller: 'PostsCtrl'
        });

        $urlRouterProvider.otherwise('home');
    }
]);

/* We creeeren een nieuw object dat een property posts heeft. 
We geven dan die variabele (o) terug zodat deze door elke angular module kan gebruikt worden. 
Je kan hier ook methode in exporteren
$scope.posts = posts.posts in MainCtrl --> Nu wordt elke wijziging opgeslaan in de service*/
app.factory('posts', [function () {
    var o = {
        posts: []
    };
    return o;
}]);

app.controller('MainCtrl', [
    '$scope', 'posts',
    function ($scope, posts) {
        $scope.posts = posts.posts

        $scope.addPost = function () {
            if (!$scope.title || $scope.title === '') {
                return;
            }
            $scope.posts.push({
                title: $scope.title,
                link: $scope.link,
                upvotes: 0,
                comments: [{
                    author: 'Joe',
                    body: 'Cool post!',
                    upvotes: 0
                }, {
                    author: 'Bob',
                    body: 'Great idea but everything is wrong!',
                    upvotes: 0
                }]
            });
            $scope.title = '';
            $scope.link = '';
        };

        $scope.incrementUpvotes = function (post) {
            post.upvotes += 1;
        };
    }
]);
app.controller('PostsCtrl', [
    '$scope',
    '$stateParams',
    'posts',
    function ($scope, $stateParams, posts, post) {
        $scope.posts = posts.posts;  //Hier zat bug, anders had ik leeg object posts
        $scope.post = posts.posts[$stateParams.id];
        $scope.addComment = function () {
            if ($scope.body === '') {
                return;
            }
            $scope.post.comments.push({
                body: $scope.body,
                author: 'user',
                upvotes: 0
            });
            $scope.body = '';
        };
        $scope.upvote = function (comment) {
            console.log(comment.upvotes)
            comment.upvotes += 1;
        };
        $scope.downvote = function (comment) {
            console.log(comment.upvotes)
            comment.upvotes -= 1;
        };
    }
]);