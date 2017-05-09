  angular.module('App')
  .controller('TourDetailCtrl', function ($scope, $stateParams, $http, $ionicBackdrop, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicPlatform) {
    $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailImage?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
      {params : {
        contentId : $stateParams.contentid,
        MobileOS : 'ETC',
        MobileApp : "AppTesting"
      }}
    )
      .success(function (data) {
        $scope.zoomMin = 1;
        $scope.imageList = data.response.body.items.item;
        $scope.isPhoto = true;
        if(!$scope.imageList) {
          $scope.isPhoto = false;
        }
        console.log("imageList", $scope.imageList);
      });

    $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailInfo?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
      {params : {
        contentId : $stateParams.contentid,
        contentTypeId : 12,
        MobileOS : 'ETC',
        MobileApp : "AppTesting"
      }}
    )
      .success(function (data) {
        var itemList = data.response.body.items.item;
        function detailInfo(infoname, infotext) {
          this.infoname = infoname;
          this.infotext = infotext;
        }
        $scope.detailList = [];
        if(itemList) {
          for (var i = 0; i < itemList.length; i++) {
            var item = itemList[i];
            item.infoname = item.infoname.replace(/ /gi, "");
            if (item.infoname == '입장료' || item.infoname == '관람료' || item.infoname == '시설이용료') {
              $scope.detailList.push(new detailInfo('요금', item.infotext));
            } else if (item.infoname == '촬영장소') {
              $scope.detailList.push(new detailInfo('촬영장소', item.infotext));
            } else if (item.infoname == '이용가능시설') {
              $scope.detailList.push(new detailInfo('이용가능시설', item.infotext));
            } else if (item.infoname == '화장실') {
              $scope.detailList.push(new detailInfo('화장실', item.infotext));
            } else if (item.infoname == '시설이용료') {
              $scope.detailList.push(new detailInfo('시설이용료', item.infotext));
            }
          };
          console.log("infoList", itemList);
          console.log("detailList", $scope.detailList);
        }
      });
    $scope.showImages = function (index) {
      $scope.activeSlide = index;
      $scope.showModal('templates/gallery-zoomview.html');
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

    $scope.updateSlideStatus = function (slide) {
      var zoomFactor = $ionicScrollDelegate.$getByHandle('scrollHandle' + slide).getScrollPosition().zoom;
      if (zoomFactor == $scope.zoomMin) {
        $ionicSlideBoxDelegate.enableSlide(true);
      } else {
        $ionicSlideBoxDelegate.enableSlide(false);
      }
    };
  });
