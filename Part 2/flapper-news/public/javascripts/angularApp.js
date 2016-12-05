var app = angular.module('flapperNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('home', {
            url: '/home',
            templateUrl: '/home.html',
            controller: 'MainCtrl',
            resolve: {
                postPromise: ['posts', function (posts) {
                    return posts.getAll();
                }]
            }
        });

        $stateProvider.state('posts', { //Wat we hier definieeren geven we door tussen onze states (in dit geval het url (id) om de juiste post terug te geven)
            url: '/posts/:id',
            templateUrl: '/posts.html',
            controller: 'PostsCtrl',
            resolve: {
                post: ['$stateParams', 'posts',
                    function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }
                ]   
            }
        });

        $urlRouterProvider.otherwise('home');
    }
]);

/* We creeeren een nieuw object dat een property posts heeft. 
We geven dan die variabele (o) terug zodat deze door elke angular module kan gebruikt worden. 
Je kan hier ook methode in exporteren
$scope.posts = posts.posts in MainCtrl --> Nu wordt elke wijziging opgeslaan in de service*/
app.factory('posts', ['$http', function ($http) {
    var o = {
        posts: []
    };

    o.getAll = function () {
        return $http.get('/posts').success(function (data) {
            angular.copy(data, o.posts);
        });
    }

    o.create = function (post) {
        return $http.post('/posts', post).success(function (data) {
            o.posts.push(data);
        });
    };

    o.upvote = function (post) {
        return $http.put('/posts/' + post._id + '/upvote').success(function (data) {
            post.upvotes += 1;
        });
    };

    o.get = function (id) {

        return $http.get('/posts/' + id).then(function (res) {
            return res.data;
        });
    };

    o.addComment = function (id, comment) {
        return $http.post('/posts/' + id + '/comments', comment);
    };

    o.upvoteComment = function (post, comment) {   
        console.log(post, comment);   
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null).success(function (data) {
            comment.upvotes += 1;
        });
    }

    o.downvoteComment = function (post, comment) {
        console.log(post, comment);
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', null).success(function (data) {
            comment.upvote -= 1;
        });
    }

    return o;
}]);

app.controller('MainCtrl', [
    '$scope', 'posts',
    function ($scope, posts) {
        $scope.posts = posts.posts

        $scope.addPost = function () {
            if ($scope.title === '') {
                return;
            }
            posts.create({
                title: $scope.title,
                link: $scope.link,
            });
            //De $scope items leegmaken (anders blijven ze staan na submit)
            $scope.title = '';
            $scope.link = '';
        };

        $scope.incrementUpvotes = function (post) {
            posts.upvote(post);
        };
    }
]);

app.controller('PostsCtrl', [
    '$scope', 'posts', 'post',
    function ($scope, posts, post) {
        $scope.posts = posts.posts; //Hier zat bug, anders had ik leeg object posts
        $scope.post = post;
        $scope.addComment = function () {
            if ($scope.body === '') {
                return;
            }

            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user'
            }).success(function (comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };
        $scope.upvote = function (comment) {
            posts.upvoteComment(post, comment);
        };
        $scope.downvote = function (comment) {
            posts.downvoteComment(post, comment);
        };
    }
]);