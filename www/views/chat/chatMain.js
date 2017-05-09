/**
 * Created by Bitcamp on 2016-11-16.
 */
angular.module('App')
.controller('chatMainCtrl',function ($scope, $ionicModal, $http, $rootScope, tourSchedulePopup, $location) {
  // $rootScope.socket = io.connect("http://192.168.0.190:10001");
  $rootScope.socket = io.connect("http://14.32.66.104:8084");
  $http.get($rootScope.url + "8081/app/chat/getCodeName", {
    params : {
      codeName : 'chat_areacode'
    }})
    .success(function (result) {
      $rootScope.codeTb = result;
      console.log($rootScope.codeTb);
    })

  $ionicModal.fromTemplateUrl('views/chat/createRoom.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.closeModal = function () {
    $scope.modal.hide();
  }

  $scope.qweqwe = function ($event) {
    $event.stopPropagation();
  }
  $scope.createRoom = {
    roomTitle : "",
    codeNo : 0
  }

    $scope.makeRoom = function (c) {
      if (c.codeNo == 0) {
        tourSchedulePopup.alertPopup('지역 선택','지역을 선택해주세요.','locationCategory');
        return false;
      }

      if (c.roomTitle == "") {
        tourSchedulePopup.alertPopup('제목 입력','제목을 입력해주세요.','roomTitle');
        return false;
      }
    $http({
      method : 'POST',
      url : $rootScope.url + "8081/app/chat/createRoom",
      data : $.param({
        areacode: c.codeNo,
        chatRoomName: c.roomTitle
      }),
      headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'}
    })
      .success(function (result) {

        $http.get($rootScope.url + "8081/app/chat/getChatRoom", {
          params : {
            no : result.areacode
          }
        })
          .success(function (data) {
            $rootScope.roomList = data;
            console.log($rootScope.roomList);
            $location.path("/chatRoom/"+result.chatRoomInfoNo);
            $scope.modal.hide();
          })
      })
  }
});
