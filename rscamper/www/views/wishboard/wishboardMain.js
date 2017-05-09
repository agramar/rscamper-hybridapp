/**
 * Created by 이성주 on 2016-12-07.
 */
angular.module('App')
  .controller('wishboardMainCtrl', function ($scope, $rootScope, $http, $ionicBackdrop, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate, $location) {
    var url = 'http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailCommon?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y';
    $scope.wishBoardList = [];
    $scope.locationCheckList = [];
      $http.get($rootScope.url + '8081/app/tourschedule/getWishBoardList', {
        params : {
          userUid : $rootScope.rootUser.userUid
        }
      })
        .success(function (data) {
          var dataInfo = data;
          console.log("받아온 정보",dataInfo);

          for (var i = 0; i < data.length; i++) {
            $http.get(url,{
              params : {
              contentId : data[i].contentId
              }
            })
              .success(function (result) {
                $scope.wishBoardList.push(result.response.body.items.item);
                if($scope.wishBoardList.length == dataInfo.length) {
                  for (var j = 0; j < dataInfo.length; j++) {
                    for (var k = 0; k < $scope.wishBoardList.length; k++) {
                      if (dataInfo[j].contentId == $scope.wishBoardList[k].contentid) {
                        console.log($scope.wishBoardList[k].contentid);
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
              });
          }
        });

      $scope.addLike = function ($event,contentid) {
        $event.stopPropagation();
        console.log(contentid);
      }

      $scope.moveDetail = function (no) {
        $location.path('/location/'+no);
      }
  })
