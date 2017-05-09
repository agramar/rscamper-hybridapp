angular.module('App')
.controller('MessageDetailCtrl', function ($rootScope, $scope, $stateParams, $http, $ionicPlatform, $ionicModal, $ionicLoading, MyConfig, $location) {
  $http({
    url: "http://192.168.0.187:8081/app/message/detail?notesNo=" + $stateParams.notesNo,
    method: "GET"
  }).success(function (response) {
    $scope.message = response;
    console.log($scope.message);
  })
})
