/**
 * Created by 이성주 on 2016-12-05.
 */
angular.module('App')
  .controller('schedulePostDetailCtrl', function ($scope, $rootScope, $http, $stateParams, $ionicActionSheet, $timeout, tourSchedulePopup, $location) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });

    $http.get($rootScope.url + '8081/app/tourschedule/getDetailPost', {
      params : {
        scheduleMemoNo : $stateParams.postNo,
        userUid : $rootScope.rootUser.userUid
      }
    })
      .success(function (data) {
        $scope.myPost = data;
        console.log("detailPost",data);
      })

    $http.get($rootScope.url + '8081/app/tourschedule/getMemoComment', {
      params : {
        postNo : $stateParams.postNo
      }
    })
      .success(function (data) {
        $scope.postCommentList = data;
        $scope.commentCnt = data.length;
      })

    $scope.resize = function () {
      if($("#inputText").val() != "") {
        $scope.putPhoto = false;
      } else {
        $scope.putPhoto = true;
      }
      var obj = document.getElementById('inputText');
      obj.style.height = "1px";
      obj.style.height = (5+obj.scrollHeight) + "px";
      $("#footerBar").css("height",(19+obj.scrollHeight) + "px");
    }

    $scope.detailMoreBtn = function () {
// Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          { text: '수정' },
          { text: '삭제'}
        ],
        cancelText: '취소',
        cancel: function() {

        },
        buttonClicked: function(index) {
          hideSheet();
          if (index == 0) {
            console.log("수정");
          }
          if (index == 1) {
            $scope.comfirmPop = tourSchedulePopup.comfirmPopup("메모 삭제","정말 삭제하시겠습니까?");
            $scope.comfirmPop.then(function (res) {
              if (res) {
                $http.get($rootScope.url + '8081/app/tourschedule/delScheduleMemo',{
                  params : {
                    scheduleMemoNo : $stateParams.postNo
                  }
                })
                  .success(function () {
                    $location.path("/schedule/post");
                  })
              }
            })
          }
          return index;
        }
      });
      $timeout(function() {
        hideSheet();
      }, 5000);
    }

    $scope.insertPostComment = function (data) {
      $http({
        url: $rootScope.url + '8081/app/tourschedule/insertMemoComment',
        method: 'POST',
        data: $.param({
          userUid : $rootScope.rootUser.userUid,
          content : data,
          scheduleMemoNo : $stateParams.postNo
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
        .success(function (result) {
          console.log(result);
          $scope.postCommentList = result;
          $scope.commentCnt = result.length;
          $("#inputText").val("");
        });
    }

    $scope.delComment = function (commentNo) {
      $scope.comfirmPop = tourSchedulePopup.comfirmPopup("삭제","정말 삭제하시겠습니까?");
      $scope.comfirmPop.then(function (res) {
        if (res) {
          $http.get($rootScope.url + '8081/app/tourschedule/delMemoComment', {
            params : {
              commentNo : commentNo,
              scheduleMemoNo : $stateParams.postNo
            }
          })
            .success(function (result) {
              tourSchedulePopup.alertPopup("삭제 완료", "삭제가 완료되었습니다.", null);
              $scope.postCommentList = result;
              $scope.commentCnt = result.length;
              $("#inputText").val("");
            })
        }
      })
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
            if ($scope.myPost.scheduleMemoNo == commentNo) {
              $scope.myPost.likeCnt = data;
              $scope.myPost.isLike = 1;
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
            if ($scope.myPost.scheduleMemoNo == commentNo) {
              $scope.myPost.likeCnt = data;
              $scope.myPost.isLike = 0;
            }
        })
    }
  })
