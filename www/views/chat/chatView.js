angular.module('App')
.controller('chatViewCtrl',function ($scope, $rootScope, $stateParams) {
  console.log("hello");
  /*var socket = io.connect($rootScope.url + "10001");

  socket.emit("login","hi");
*/
  for (var i = 0; i < $rootScope.codeTb.length; i++) {
    if ($stateParams.no == $rootScope.codeTb[i].codeNo) {
      $scope.area = $rootScope.codeTb[i];
      console.log($scope.area);
      return false;
    }
  }

  $scope.resize = function () {
    var obj = document.getElementById('chatText');
    obj.style.height = "1px";
    obj.style.height = (20+obj.scrollHeight) + "px";
    console.log('hi');
  }

  $scope.sendMsg = function () {
    console.log("aaa");
    socket.emit('msg',{recvId:'hello',sendId:'hi',msg:$scope.input.message});
  }

  function qqqwer() {
    console.log("aaaab");
  }
/*
  function sendMsg1() {
    console.log("hi");
  }*/
});
