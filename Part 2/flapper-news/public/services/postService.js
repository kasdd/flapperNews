/* postService kan worden meegegeven in elke controller die deze nodig heeft.
   In die service zitten alle functies */

(function () {
    'use strict';

    angular.module("flapperNews").factory('postService', postService);

    postService.$inject = ['$http', 'auth']

    function postService($http, auth) {

        var service = {
            getAll: getAll,
            create: create,
            upvote: upvote,
            downvote: downvote,
            get: get,
            upvoteComment: upvoteComment,
            downvoteComment: downvoteComment,
            addComment: addComment,
            deleteComment: deleteComment
        }

        return service;

        function getAll() {
            return $http.get('/posts').success(function (data) {
                return data;
            });
        };

        function create(post) {
            return $http.post('/posts', post, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                return data;
            });
        };

        function upvote(post) {
            return $http.put('/posts/' + post._id + '/upvote', null, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                post.upvotes += 1;
            });
        };

        function downvote(post) {
            return $http.put('/posts/' + post._id + '/downvote', null, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                post.upvotes -= 1;
            });
        };

        function get(id) {
            return $http.get('/posts/' + id).then(function (res) {
                return res.data;
            });
        };

        function addComment(id, comment) {
            return $http.post('/posts/' + id + '/comments', comment, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            });
        };

        function upvoteComment(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                comment.upvotes += 1;
            });
        };

        function downvoteComment(post, comment) {
            return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', null, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                comment.upvotes -= 1;
            });
        };

        function deleteComment(post, comment) {
            return $http.delete('/posts/' + post._id + '/comments/' + comment._id, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                return data;
            });
        }
    };
})();