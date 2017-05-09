/**
 * Created by 이성주 on 2016-12-01.
 */
app.controller("scheduleListMainCtrl", function ($rootScope, $scope, $stateParams, $http, $ionicModal, $ionicLoading, MyConfig, MyPopup, ValChkService, $ionicActionSheet, $timeout) {
/*  $http.get($rootScope.url + "8081/app/tourschedule/allScheduleList")
    .success(function (data) {
      console.log(data);
    })*/

  // 게시판 리스트 불러오기
  // 1. 인기순, 2. 최신순
  $scope.getScheduleList = function (soltType) {
    $scope.initPage();

    $http({
      url: $rootScope.url + "8081/app/tourschedule/allScheduleList?page=" + $scope.page + "&count=" + $scope.count + "&soltType=" + soltType,
      method: "GET"
    }).success(function (response) {
      console.log(response);
      angular.forEach(response.tourList, function (schedule) {
        $rootScope.allScheduleList.push(schedule);
      })
      $scope.total = response.totalPages;
      $scope.totalCount = response.totalCount;
    })
      .error(function (error) {
        MyPopup.alert("에러", "서버접속불가");
      })
      .finally(function () {
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      });
  }

  $scope.initPage = function () {
    $scope.page++;
    $ionicLoading.show({
      template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
    });
  }

  // 위로 당겼을 때 페이징 초기화 및 새로고침
  $scope.load = function (soltType) {
    $scope.count = 5;
    $scope.page = 0;
    $scope.total = 1;
    $rootScope.allScheduleList = [];
    $scope.soltType = soltType;
    $scope.getScheduleList(soltType);
  }

  $scope.soltLoad = function () {
    console.log($scope.soltType);
    $scope.load($scope.soltType);
  }

  $scope.infinteScroll = function () {
    $scope.getScheduleList($scope.soltType);
  }

  $scope.load(1);

  $scope.soltDate = function () {
// Show the action sheet
    console.log("asdsad");
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: '전체' },
        { text: '최근 1일'},
        { text: '최근 1주'},
        { text: '최근 1달'}
      ],
      cancelText: '취소',
      cancel: function() {

      },
      buttonClicked: function(index) {
        hideSheet();
        if (index == 0) {
          $scope.load(3);
        }
        if (index == 1) {
          $scope.load(4);
        }
        if (index == 2) {
          $scope.load(5);
        }
        if (index == 3) {
          $scope.load(6);
        }
        return index;
      }
    });
    $timeout(function() {
      hideSheet();
    }, 5000);
  }



  $scope.soltPopular = function () {
// Show the action sheet
    console.log("asdsad");
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: '인기순' },
        { text: '최신순'}
      ],
      cancelText: '취소',
      cancel: function() {

      },
      buttonClicked: function(index) {
        hideSheet();
        if (index == 0) {
          $scope.load(1);
        }
        if (index == 1) {
          $scope.load(2);
        }
        return index;
      }
    });
    $timeout(function() {
      hideSheet();
    }, 5000);
  }
})
