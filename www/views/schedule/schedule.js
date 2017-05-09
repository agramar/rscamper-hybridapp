/**
 * Created by Bitcamp on 2016-10-31.
 */
angular.module('App')
  .controller('ScheduleCtrl', function ($ionicPlatform, $cordovaGeolocation, $http, $state, $scope, $ionicModal, $ionicPopup, tourSchedulePopup, $rootScope, $location, detailSchedule, $ionicLoading) {
    $scope.loadSchedule = function () {
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });

      $rootScope.listCount = 0;
      $http.get($rootScope.url + "8081/app/tourschedule/getschedule",{
        params :{
          uid : $rootScope.rootUser.userUid
        }
      })
        .success(function (result) {
          $rootScope.scheduleList = result;
          console.log(result);
          $rootScope.listCount = result.length;
          console.log("scheduleCtrl");
        })
        .finally(function () {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    }
    $scope.loadSchedule();
    $scope.newSchedule = {
      title : "",
      startDate : "",
      finishDate : "",
      isOpen : 0
    };
    $ionicModal.fromTemplateUrl('views/schedule/makeSchedule.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.createSchedule = function (s) {
      console.log(s);
      if (s.isOpen == 0) {
        tourSchedulePopup.alertPopup('공개 여부','공개 여부를 선택하세요.', null);
        return false;
      }

      if (s.title == "") {
        tourSchedulePopup.alertPopup('여행 제목','여행 제목을 입력해주세요.','tourTitle');
        return false;
      }

      if (s.startDate == "") {
        tourSchedulePopup.alertPopup('출발 일자','출발 일자를 선택하세요.','sDate');
        return false;
      }

      if (s.finishDate == "") {
        tourSchedulePopup.alertPopup('도착 일자','도착 일자를 선택하세요.','fDate');
        return false;
      }
        $http.get($rootScope.url + "8081/app/tourschedule/insert",
          {params : {
            uid   : $rootScope.rootUser.userUid,
            title : s.title,
            sDate : s.startDate,
            fDate : s.finishDate,
            isOpen : s.isOpen
          }})
          .success(function (result) {
            $rootScope.scheduleList = result;
            $rootScope.listCount = result.length;
            $scope.modal.hide();
          })
      }

      $scope.delSchedule = function ($event, no) {
        $event.stopPropagation();
        var confirmPopup = $ionicPopup.confirm({
          template: '일정을 삭제하시겠습니까?'
        });
        confirmPopup.then(function (res) {
          if (res) {
            $http.get($rootScope.url + '8081/app/tourschedule/delSchedule',
              {params : {
                uid : $rootScope.rootUser.userUid,
                no : no
              }})
              .success(function (result) {
                $rootScope.scheduleList = result;
                $rootScope.listCount = result.length;
              });
          } else {
            return false;
          }
        })
      }

      $scope.moveDetail = function (no) {
        $location.path("/detailSchedule/detail/"+no);
      }

      $scope.openNewSchedule = function () {
        $scope.newSchedule = {
          title : "",
          startDate : "",
          finishDate : "",
          isOpen : 0
        };
        console.log("gkdl");
        $scope.modal.show();
      }
  });
