/**
 * Created by 이성주 on 2016-12-05.
 */
angular.module('App')
.controller('schedulePostCtrl', function ($scope, $rootScope, $http, $ionicLoading, $location) {

  $scope.initPost = function () {
    $ionicLoading.show({
      template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
    });

    $http.get($rootScope.url + '8081/app/tourschedule/getMyPost', {
      params : {
        userUid : $rootScope.rootUser.userUid
      }
    })
      .success(function (result) {
        console.log(result);
        $scope.myPostList = result;
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
  }

  $scope.load = function () {
    $scope.initPost();
  }

  $scope.load();

  $scope.moveMemoDetail = function (no) {
    $location.path("/postDetail/"+no);
  }

  $scope.recommedComment = function ($event, commentNo) {
    $event.stopPropagation();
    $http.get($rootScope.url + '8081/app/tourschedule/addScheduleMemoLike', {
      params : {
        scheduleMemoNo : commentNo,
        userUid : $rootScope.rootUser.userUid
      }
    })
      .success(function (data) {
        console.log("추천수 : ", data);
        for (var i = 0; i < $scope.myPostList.length; i++) {
          if ($scope.myPostList[i].scheduleMemoNo == commentNo) {
            $scope.myPostList[i].likeCnt = data;
            $scope.myPostList[i].isLike = 1;
          }
        }
      })
  }

  $scope.cancelCommentLike = function ($event, commentNo) {
    $event.stopPropagation();
    $http.get($rootScope.url + '8081/app/tourschedule/cancelScheduleMemoLike', {
      params : {
        scheduleMemoNo : commentNo,
        userUid : $rootScope.rootUser.userUid
      }
    })
      .success(function (data) {
        for (var i = 0; i < $scope.myPostList.length; i++) {
          if ($scope.myPostList[i].scheduleMemoNo == commentNo) {
            $scope.myPostList[i].likeCnt = data;
            $scope.myPostList[i].isLike = 0;
          }
        }
      })
  }
});
