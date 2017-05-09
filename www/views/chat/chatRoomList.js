/**
 * Created by 이성주 on 2016-11-18.
 */
angular.module("App")
.controller('chatRoomListCtrl', function ($scope, $rootScope, $http, locationCategory, $stateParams) {
    $scope.location = locationCategory.detailCategory($stateParams.no);

    $http.get($rootScope.url + "8081/app/chat/getChatRoom", {
      params : {
        no : $stateParams.no
      }
    })
      .success(function (data) {
        $rootScope.roomList = data;
        console.log($rootScope.roomList);
      })

 /* $http.get($rootScope.url + "8081/app/chat/delChatUser", {
    params : {
      uid : $rootScope.rootUser.userUid
    }
  })
    .success(function () {
      console.log("삭제 완료");
    });*/

  $rootScope.socket.emit('outRoom',{
    uid : $rootScope.rootUser.userUid
  });

  $rootScope.socket.on('roomList', function (data) {
      console.log(data);
      $rootScope.roomList = data;
      $rootScope.socket.emit('exit', {
        uid : $rootScope.rootUser.userUid
      })
  });

  $rootScope.socket.on('outRoomUser', function () {
    $rootScope.socket.emit('exit', {
      uid : $rootScope.rootUser.userUid
    })
  });

})
