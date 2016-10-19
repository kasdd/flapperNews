var app = angular.module('flapperNews', ['ui.router']);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        //resolve ensures that any time home is entered, we always load all posts before state finishes loading
        //Alle posts laden voor state is gedaan met laden
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '/home.html',
                controller: 'MainCtrl',
                resolve: {
                    postPromise: ['posts', function (posts) {
                        return posts.getAll();
                    }]
                }
            })
            .state('posts', {
                url: '/posts/:id',
                templateUrl: '/posts.html',
                controller: 'PostsCtrl',
                resolve: {
                    post: ['$stateParams', 'posts', function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
                }
            });
        $urlRouterProvider.otherwise('home');
    }
]);

app.controller('MainCtrl', ['$scope', 'posts',
    function ($scope, posts) {
        $scope.posts = posts.posts;

        $scope.addPost = function () {
            if (!$scope.title || $scope.title === '') {
                return;
            }
            posts.create({
                title: $scope.title,
                link: $scope.link
            });
            $scope.title = '';
            $scope.link = '';
        };
        $scope.incrementUpvotes = function (post) {
            posts.upvote(post);
        };
    }
]);

app.controller('PostsCtrl', ['$scope', 'posts', 'post',
    function ($scope, posts, post) {
        $scope.post = post;
        $scope.addComment = function () {
            if ($scope.body === '') {
                return;
            }
            posts.addComment(post._id, {
                body: $scope.body,
                author: 'user',
            }).success(function (comment) {
                $scope.post.comments.push(comment);
            });
            $scope.body = '';
        };

        $scope.incrementUpvotes = function (comment) {
            posts.upvoteComment(post, comment);
        };
    }
]);

app.factory('posts', ['$http', function ($http) {
    var o = {
        posts: []
    };
    //Krijgt een lijst en kopieert deze door de functie angular.copy()
    //Gets a list and copy this lists to posts using angular.copy() 
    o.getAll = function () {
        return $http.get('/posts').succes(function (data) {
            angular.copy(data, o.posts);
        });
    };

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
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote').success(function (data) {
            comment.upvotes += 1;
        });
    };
}]);

/* https://github.com/jakblak/thinkster_mean_app/blob/master/public_html/app.js
   JS code waarop er wel output wordt getoond...  */
