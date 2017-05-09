angular.module('App')
  .controller('TourDetailCtrl', function ($scope, $stateParams, $http, $ionicBackdrop, $ionicModal, $ionicSlideBoxDelegate, $ionicScrollDelegate) {
    // $stateParams.contentid;

    $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailImage?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
      {params : {
        contentId : 127925,
        MobileOS : 'ETC',
        MobileApp : "AppTesting"
      }}
    )
      .success(function (data) {
        console.log(data.response.body.items.item);
        $scope.imageList = data.response.body.items.item;
        $scope.zoomMin = 1;
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
