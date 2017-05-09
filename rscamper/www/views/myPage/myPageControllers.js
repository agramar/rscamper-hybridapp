app.controller("MyPageMainCtrl", function ($rootScope, $scope, $stateParams, $http, $ionicModal, $ionicLoading, MyConfig, MyPopup, $location) {
  // 북마크 리스트 불러오기
  $scope.getBookMarkList = function () {
    $scope.page++;
    $ionicLoading.show({
      template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
    });

    $http({
      // url: MyConfig.backEndURL + "/mypage/select/bookMark?page=" + $scope.page + "&count=" + $scope.count + "&userUid=" + $rootScope.rootUser.userUid,
      url: "http://192.168.0.187:8081/app/mypage/select/bookMark?page=" + $scope.page + "&count=" + $scope.count + "&userUid=" + $rootScope.rootUser.userUid,
      method: "GET"
    }).success(function (response) {
      angular.forEach(response.bookMarkList, function (bookMark) {
        $scope.myBookMarkList.push(bookMark);
      })
      $scope.total = response.totalPages;

      for (var i = 0; i < $scope.myBookMarkList.length; i++) {
        var rNum = Math.floor(Math.random() * 36) + 1;
        if ($scope.myBookMarkList[i].targetType == '1' || $scope.myBookMarkList[i].picture == 0 || $scope.myBookMarkList[i].targetType == '2') {
          $scope.myBookMarkList[i].coverImgUrl = 'img/example_img/example' + rNum + '.jpg';
        }
      }
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

  // 위로 당겼을 때 페이징 초기화 및 새로고침
  $scope.load = function () {
    $scope.count = 10;
    $scope.page = 0;
    $scope.total = 1;
    $scope.myBookMarkList = [];
    $scope.getBookMarkList();
  }

  // 페이지 로딩 시 데이터 불러오기
  $scope.load();

  // 상세페이지 이동
  $scope.moveDetail = function (no, targetType) {
    switch (targetType) {
      case '1':
        $location.path("/communityDetail/"+targetType+"/"+no);
        break;
      case '2':
        $location.path("/communityDetail/"+targetType+"/"+no);
        break;
      case '3':
        $location.path("/scheduleList/"+no);
        break;
    }
  }

  // 삭제버튼
  $scope.deleteBookMark = function ($event, no, targetType) {
    $event.stopPropagation();
    $ionicLoading.show({
      template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
    });
    $http({
      url: MyConfig.backEndURL + "/community/bookMark",
      method: "POST",
      data: $.param({
        targetNo: no,
        targetType: targetType,
        userUid: $rootScope.rootUser.userUid
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
      }
    }).success(function (response) {
      $scope.bookMark = response;
      if (response == true) {
        MyPopup.alert("알림", "게시글이 북마크에서 삭제 되었습니다.");
      }
    }).error(function (error) {
      MyPopup.alert("에러", "서버접속불가");
    }).finally(function () {
      $ionicLoading.hide();
      $scope.load();
    })
  };
})
