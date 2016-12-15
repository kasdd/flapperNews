describe("angular", function() {
   var $controller;
   var $service;
   var $scope;
   var $httpBackend, $http;
   var posts;
    beforeEach(function() {
        module('flapperNews');
        module(function($provide) {
          $provide.value('posts', {
            posts : [{id: '34kd34', title: 'testpost', comments: [{id: 'comment1',body: 'tekst', upvotes: 10}],upvotes: 10, text:"Latijn"}],
            upvote : function(post) {
              post.upvotes += 1;
            },
            downvote: function(post){
              post.upvotes += -1;
            },
            create: function(post) {
              this.posts.push(post);
            },
            upvoteComment : function(post,comment){
              post.comments.get(comment).upvotes += 1;
            },
            downvoteComment : function(post,comment){
              post.comments.get(comment).upvotes -= 1;
            }
          });
        });
        inject(function(_posts_) {
          posts = _posts_.posts;
        });
        inject(function(_$http_) {
          $http = _$http_;
        });
        inject(function(_$httpBackend_) {
          $httpBackend = _$httpBackend_;
          $httpBackend.when('GET','http://localhost/test').respond(200, {name: 'rudy'});
          $httpBackend.when('GET','/posts').respond(200, {name: 'rudy'});

          $httpBackend.when('GET', /\/posts\/(.+)/).respond(function(method, url, data, headers) {
            var args = url.match(/\/posts\/(.+)/);
            for (i in posts) {
              if (posts[i].id === args[1]) {
                return [200, {post: posts[i]}];
              }
            }
            return [400, {}];
          });

          $httpBackend.when('PUT', /\/posts\/(.+)\/upvote/).respond(function(method, url, data, headers,params) {
            for (i in posts) {
              if (posts[i].id) {
                posts[i].upvotes += 1;
                return [200, {post: posts[i]}];
              }
            }
            return [400, {}];
          });
        });
        inject(function(_$controller_) {
          $controller = _$controller_;
        });

        inject(function($rootScope) {
          $scope = $rootScope.$new();
        });

    });
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    })
    it("module", function() {
      var ctrl = $controller('MainController', {$scope : $scope});
      var post = { id: "34kd34" , title : 'test', upvotes: 4 , text:'latijn'};

      $http.get('http://localhost/test').success(function(data, status, header, config){
        ctrl.valid = true;
        ctrl.name = data.name;
      });

      $http.get('/posts/34kd34').success(function(data, status, header, config){
        ctrl.post = data.post;
      });

      $http.put('/posts/34kd34/upvote').success(function(data, status, header, config){
        ctrl.post = data.post;
      });

      $httpBackend.flush(); //Verwerken van alle httpcalls (assynchroon faken)
      expect(ctrl.post.upvotes).toBe(11);
      expect(ctrl.valid).toBe(true);
      expect(ctrl.name).toEqual('rudy');
      expect(ctrl.post.id).toEqual('34kd34');
    });
});