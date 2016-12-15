(function() {

    'use strict';

    angular.module("flapperNews").directive('customDirective', customDirective);

    function customDirective() {

        var directive = {
            restrict: 'A',  //Only matches attribute name
            scope: {
                comment : '=?'
            },
            controller: 'PostController',
            controllerAs: 'lm',
            templateUrl: '/posts.html',
            bindToController: true,
            link: function(scope, elem){
                if(scope.lm.addComment){
                    scope.lm.addComment();
                }
            }
        };

        return directive;

    };



})();