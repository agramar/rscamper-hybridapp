angular.module('App')
  .controller('RouteCtrl', function ($rootScope, $scope, $stateParams, $http, $ionicPlatform, $ionicPopup, $ionicModal, $ionicLoading, MyConfig, $location, tourSchedulePopup, MyPopup) {
    // 글 작성 모달
    $ionicModal.fromTemplateUrl('views/route/routeWriteForm.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });
    $scope.routeWriteFormOpen = function () {
      // 값 초기화 후 열기
      $scope.routeInfo = {
        title : ''
      };
      $scope.routeList = [];
      $scope.routeSetting = {};
      $scope.routeList.push($scope.routeSetting);
      $scope.modal.show();
    };

    // 장소/내용 입력 칸 추가
    $scope.addRouteObj = function () {
      $scope.routeSetting = {};
      $scope.routeList.push($scope.routeSetting);
    }

    // 장소/내용 입력 칸 삭제
    $scope.removeRouteObj = function () {
      if ($scope.routeList.length > 1) {
        $scope.routeList.splice($scope.routeList.length - 1, 1);
      } else {
        // TODO : 뭐라쓰지?
        tourSchedulePopup.alertPopup('Error','한개는 남겨라', null);
      }
    }

    // 글 등록
    $scope.addRoute = function (routeInfo) {
      if (routeInfo.title == '') {
        tourSchedulePopup.alertPopup('Error','여행 제목을 입력해주세요','routeInfo-title');
        return false;
      }
      for (var i = 0; i < $scope.routeList.length; i++) {
        // if (basicInfo.place == '') {
        //   tourSchedulePopup.alertPopup('Error','장소를 입력해주세요','basicInfo-place-' + i);
        //   return false;
        // }
        $scope.routeList[i].title = routeInfo.title;
        $scope.routeList[i].userUid = $rootScope.rootUser.userUid;
      }
      console.log($scope.routeList);

      $http({
        url: 'http://192.168.0.187:8081/app/mypage/route',
        method: 'POST',
        data: $.param({
          jsonValue : JSON.stringify($scope.routeList)
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
      .success(function (result) {
        $scope.modal.hide();
      })
    }

    // 루트 추천 글 리스트 불러오기
    $scope.getRouteList = function () {
      $scope.page++;
      $ionicLoading.show({
        template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
      });

      $http({
        url: "http://192.168.0.187:8081/app/mypage/route?page=" + $scope.page + "&count=" + $scope.count,
        method: "GET"
      }).success(function (response) {
        console.log(response.routeList);
        angular.forEach(response.routeList, function (route) {
          $scope.allRouteList.push(route);
        });
        $scope.total = response.totalPages;
      })
        .error(function (error) {
          MyPopup.alert("에러", "서버접속불가");
        })
        .finally(function () {
          $ionicLoading.hide();
          $scope.$broadcast('scroll.refreshComplete');
          $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    };

    // 위로 당겼을 때 페이징 초기화 및 새로고침
    $scope.load = function () {
      $scope.count = 10;
      $scope.page = 0;
      $scope.total = 1;
      $scope.allRouteList = [];
      $scope.getRouteList();
    };

    // 페이지 로딩 시 데이터 불러오기
    $scope.load();
  });
// .controller('MessageCtrl', function ($rootScope, $scope, $stateParams, $http, $ionicPlatform, $ionicPopup, $ionicModal, $ionicLoading, MyConfig, $location, tourSchedulePopup) {
//   // 쪽지 리스트 불러오기
//   $scope.getMessageList = function () {
//     $scope.page++;
//     $ionicLoading.show({
//       template: '<strong class="balanced-900 bold balanced-100-bg"><div class="loader"><svg class="circular"><circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"></svg></div></strong>'
//     });
//
//     $http({
//       url: "http://192.168.0.187:8081/app/message/list?page=" + $scope.page + "&count=" + $scope.count + "&userUid=" + $rootScope.rootUser.userUid,
//       method: "GET"
//     }).success(function (response) {
//       angular.forEach(response.messageList, function (message) {
//         $scope.myMessageList.push(message);
//       });
//       $scope.total = response.totalPages;
//     })
//       .error(function (error) {
//         // MyPopup.alert("에러", "서버접속불가");
//       })
//       .finally(function () {
//         $ionicLoading.hide();
//         $scope.$broadcast('scroll.refreshComplete');
//         $scope.$broadcast('scroll.infiniteScrollComplete');
//       });
//   };
//
//   // 위로 당겼을 때 페이징 초기화 및 새로고침
//   $scope.load = function () {
//     $scope.count = 10;
//     $scope.page = 0;
//     $scope.total = 1;
//     $scope.myMessageList = [];
//     $scope.getMessageList();
//   };
//
//   // 페이지 로딩 시 데이터 불러오기
//   $scope.load();
//
//   // 쪽지 보내는 창
//   $scope.messageOpen = function () {
//     $scope.modal.show();
//   }
//   $ionicModal.fromTemplateUrl('views/message/sendMessage.html', {
//     scope: $scope
//   }).then(function(modal) {
//     $scope.modal = modal;
//   });
//
//   // 쪽지 보내는 창 유저 리스트
//   $scope.getUserList = function (event) {
//     $("#message-wrap-userlist-div").show();
//    $scope.wordList = [];
//    if (event.target.value) {
//      $http({
//        url: "http://192.168.0.187:8081/app/message/userList?word=" + event.target.value,
//        method: "GET"
//      }).success(function (response) {
//        console.log(response);
//        angular.forEach(response, function (word) {
//          $scope.wordList.push(word);
//        })
//      });
//    }
//   };
//
//   $scope.message = {
//     recvUserUid: '',
//     sentUserUid: $rootScope.rootUser.userUid,
//     title: '',
//     content: ''
//   };
//
//   // 받을 사람 선택하기
//   $scope.selectUser = function (recvUserUid, recvDisplayName) {
//     $("#message-receiver-box").val(recvDisplayName);
//     $scope.message.recvUserUid = recvUserUid;
//     $("#message-wrap-userlist-div").hide();
//   };
//
//   // 쪽지 보내기
//   $scope.sendMessage = function (message) {
//     if (message.recvUserUid == '') {
//       tourSchedulePopup.alertPopup('Error','쪽지를 받을 사람을 입력해주세요','message-receiver-box');
//       return false;
//     } else if (message.title == '') {
//       tourSchedulePopup.alertPopup('Error','제목을 입력해주세요','message-title');
//       return false;
//     } else if (message.content == '') {
//       tourSchedulePopup.alertPopup('Error','내용을 입력해주세요','message-content');
//       return false;
//     }
//
//     console.log(message);
//     $http({
//       method : 'POST',
//       url : "http://192.168.0.187:8081/app/message/send",
//       data : $.param({
//         recvUserUid: message.recvUserUid,
//         sentUserUid: message.sentUserUid,
//         title: message.title,
//         content: message.content
//       }),
//       headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
//     })
//       .success(function () {
//         $location.path("/message");
//         $scope.closeModal();
//       });
//
//     var MessageAlertPopup = $ionicPopup.alert({
//       title: 'Success!',
//       template: '쪽지를 보냈습니다'
//     });
//     MessageAlertPopup.then(function (res) {
//     });
//   }
//
//   // 모달 닫기
//   $scope.closeModal = function () {
//     $scope.modal.hide();
//     $("#message-receiver-box").val('');
//     $("#message-title").val('');
//     $("#message-content").val('');
//     $scope.message =  {
//       recvUserUid: '',
//       sentUserUid: $rootScope.rootUser.userUid,
//       title: '',
//       content: ''
//     };
//   }
// });
