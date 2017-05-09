/**
 * Created by Bitcamp on 2016-11-02.
 */
angular.module('App')
  .controller('dScheduleCtrl', function ($scope, $rootScope, $stateParams, $http, detailSchedule, $ionicActionSheet, $timeout, $ionicModal, tourSchedulePopup, $location, $cordovaSocialSharing) {
    /*  $scope.budgetSetting = {
     priceType : 1,
     content : "",
     price : 0
     }*/
    var imgid = 1;
    $("#memoTitle").val("");
    $("#edit-text").html("");
    $scope.memoTItle = "";
    $scope.scheduleLikeCnt = {};
    $rootScope.dSchedule = detailSchedule.getScheduleInfo($stateParams.no);
    console.log($rootScope.dSchedule);
    $scope.updateBtn = true;
    $scope.strapline = {
      title: "",
      content: ""
    }

    $scope.getDetailDate = function () {
      $rootScope.getScheduleLocation = {};
      $http.get($rootScope.url + '8081/app/tourschedule/getScheduleLocation',
        {
          params: {
            no: $stateParams.no
          }
        })
        .success(function (data) {
          $rootScope.getScheduleLocation = data;
          for (var i = 0; i < $rootScope.getScheduleLocation.length; i++) {
            $rootScope.getScheduleLocation[i].isScheduleDetail = true;
          }
          console.log("추가된 지역 정보",data);
        })

      $http.get($rootScope.url + '8081/app/tourschedule/checkScheduleSet', {
        params: {
          userUid: $rootScope.rootUser.userUid,
          recordNo: $scope.dSchedule.recordNo,
          targetType: 3
        }
      })
        .success(function (data) {
          console.log("check", data);
          $scope.isLiked = data.scheduleLike;
          $scope.isCustomizing = data.customizing;
          $scope.isBookMark = data.bookMark;
        });

      $http.get($rootScope.url + '8081/app/tourschedule/checkScheduleDetailCnt', {
        params: {
          userUid: $rootScope.rootUser.userUid,
          recordNo: $scope.dSchedule.recordNo,
          targetType: 3
        }
      })
        .success(function (data) {
          $scope.scheduleLikeCnt.likeCnt = data.likeCnt;
          $scope.scheduleLikeCnt.customizingCnt = data.customizingCnt;
          $scope.scheduleLikeCnt.bookMarkCnt = data.bookMarkCnt;
        })

      $http.get($rootScope.url + '8081/app/tourschedule/getTourDate',
        {
          params: {
            dDate: $rootScope.dSchedule.departureDate,
            aDate: $rootScope.dSchedule.arriveDate
          }
        })
        .success(function (result) {
          $rootScope.period = result;
          console.log("기간 : " + result);
        });
    }

    $scope.getDetailDate();

    $scope.changeCover = function () {
// Show the action sheet
      var hideSheet = $ionicActionSheet.show({
        buttons: [
          {text: '카메라'},
          {text: '사진첩'}
        ],
        cancelText: '취소',
        cancel: function () {

        },
        buttonClicked: function (index) {
          hideSheet();
          if (index == 0) {
            $scope.choiceCamera();
          }
          if (index == 1) {
            $scope.choicePhotoLibrary();
          }
          return index;
        }
      });
      $timeout(function () {
        hideSheet();
      }, 5000);
    }

    $http.get($rootScope.url + '8081/app/tourschedule/getScheduleMemo', {
      params: {
        recordNo: $stateParams.no,
        userUid: $rootScope.rootUser.userUid
      }
    })
      .success(function (result) {
        $scope.scheduleMemoList = result;
        console.log("메모", $scope.scheduleMemoList);
      })

    $scope.choiceCamera = function () {
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
        $scope.updateCover(imageDATA);
      }, function (err) {

      }, options);
    }

    $scope.choicePhotoLibrary = function () {
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
        $scope.updateCover(imageDATA);
      }, function (err) {

      }, options);
    }

    $scope.updateCover = function (imageDATA) {
      $http({
        url: $rootScope.url + '8081/app/tourschedule/changeCover',
        method: 'POST',
        data: $.param({
          no: $rootScope.dSchedule.recordNo,
          isPhoto: $rootScope.dSchedule.picture,
          photo: 'data:image/jpeg;base64,' + imageDATA
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(function (result) {
        $rootScope.dSchedule = result;
        detailSchedule.changeCover(result);
      });
    }

    $ionicModal.fromTemplateUrl('views/schedule/tourScheduleIntro.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    $ionicModal.fromTemplateUrl('views/schedule/locationMemo.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.locationMemo = modal;
    });

    $ionicModal.fromTemplateUrl('views/travelPrice/insertTravelPrice.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.insertBudget = modal;
    });

    $scope.openMemo = function (data) {
      console.log("가져온 정보",data);
      $("#memoTitle").val("");
      $("#edit-text").html("");
      $scope.memoLocation = data;
      $scope.showBudgetList = [];
      $scope.locationMemo.show();
      setTimeout(function () {
        $("#edit-title").focus();
      }, 0);
      $("#edit-text").on('click', "img", function (e) {
        $('img').remove("#" + e.target.id);
      })
    }

    $scope.resize = function (id) {
      var obj = document.getElementById(id);
      obj.style.height = "1px";
      obj.style.height = (20 + obj.scrollHeight) + "px";
    }

    $scope.updateStrapline = function (s) {
      $http({
        url: $rootScope.url + '8081/app/tourschedule/updateStrapline',
        method: 'POST',
        data: $.param({
          no: $rootScope.dSchedule.recordNo,
          title: s.title,
          content: s.content
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(function (result) {
        $rootScope.dSchedule = result;
        $scope.modal.hide();
      });
    }

    $scope.insertPicture = function () {
      var editText = $("#edit-text");
    }

    $scope.qweqweqwe = function () {
      var asd = document.getElementById("edit-text");
       $scope.imgId = 1;
       var img = "<div id='div" + imgid + "'><img id='img"+ imgid + "' src='img/defaultscheduleImg.jpg' style='width: 100%; height: 100px'/></div><br>";
       //document.execCommand('insertHTML',true, img);
       asd.innerHTML += img;
      var obj = document.getElementById("edit-text");
      if(obj.scrollHeight > 300) {
        obj.style.height = "1px";
        obj.style.height = (5 + obj.scrollHeight) + "px";
        $("#footerBar").css("height", (19 + obj.scrollHeight) + "px");
      } else {
        obj.style.height = '300px';
      }
       setTimeout(function () {
       $("#edit-text").select();
       },0);
       imgid++;
    }

    $scope.textResult = function () {
      console.log($("#edit-text").html());
    }
    $scope.delLocation = function (no) {
      $http.get($rootScope.url + '8081/app/tourschedule/delLocation',
        {
          params: {
            locationNo: no,
            no: $stateParams.no
          }
        })
        .success(function (result) {
          $rootScope.getScheduleLocation = result;
        })
    }

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
        var asd = document.getElementById("edit-text");
        asd.innerHTML += img;
        asd.innerHTML += diva;

        var obj = document.getElementById("edit-text");
        if(obj.scrollHeight > 300) {
          obj.style.height = "1px";
          obj.style.height = (5 + obj.scrollHeight) + "px";
          $("#footerBar").css("height", (19 + obj.scrollHeight) + "px");
        } else {
          obj.style.height = '300px';
        }
        setTimeout(function () {
          $("#edit-text").select();
        },0);

        imgid++;
      }, function (err) {

      }, options);
    }

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
        var img = "";
        img = "<img id='img" + imgid + "' src='data:image/jpeg;base64," + imageDATA + "'  style='width: 100%; height: 100px'/><div id='div" + imgid + "'></div>";
        var diva = "<div id='div" + imgid + "'></div>";
        document.execCommand('insertHTML', true, img);
        imgid++;
        var asd = document.getElementById("edit-text");


        asd.innerHTML += img;
        asd.innerHTML += diva;
        setTimeout(function () {
          $("#edit-text").focus();
        }, 0);

      }, function (err) {

      }, options);
    }
    // 여행 예산 부분
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
      /*    $http.get($rootScope.url + '8081/app/tourschedule/addTravelPrice', {
       params : {
       list : JSON.stringify($scope.budgetList)
       }
       })
       .success(function () {
       console.log("들어감");
       })*/
      /*     $.ajax({
       url : $rootScope.url + '8081/app/tourschedule/addTravelPrice',
       method : "post",
       type : "json",
       contentType : "application/json",
       data : JSON.stringify($scope.budgetList),
       success : function (result) {
       console.log("tjdrhd");
       }
       })*/
      /*$http({
       url: $rootScope.url + '8081/app/tourschedule/addTravelPrice',
       method: 'POST',
       data: $.param({
       list : JSON.stringify($scope.budgetList)
       }),
       headers: {
       'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
       }
       })
       .success(function (result) {
       console.log("예산 입력 결과 : ",result);
       })*/
      console.log($scope.budgetList);
    }

    // 카메라
    $("#cameraTest").click(function () {
      var aaaa = document.getElementById('edit-text');
      if (aaaa.createTextRange) {
        var range = aaaa.createTextRange();
        range.move('character', aaaa.value.length);    // input box 의 글자 수 만큼 커서를 뒤로 옮김
        range.select();
        console.log("Asdasd");
      }
      else if (this.selectionStart || this.selectionStart == '0')
        this.selectionStart = this.value.length;
    });

    $scope.updateBtnChange = function () {
      $scope.updateBtn = !$scope.updateBtn;
    }

    $scope.insertMemo = function () {
      /*    console.log('제목 : ', $("#memoTitle").val());
       console.log($("#edit-text").html());
       console.log($scope.memoLocation.contentCode);
       console.log($stateParams.no);
       console.log($("#memoType").val());*/
      console.log("script",document.getElementById('memoTitle').value);
      console.log("script",document.getElementById('edit-text').innerHTML);
      console.log("angular",$scope.memoTItle);
      console.log($("#memoTitle").val());
      console.log($("#edit-text").html());
      /* memoType == 1 :  메모*/
      /* memoType == 2 :  정보*/
      $http({
        url: $rootScope.url + '8081/app/tourschedule/addScheduleMemo',
        method: 'POST',
        data: $.param({
          recordNo: $stateParams.no,
          contentId: $scope.memoLocation.contentCode,
          userUid: $rootScope.rootUser.userUid,
          title: $("#memoTitle").val(),
          content: $("#edit-text").html(),
          regDate: new Date(),
          memoType: $("#memoType").val(),
          locationNo : $scope.memoLocation.locationNo
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }).success(function (result) {
        tourSchedulePopup.alertPopup("등록 완료", "등록이 완료되었습니다.", null);
        $scope.scheduleMemoList = result.list;
        for (var i=0; i < $scope.showBudgetList.length; i++) {
          $scope.showBudgetList[i].scheduleMemoNo = result.scheduleMemoNo;
        }
        for (var i=0; i<$scope.scheduleMemoList.length; i++) {
          if ($scope.scheduleMemoList[i].scheduleMemoNo == result.scheduleMemoNo) {
            $scope.scheduleMemoList[i].price = $scope.showBudgetList;
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
              for (var i=0; i<result.length; i++) {
                $scope.dSchedule.totalPrice += result[i].price;
              }
              console.log("총 예산", $scope.dSchedule.totalPrice);
            })
        }
      });
      $scope.locationMemo.hide();
    }

    // 댓글 부분
    $ionicModal.fromTemplateUrl('views/schedule/scheduleComment.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.commentModal = modal;
    });
    $http.get($rootScope.url + '8081/app/tourschedule/getScheduleListComment', {
      params: {
        recordNo: $scope.dSchedule.recordNo
      }
    })
      .success(function (result) {
        $scope.commentList = result;
        console.log(result);
        for (var i = 0; i < result.length; i++) {
          console.log(moment().startOf(result.regDate, 'day').fromNow())
        }
      });
    $scope.commentOpen = function () {
      $scope.commentModal.show();
    }

    $scope.resize = function () {
      var obj = document.getElementById('inputText');
      obj.style.height = "1px";
      obj.style.height = (5 + obj.scrollHeight) + "px";
      $("#footerBar").css("height", (19 + obj.scrollHeight) + "px");
    }

    $scope.insertComment = function (data) {
      $http({
        url: $rootScope.url + '8081/app/tourschedule/insertScheduleListComment',
        method: 'POST',
        data: $.param({
          userUid: $rootScope.rootUser.userUid,
          content: data,
          recordNo: $scope.dSchedule.recordNo
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

    $scope.delComment = function (commentNo) {
      console.log(commentNo);
      $scope.comfirmPop = tourSchedulePopup.comfirmPopup("삭제", "정말 삭제하시겠습니까?");
      $scope.comfirmPop.then(function (res) {
        if (res) {
          $http.get($rootScope.url + '8081/app/tourschedule/delScheduleListComment', {
            params: {
              commentNo: commentNo,
              recordNo: $scope.dSchedule.recordNo
            }
          })
            .success(function (result) {
              tourSchedulePopup.alertPopup("삭제 완료", "삭제가 완료되었습니다.", null);
              $scope.commentList = result;
            })
        }
      })
    }

    $scope.recommedComment = function ($event, commentNo) {
      $event.stopPropagation();
      $http.get($rootScope.url + '8081/app/tourschedule/addScheduleMemoLike', {
        params: {
          scheduleMemoNo: commentNo,
          userUid: $rootScope.rootUser.userUid
        }
      })
        .success(function (data) {
          console.log("추천수 : ", data);
          for (var i = 0; i < $scope.scheduleMemoList.length; i++) {
            if ($scope.scheduleMemoList[i].scheduleMemoNo == commentNo) {
              $scope.scheduleMemoList[i].likeCnt = data;
              $scope.scheduleMemoList[i].isLike = 1;
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
          for (var i = 0; i < $scope.scheduleMemoList.length; i++) {
            if ($scope.scheduleMemoList[i].scheduleMemoNo == commentNo) {
              $scope.scheduleMemoList[i].likeCnt = data;
              $scope.scheduleMemoList[i].isLike = 0;
            }
          }
        })
    }

    $scope.moveMemoDetail = function (no) {
      $location.path("/postDetail/" + no);
    }

    $scope.viewTextBox = function (s) {
      setTimeout(function () {
        $("#edit-text").focus();
      },0)
      console.log("클릭");
      var self = $("#edit-text");
      var scroll = self.offset().top;
      setTimeout(function () {
        var height = $(window).height();
        var conScroll = $("#icontent").scrollTop() + scroll - $(window).height() / 2;
        $("#icontent").animate({scrollBottom:conScroll},200,"swing");
        $("#edit-text").focus();
      },200);
    }

    $scope.editTextBox = function () {
      console.log("여기에?");
      var obj = document.getElementById("edit-text");
      if(obj.scrollHeight > 300) {
        obj.style.height = "1px";
        obj.style.height = (5 + obj.scrollHeight) + "px";
        $("#footerBar").css("height", (19 + obj.scrollHeight) + "px");
      } else {
        obj.style.height = '300px';
      }
    }
    //더보기 버튼
    $ionicModal.fromTemplateUrl('views/schedule/moreRecommendView.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.moreRecommend = modal;
    });

    $scope.moreBtn = function () {
      $scope.moreRecommend.show();
    }


    $scope.recommendSchedule = function () {
      $http.get($rootScope.url + '8081/app/tourschedule/addScheduleLike', {
        params: {
          userUid: $rootScope.rootUser.userUid,
          recordNo: $scope.dSchedule.recordNo
        }
      })
        .success(function (result) {
          $scope.scheduleLikeCnt.likeCnt = result;
          $scope.isLiked = false;
        });
    }
    $scope.cancelRecommend = function () {
      $http.get($rootScope.url + '8081/app/tourschedule/cancelScheduleLike', {
        params: {
          userUid: $rootScope.rootUser.userUid,
          recordNo: $scope.dSchedule.recordNo
        }
      })
        .success(function (result) {
          console.log("추천수 : ", result);

          $scope.scheduleLikeCnt.likeCnt = result;
          $scope.isLiked = true;
        });
    }
    $scope.customizing = function () {
      $http({
        url: $rootScope.url + '8081/app/tourschedule/addCustomizing',
        method: 'POST',
        data: $.param({
          recordNo: $scope.dSchedule.recordNo,
          budGet: $scope.dSchedule.budGet,
          period: $scope.dSchedule.period,
          strapline: $scope.dSchedule.strapline,
          title: $scope.dSchedule.title,
          arriveDate: new Date($scope.dSchedule.arriveDate),
          departureDate: new Date($scope.dSchedule.departureDate),
          isOpen: 2,
          userUid: $rootScope.rootUser.userUid
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      })
        .success(function (result) {
          $scope.scheduleLikeCnt.customizingCnt = result;
          $scope.isCustomizing = false;
        })
    }

    $scope.cancelCustomizing = function () {
      $http.get($rootScope.url + '8081/app/tourschedule/cancelCustomizing', {
        params: {
          recordNo: $scope.dSchedule.recordNo,
          userUid: $rootScope.rootUser.userUid
        }
      })
        .success(function (result) {
          $scope.scheduleLikeCnt.customizingCnt = result;
          $scope.isCustomizing = true;
        })
    }

    $scope.addBookmark = function () {
      $http.get($rootScope.url + '8081/app/tourschedule/addScheduleBookmark', {
        params: {
          targetNo: $scope.dSchedule.recordNo,
          targetType: 3,
          userUid: $rootScope.rootUser.userUid
        }
      })
        .success(function (result) {
          $scope.scheduleLikeCnt.bookMarkCnt = result;
          $scope.isBookMark = false;
        })
    }

    $scope.cancelBookMark = function () {
      $http.get($rootScope.url + '8081/app/tourschedule/cancelScheduleBookMark', {
        params: {
          targetNo: $scope.dSchedule.recordNo,
          targetType: 3,
          userUid: $rootScope.rootUser.userUid
        }
      })
        .success(function (result) {
          $scope.scheduleLikeCnt.bookMarkCnt = result;
          $scope.isBookMark = true;
        });
    }

    $scope.movePrice = function (no) {
      $location.path("travelPrice/" + no);
    }

    $scope.delPrice = function (index) {
      $scope.showBudgetList.splice(index,1);
    }

    $scope.delAddPrice = function (index) {
      $scope.budgetList.splice(index, 1);
    }

    //설정
    $ionicModal.fromTemplateUrl('views/schedule/scheduleSetting.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.scheduleSettingModal = modal;
    });
    $scope.scheduleSetting = function () {
      $scope.scheduleSettingModal.show();
    }
    $scope.newSchedule = {
      title : $rootScope.dSchedule.title,
      startDate : new Date($rootScope.dSchedule.departureDate),
      finishDate : new Date($rootScope.dSchedule.arriveDate),
      isOpen : 0
    };
    $scope.updateSchedule = function (s) {
      $scope.comfirmPop = tourSchedulePopup.comfirmPopup("수정 확인", "수정 시 일정이 초기화됩니다.");
      $scope.comfirmPop.then(function (res) {
        if (res) {
          // 유효성 체크
          if (s.isOpen == 0) {
            tourSchedulePopup.alertPopup('공개 여부','공개 여부를 선택하세요.', null);
            return false;
          }

          if (s.title == "") {
            tourSchedulePopup.alertPopup('여행 제목','여행 제목을 입력해주세요.','tourTitle');
            return false;
          }

          if (s.startDate == "") {
            tourSchedulePopup.alertPopup('출발 일자','출발 일자를 선택하세요.','sDate');
            return false;
          }

          if (s.finishDate == "") {
            tourSchedulePopup.alertPopup('도착 일자','도착 일자를 선택하세요.','fDate');
            return false;
          }
          console.log("수정된 값",s);
          var updateType = 2;
          if (new Date($rootScope.dSchedule.departureDate).getTime() == s.startDate.getTime() && new Date($rootScope.dSchedule.arriveDate).getTime() == s.finishDate.getTime()) {
            updateType = 1;
          }

          $http({
            url: $rootScope.url + '8081/app/tourschedule/updateSchedule',
            method: 'POST',
            data: $.param({
              recordNo : $rootScope.dSchedule.recordNo,
              departureDate : s.startDate,
              arriveDate : s.finishDate,
              isOpen : s.isOpen,
              title : s.title,
              type : updateType
            }),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            }
          })
            .success(function (data) {
              tourSchedulePopup.alertPopup('수정 완료','수정 완료했습니다.', null);
              console.log("수정후",data);
              $rootScope.dSchedule = data;
              $scope.getDetailDate();
              $scope.scheduleSettingModal.hide();
            })
        } else {
          tourSchedulePopup.alertPopup('수정 취소','수정 취소했습니다.', null);
        }
      })
    }
    // 공유하기 설정
    var options = {
      message: '일정을 공유해보세요!', // not supported on some apps (Facebook, Instagram)
      subject: $rootScope.dSchedule.title, // fi. for email
      files: ['', ''], // an array of filenames either locally or remotely
      url: 'https://192.168.0.190/#/scheduleList/'+ $rootScope.dSchedule.recordNo,
      chooserTitle: '공유하기' // Android only, you can override the default share sheet title
    }

    var onSuccess = function(result) {
      console.log("Share completed? " + result.completed); // On Android apps mostly return false even while it's true
      console.log("Shared to app: " + result.app); // On Android result.app is currently empty. On iOS it's empty when sharing is cancelled (result.completed=false)
    }

    var onError = function(msg) {
      console.log("Sharing failed with message: " + msg);
    }

    $scope.sharing = function () {
      window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
    }
  });
