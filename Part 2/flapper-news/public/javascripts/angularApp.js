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
        }).state('posts', { //Wat we hier definieeren geven we door tussen onze states (in dit geval het url (id) om de juiste post terug te geven)
            url: '/posts/:id',
            templateUrl: '/posts.html',
            controller: 'PostsCtrl',
            resolve: {
                post: ['$stateParams', 'posts',
                    function ($stateParams, posts) {
                        return posts.get($stateParams.id);
                    }]
            }
        }).state('login', {
            url: '/login',
            templateUrl: '/login.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth',
                function ($state, auth) {
                    if (auth.isLoggedIn()) {  //Wanneer ingelogd gaan we naar homestate
                        $state.go('home');
                    }
                }]

        }).state('register', {
            url: '/register',
            templateUrl: '/register.html',
            controller: 'AuthCtrl',
            onEnter: ['$state', 'auth',
                function ($state, auth) {
                    if (auth.isLoggedIn()) { //Wanneer geregistreerd gaan we naar homestate
                        $state.go('home');
                    }
                }]
        });


        $urlRouterProvider.otherwise('home');
    }
]);

app.factory('auth', ['$http', '$window', function ($http, $window) {
    var auth = {};

    auth.saveToken = function (token) {
        $window.localStorage['flapper-news-token'] = token;
    };

    auth.getToken = function () {
        return $window.localStorage['flapper-news-token'];
    }

    auth.isLoggedIn = function () {
        var token = auth.getToken();
        //Als de token bestaat moeten we kijken of de payload nog niet expired is.
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    };
    //Geeft username terug die ingelogd is
    auth.currentUser = function () {
        if (auth.isLoggedIn()) {
            var token = auth.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    auth.register = function (user) {
        return $http.post('/register', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logIn = function (user) {
        return $http.post('/login', user).success(function (data) {
            auth.saveToken(data.token);
        });
    };

    auth.logOut = function () {
        $window.localStorage.removeItem('flapper-news-token');
    };


    return auth;
}]);

/* We creeeren een nieuw object dat een property posts heeft. 
We geven dan die variabele (o) terug zodat deze door elke angular module kan gebruikt worden. 
Je kan hier ook methode in exporteren
$scope.posts = posts.posts in MainCtrl --> Nu wordt elke wijziging opgeslaan in de service*/
app.factory('posts', ['$http', 'auth', function ($http, auth) {
    var o = {
        posts: []
    };

    o.getAll = function () {
        return $http.get('/posts').success(function (data) {
            angular.copy(data, o.posts);
        });
    }

    o.create = function (post) {
        return $http.post('/posts', post, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            o.posts.push(data);
        });
    };

    o.upvote = function (post) {
        return $http.put('/posts/' + post._id + '/upvote', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            post.upvotes += 1;
        });
    };

    o.get = function (id) {
        return $http.get('/posts/' + id).then(function (res) {
            return res.data;
        });
    };

    o.addComment = function (id, comment) {
        return $http.post('/posts/' + id + '/comments', comment, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        });
    };

    o.upvoteComment = function (post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            comment.upvotes += 1;
        });
    };

    o.downvoteComment = function (post, comment) {
        return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', null, {
            headers: {
                Authorization: 'Bearer ' + auth.getToken()
            }
        }).success(function (data) {
            comment.upvotes += 1;
        });
    };

    return o;
}]);

app.controller('MainCtrl', [
    '$scope', 'posts', 'auth', 
    function ($scope, posts, auth) {
        $scope.posts = posts.posts
        $scope.isLoggedIn = auth.isLoggedIn;

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
    '$scope', 'posts', 'post','auth' ,
    function ($scope, posts, post, auth) {
        $scope.posts = posts.posts; //Hier zat bug, anders had ik leeg object posts
        $scope.post = post;
        $scope.isLoggedIn = auth.isLoggedIn;

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

app.controller('AuthCtrl', [
    '$scope', '$state', 'auth',
    function ($scope, $state, auth) {
        $scope.user = {};

        $scope.register = function () {
            auth.register($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };

        $scope.logIn = function () {
            auth.logIn($scope.user).error(function (error) {
                $scope.error = error;
            }).then(function () {
                $state.go('home');
            });
        };
    }
]);

app.controller('NavCtrl', [
    '$scope', 'auth',
    function ($scope, auth) {
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
    }
]);