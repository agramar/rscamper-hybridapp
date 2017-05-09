/**
 * Created by 이성주 on 2016-12-09.
 */
angular.module('App')
.controller('travelPriceCtrl',function ($scope, $rootScope, $http, $stateParams) {
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
  });
  $scope.travelPriceInfo = {
    totalSum : 0,
    type1 : 0,
    type2 : 0,
    type3 : 0,
    type4 : 0,
    type5 : 0,
    type6 : 0
  };
  $http.get($rootScope.url + '8081/app/tourschedule/getScheduleTravelPrice',{
    params : {
      recordNo : $stateParams.recordNo
    }
  })
    .success(function (result) {
      console.log("상세 경비", result);
      for (var i=0; i<result.length; i++) {
        $scope.travelPriceInfo.totalSum += result[i].travelPrice;
        switch (result[i].priceType) {
          case 1 : $scope.travelPriceInfo.type1 += result[i].travelPrice; break;
          case 2 : $scope.travelPriceInfo.type2 += result[i].travelPrice; break;
          case 3 : $scope.travelPriceInfo.type3 += result[i].travelPrice; break;
          case 4 : $scope.travelPriceInfo.type4 += result[i].travelPrice; break;
          case 5 : $scope.travelPriceInfo.type5 += result[i].travelPrice; break;
          case 6 : $scope.travelPriceInfo.type6 += result[i].travelPrice; break;
        }
      }

      $http.get($rootScope.url + '8081/app/tourschedule/getScheduleLocation',
        {
          params: {
            no: $stateParams.recordNo
          }
        })
        .success(function (data) {
          for (var i=0; i<result.length; i++) {
            for (var j=0; j < data.length; j++) {
              if (result[i].contentId == data[j].contentCode) {
                result[i].dDate = data[j].departureDate;
                result[i].title = data[j].title;
                break;
              }
            }
          }
          console.log("경비 최종 ", result);
          $scope.travelPriceList = result;
        });
    })
  $http.get($rootScope.url + '8081/app/tourschedule/scheduleListDetail', {
    params : {
      no : $stateParams.recordNo
    }
  })
    .success(function (data) {
      $scope.travelPrice = data;

      $http.get($rootScope.url + '8081/app/tourschedule/getTourDate',
        {params : {
          dDate : $scope.travelPrice.departureDate,
          aDate : $scope.travelPrice.arriveDate
        }})
        .success(function (result) {
          $scope.period = result;
          console.log("기간 : " + result);
        });
    });
});
