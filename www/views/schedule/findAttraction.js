/**
 * Created by Bitcamp on 2016-11-04.
 */
angular.module('App')
.controller('findAttractionCtrl',function ($scope, $rootScope, $stateParams, $http, $cordovaGeolocation, $ionicPlatform, $ionicPopover, $ionicModal, $ionicScrollDelegate, pickerView, $location) {
  console.log($stateParams.arriveDate);
  console.log($stateParams.departureDate);
  var qweqwe = [];
  $http.get($rootScope.url + "8081/app/tourschedule/getTourDate",
    {params : {
      dDate : $stateParams.departureDate,
      aDate : $stateParams.arriveDate
    }})
    .success(function (data) {
      qweqwe = data;
      console.log(data);

/*      $http.get($rootScope.url + "8081/app/tourschedule/getLocationCnt",{
        params : {
          contentIdJson : JSON.stringify($scope.showBudgetList)
        }
      })*/
    })
  $scope.mama = function () {
    $scope.qaz = 1;
    console.log($scope.qaz);
  }
  $scope.showSearchBox = false;
  $scope.userSearch = {
    place : ""
  };
  $scope.location = {
    lat : 0,
    lang: 0,
    city: "",
    current: true
  };

  $scope.getPlaceInfo = function (lang, lat) {
    $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
      {params : {
        contentTypeId : "",
        mapX : lang,
        mapY : lat,
        radius : 2000,
        listYN :'Y',
        MobileOS : 'ETC',
        MobileApp : "TourAPI3.0_Guide",
        arrange : 'A',
        numOfRows :  12,
        pageNo : '1'
      }}
    )
      .success(function (data) {
        $scope.getPlaces = data.response.body.items.item;
        console.log("getPlace",data.response.body.items.item);

        $scope.contentIdList = [];
        for (var i=0; i<$scope.getPlaces.length; i++) {
          $scope.contentIdList.push(data.response.body.items.item[i].contentid);
        }
        console.log("리스트",$scope.contentIdList);

        $http.get($rootScope.url + "8081/app/tourschedule/getLocationCnt",{
         params : {
         contentIdJson : JSON.stringify($scope.contentIdList)
         }
         })
          .success(function (result) {
            console.log("받아온 데이터",result);
            $scope.getLocationCnt(result, $scope.getPlaces);
          })
      })
  }

  $ionicPlatform.ready(function () {
      if(window.cordova && window.cordova.plugins.keyboard) {
        cordova.plugin.keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

      $scope.location = {
        lat: 0,
        long: 0,
        city: ''
      };

      $scope.location.lat = 37.4943314;
      $scope.location.long = 127.02780369999999;
      $scope.location.city = "대한민국 서울특별시 서초구 서초2동 1327-49";

      $scope.getPlaceInfo($scope.location.long, $scope.location.lat);

      // $cordovaGeolocation.getCurrentPosition().then(function (data) {
      //   $http.get('https://maps.googleapis.com/maps/api/geocode/json', {params : {latlng: data.coords.latitude + ',' + data.coords.longitude}})
      //     .success(function (response) {
      //       $scope.location = {
      //         lat : data.coords.latitude,
      //         lang: data.coords.longitude,
      //         city: response.results[0].formatted_address,
      //         current: true
      //       };
      //       $scope.getPlaceInfo(data.coords.longitude,data.coords.latitude);
      //     });
      // })
    })
  $scope.qqwe = function () {
    $scope.showSearchBox = !$scope.showSearchBox;
  }
  $scope.searchLocation = function () {
    console.log($scope.userSearch.place);
    $http.get('https://maps.googleapis.com/maps/api/geocode/json', {params: {address: $scope.userSearch.place}}).success(function (response) {
      $scope.results = response.results;
      console.log(response.results[0].geometry.location);
      $scope.getPlaceInfo(response.results[0].geometry.location.lng,response.results[0].geometry.location.lat);
      $scope.qaz = 2;
      console.log($scope.qaz);
    });
  }
  $scope.qqwe = function () {
    $scope.showSearchBox = !$scope.showSearchBox;
  }

  $scope.showImages = function (index) {
    $scope.activeSlide = index;
    $scope.showModal('views/schedule/addLocationInfo.html');
  };

  $scope.showModal = function (templateUrl) {
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.closeModal = function () {
    $scope.modal.hide();
    $scope.modal.remove();
  };
  $scope.qweqwe = function ($event) {
    $event.stopPropagation();
  }

  $scope.showDatePicker = function($event) {
    var options = {
      date: new Date(),
      mode: 'date'
    };
    datePicker.show(options, function(date){
      if(date != 'Invalid Date') {
        console.log("Date came" + date);
      } else {
        console.log(date);
      }
    });
    $event.stopPropagation();
  };

  $scope.openPickerView = function openPickerView(place) {
    console.log(place)
    var picker = pickerView.show({
      titleText: '방문 시간을 선택해주세요.', // default empty string
      doneButtonText: '<i class="ion-checkmark-circled"></i>', // dafault 'Done'
      cancelButtonText: '<i class="ion-close"></i>', // default 'Cancel'
      items: [{
        values: qweqwe,
        defaultIndex: 0
      }, {
        values: ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],
        defaultIndex: 2
      }, {
        values: ["00","30"],
        defaultIndex: 0
      }]
    });

    if (picker) {
      picker.then(function pickerViewFinish(output) {
        console.log(place.mapx);
        console.log(place.mapy);
        if (output) {
          // output is Array type
          $scope.pickerOutput = JSON.stringify(output);
          $http.get($rootScope.url + "8081/app/tourschedule/addScheduleLocation",
            {params : {
              add : $scope.pickerOutput,
              title : place.title,
              imgUrl : place.firstimage,
              contentCode : place.contentid,
              contentTypeId : place.contenttypeid,
              recordNo : $stateParams.recordNo,
              mapX : place.mapx,
              mapY : place.mapy
          }})
            .success(function () {
              $location.path("/detailSchedule/detail/"+$stateParams.recordNo);
            })
        }
      });
    }
  };

  $scope.getLocationCnt = function (data, locationInfo) {
    var dataInfo = data;
    $scope.locationCheckList = [];
    console.log("locationInfo",locationInfo);
          $scope.wishBoardList = locationInfo;
          console.log("list",$scope.wishBoardList[0]);
            for (var j = 0; j < dataInfo.length; j++) {
              for (var k = 0; k < $scope.wishBoardList.length; k++) {
                if (dataInfo[j].contentId == $scope.wishBoardList[k].contentid) {
                  console.log("들어옴");
                  $http.get($rootScope.url + '8081/app/tourschedule/checkedIsLike', {
                    params : {
                      contentId : $scope.wishBoardList[k].contentid,
                      uid : $rootScope.rootUser.userUid
                    }
                  })
                    .success(function (check) {
                      $scope.locationCheckList.push(check);
                      if ($scope.locationCheckList.length == $scope.wishBoardList.length) {
                        for (var a = 0; a < $scope.locationCheckList.length; a++) {
                          for (var b = 0; b < $scope.wishBoardList.length; b++) {
                            if ($scope.wishBoardList[b].contentid == $scope.locationCheckList[a].contentId) {
                              $scope.wishBoardList[b].isLike = $scope.locationCheckList[a].isLike;
                              $scope.wishBoardList[b].isBack = $scope.locationCheckList[a].isBack;
                              console.log("asdasd");
                            }
                          }
                        }
                      }
                    })
                  $scope.wishBoardList[k].likeCnt = dataInfo[j].likeCnt;
                  $scope.wishBoardList[k].postCnt = dataInfo[j].postCnt;
                  $scope.wishBoardList[k].backLikeCnt = dataInfo[j].backLikeCnt;
                }
              }
            }
            console.log("최종", $scope.wishBoardList);
  }
})
