/**
 * Created by Bitcamp on 2016-11-08.
 */
angular.module('App')
  .controller('detailLocationInfoCtrl',function ($scope, $rootScope, $stateParams, $http, $cordovaGeolocation, $ionicPlatform, $ionicPopover, $ionicModal, $ionicScrollDelegate, pickerView, $location, detailLocationInfo, tourSchedulePopup) {
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
      viewData.enableBack = true;
    });
    /*$scope.detailInfo = detailLocationInfo.getLocationInfo($stateParams.locationNo);*/
    $scope.moreText = true;
    $scope.locationMap = {};
    $scope.likeCount = 0;
    console.log("정보 : ",$stateParams.locationNo);
    $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailCommon?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D&MobileOS=ETC&MobileApp=TourAPI3.0_Guide&defaultYN=Y&firstImageYN=Y&areacodeYN=Y&catcodeYN=Y&addrinfoYN=Y&mapinfoYN=Y&overviewYN=Y&transGuideYN=Y',{
      params : {
        contentId : $stateParams.locationNo
      }
    })
      .success(function (data) {
        $scope.detailInfo = data.response.body.items.item;
        console.log($scope.detailInfo);
        $http.get($rootScope.url + "8081/app/tourschedule/checkLocationLikeCnt", {
          params : {
            contentId : $stateParams.locationNo
          }
        })
          .success(function (result) {
            $scope.locationCnt = result;
          });

        $http.get($rootScope.url + "8081/app/tourschedule/getLocationMemo",{
          params : {
            contentId : $stateParams.locationNo
          }
        })
          .success(function (memo) {
            $scope.myPostList = memo;
            console.log("정보???",memo);
          })

        $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailImage?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
          {params : {
            contentTypeId : $scope.detailInfo.contenttypeid,
            MobileOS : 'ETC',
            MobileApp : 'AppTest',
            contentId : $scope.detailInfo.contentid,
            imageYN : 'Y'
          }})
          .success(function (data) {
            $scope.imageList = data.response.body.items.item;
            console.log("이미지",$scope.imageList);
            $scope.isPhoto = true;
            if (!$scope.imageList) {
              $scope.isPhoto = false;
            }
            $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/detailCommon?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
              {params : {
                contentTypeId : $scope.detailInfo.contenttypeid,
                contentId : $scope.detailInfo.contentid,
                MobileOS : 'ETC',
                MobileApp : 'AppTest',
                defaultYN : 'Y',
                firstImageYN : 'Y',
                areacodeYN : 'Y',
                catcodeYN : 'Y',
                addrinfoYN : 'Y',
                mapinfoYN : 'Y',
                overviewYN : 'Y',
                transGuideYN : 'Y'
              }})
              .success(function (data) {
                $scope.locationMap = data.response.body.items.item;
                console.log($scope.locationMap);
                initialize();
              })
          });
        $http.get($rootScope.url + "8081/app/tourschedule/checkedIsLike",
          {params : {
            contentId : $scope.detailInfo.contentid,
            uid : $rootScope.rootUser.userUid
          }})
          .success(function (data) {
            $scope.isLiked = data.isLike;
            $scope.isBack = data.isBack;
          });
        $ionicPlatform.ready(function () {
          if (window.cordova && window.cordova.plugins.keyboard) {
            cordova.plugin.keyboard.hideKeyboardAccessoryBar(true);
          }
          if (window.StatusBar) {
            StatusBar.styleDefault();
          }
        })
        var map = null;

        // 처음 맵 만드는 함수
        function initialize() {
          var myLatlng = new google.maps.LatLng($scope.locationMap.mapy, $scope.locationMap.mapx);
          var mapOptions = {
            center: myLatlng,
            zoom: 14,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var map = new google.maps.Map(document.getElementById("scheduleMap"), mapOptions);

          new google.maps.Marker({
            position: myLatlng,
            map: map,
            draggable: true
          });

          $scope.map = map;
        }

        $http.get($rootScope.url + "8081/app/tourschedule/locationLikeCount",
          {params : {
            no : $scope.detailInfo.contentid
          }})
          .success(function (data) {
            $scope.likeCount = data;
          })

        $scope.likePlus = function (code) {
          $http.get($rootScope.url + "8081/app/tourschedule/insertLikePlus",
            {params : {
              no : code,
              uid : $rootScope.rootUser.userUid
            }})
            .success(function (data) {
              $scope.isLiked = false;
              $scope.locationCnt.likeCnt = data;
            })
        }

        $scope.backLikePlus = function (code) {
          $http.get($rootScope.url + "8081/app/tourschedule/addBackLocationLike",
            {params : {
              contentId : code,
              uid : $rootScope.rootUser.userUid
            }})
            .success(function (data) {
              $scope.isBack = false;
              $scope.locationCnt.backLocationCnt = data;
            })
        }


        $scope.removeLiked = function (code) {
          $http.get($rootScope.url + "8081/app/tourschedule/removeLiked",
            {params : {
              no : code,
              uid : $rootScope.rootUser.userUid
            }})
            .success(function (data) {
              $scope.isLiked = true;
              $scope.locationCnt.likeCnt = data;
            })
        }

        $scope.removeBackLiked = function (code) {
          $http.get($rootScope.url + "8081/app/tourschedule/delBackLocationLike",
            {params : {
              contentId : code,
              uid : $rootScope.rootUser.userUid
            }})
            .success(function (data) {
              $scope.isBack = true;
              $scope.locationCnt.backLocationCnt = data;
            })
        }

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


        $scope.moveMemoDetail = function (no) {
          $location.path("/postDetail/"+no);
        }

        $scope.recommedComment = function ($event, commentNo) {
          $event.stopPropagation();
          $http.get($rootScope.url + '8081/app/tourschedule/addScheduleMemoLike', {
            params : {
              scheduleMemoNo : commentNo,
              userUid : $rootScope.rootUser.userUid
            }
          })
            .success(function (data) {
              console.log("추천수 : ", data);
              for (var i = 0; i < $scope.myPostList.length; i++) {
                if ($scope.myPostList[i].scheduleMemoNo == commentNo) {
                  $scope.myPostList[i].likeCnt = data;
                  $scope.myPostList[i].isLike = 1;
                }
              }
            })
        }

        $scope.cancelCommentLike = function ($event, commentNo) {
          $event.stopPropagation();
          $http.get($rootScope.url + '8081/app/tourschedule/cancelScheduleMemoLike', {
            params: {
              scheduleMemoNo: commentNo,
              userUid: $rootScope.rootUser.userUid
            }
          })
            .success(function (data) {
              for (var i = 0; i < $scope.myPostList.length; i++) {
                if ($scope.myPostList[i].scheduleMemoNo == commentNo) {
                  $scope.myPostList[i].likeCnt = data;
                  $scope.myPostList[i].isLike = 0;
                }
              }
            })

        }

        $scope.moreDetail = function () {
          $("#location-info").removeClass("detailLocation-moreText");
          $scope.moreText = false;
        }

        $scope.closeDetail = function () {
          $("#location-info").addClass("detailLocation-moreText");
          $scope.moreText = true;
        }


        // 댓글
        $ionicModal.fromTemplateUrl('views/schedule/locationComment.html', {
          scope: $scope
        }).then(function(modal) {
          $scope.commentModal = modal;
        });

        $scope.commentOpen = function () {
          $scope.commentModal.show();
        }

        $scope.resize = function () {
          var obj = document.getElementById('inputText');
          obj.style.height = "1px";
          obj.style.height = (5+obj.scrollHeight) + "px";
          $("#footerBar").css("height",(19+obj.scrollHeight) + "px");
        }

        $http.get($rootScope.url + '8081/app/tourschedule/getLocationComment', {
          params : {
            contentId : $stateParams.locationNo
          }
        })
          .success(function (result) {
            $scope.commentList = result;
            console.log(result);
          });

        $scope.insertComment = function (data) {
          $http({
            url: $rootScope.url + '8081/app/tourschedule/addLocationComment',
            method: 'POST',
            data: $.param({
              userUid : $rootScope.rootUser.userUid,
              content : data,
              contentId : $stateParams.locationNo
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          })
            .success(function (result) {
              console.log(result);
              $scope.commentList = result;
              $("#inputText").val("");
            });
        }

        // 리뷰 쓰기
        // memo 모달 설정
        $ionicModal.fromTemplateUrl('views/schedule/locationMemo.html', {
          scope: $scope
        }).then(function (modal) {
          $scope.locationMemo = modal;
        });
        // 모달 호출
        $scope.openMemo = function (data) {
          $scope.memoLocation = data;
          console.log(data);
          $scope.locationMemo.show();
          $scope.showBudgetList = [];

          $("#edit-text").on('click', "img", function (e) {
            $('img').remove("#" + e.target.id);
          })
        }
        // 텍스트 창 크기 조절
        $scope.editTextBox = function () {
          var obj = document.getElementById("edit-text");
          if(obj.scrollHeight > 300) {
            obj.style.height = "1px";
            obj.style.height = (5 + obj.scrollHeight) + "px";
            $("#footerBar").css("height", (19 + obj.scrollHeight) + "px");
          } else {
            obj.style.height = '300px';
          }
        }
        // 텍스트 창 클릭 시 포커스 이동
        $scope.clickMemo = function () {
          setTimeout(function () {
            $("#edit-text").focus();
          }, 0);
        }

        $scope.insertMemo = function () {
          /*    console.log('제목 : ', $("#memoTitle").val());
           console.log($("#edit-text").html());
           console.log($scope.memoLocation.contentCode);
           console.log($stateParams.no);
           console.log($("#memoType").val());*/

          /* memoType == 1 :  메모*/
          /* memoType == 2 :  정보*/
          $http({
            url: $rootScope.url + '8081/app/tourschedule/addWishBoardReview',
            method: 'POST',
            data: $.param({
              contentId: $scope.memoLocation.contentid,
              userUid: $rootScope.rootUser.userUid,
              title: $("#memoTitle").val(),
              content: $("#edit-text").html(),
              regDate: new Date(),
              memoType: $("#memoType").val()
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          }).success(function (result) {
            tourSchedulePopup.alertPopup("등록 완료", "등록이 완료되었습니다.", null);
            $scope.myPostList = result.list;
            console.log($scope.myPostList);
            for (var i=0; i < $scope.showBudgetList.length; i++) {
              $scope.showBudgetList[i].scheduleMemoNo = result.scheduleMemoNo;
            }
            for (var i=0; i<$scope.myPostList.length; i++) {
              if ($scope.myPostList[i].scheduleMemoNo == result.scheduleMemoNo) {
                $scope.myPostList[i].price = $scope.showBudgetList;
              }
            }
            console.log($scope.showBudgetList);
            if ($scope.showBudgetList.length > 0) {
              $http({
                url: $rootScope.url + '8081/app/tourschedule/addTravelPrice',
                method: 'POST',
                data: $.param({
                  list : JSON.stringify($scope.showBudgetList)
                }),
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
              })
                .success(function (result) {
                  console.log("예산 입력 결과 : ",result);
                })
            }
          });
          $scope.locationMemo.hide();
        }


        // 카메라
        $scope.openCamera = function () {
          var options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
          };
          navigator.camera.getPicture(function (imageDATA) {
            $scope.imgId = 1;
            var img = "<img id='img" + imgid + "' src='data:image/jpeg;base64," + imageDATA + "'  style='width: 100%; height: 100px'/>";
            var diva = "<div id='div" + imgid + "'></div>";
            document.execCommand('insertHTML', true, img);
            var asd = document.getElementById("edit-text");
            asd.innerHTML += img;
            asd.innerHTML += diva;
            asd.innerHTML += "　";
            $("#edit-text").focus();
            imgid++;
          }, function (err) {

          }, options);
        }


        // 갤러리
        $scope.openGallary = function () {
          var options = {
            quality: 75,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
          };
          navigator.camera.getPicture(function (imageDATA) {
            var img = "<img id='img" + imgid + "' src='data:image/jpeg;base64," + imageDATA + "'  style='width: 100%; height: 100px'/><div id='div" + imgid + "'></div>";
            var diva = "<div id='div" + imgid + "'></div>";
            document.execCommand('insertHTML', true, img);
            imgid++;
            var asd = document.getElementById("edit-text");
            asd.innerHTML += img;
            asd.innerHTML += diva;
            asd.innerHTML += "　";
            $("#edit-text").focus();
          }, function (err) {

          }, options);
        }


        // 여행 예산 부분
        $ionicModal.fromTemplateUrl('views/travelPrice/insertTravelPrice.html', {
          scope: $scope
        }).then(function (modal) {
          $scope.insertBudget = modal;
        });

        $scope.items = [{
          id: 1,
          name: '교통비'
        },
          {
            id: 2,
            name: '음식'
          },
          {
            id: 3,
            name: '오락, 엑티비티'
          },
          {
            id: 4,
            name: '쇼핑'
          },
          {
            id: 5,
            name: '숙박'
          },
          {
            id: 6,
            name: '기타'
          }]
        $scope.setBudget = function () {
          $scope.budgetList = [];
          $scope.budgetSetting = {};
          $scope.budgetList.push($scope.budgetSetting);
          console.log($scope.budgetList);
          $scope.insertBudget.show();
        }

        $scope.closeBudgetList = function () {
          $scope.budgetList = [];
          $scope.insertBudget.hide();
        }

        $scope.addBudgetSet = function () {
          $scope.budgetSetting = {};
          $scope.budgetList.push($scope.budgetSetting);
          console.log($scope.budgetList);
        }

        $scope.addBudgetList = function (data) {
          console.log($scope.budgetList);
          console.log("data", data);
          for (var i = 0; i < $scope.budgetList.length; i++) {
            $scope.budgetList[i].userUid = $rootScope.rootUser.userUid;
            $scope.budgetList[i].recordNo = $stateParams.no;
            $scope.budgetList[i].priceType = $scope.budgetList[i].priceType.id;
            $scope.budgetList[i].contentId = $scope.memoLocation.contentCode;
            $scope.budgetList[i].locationNo = $scope.memoLocation.locationNo;
          }
          console.log($scope.budgetList);
          for (var i=0; i<$scope.budgetList.length; i++) {
            $scope.showBudgetList.push($scope.budgetList[i]);
          }
          $scope.insertBudget.hide();
          console.log($scope.budgetList);
        }
      });
  })
