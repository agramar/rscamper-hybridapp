/**
 * Created by 이성주 on 2016-11-17.
 */
angular.module('App')
    .controller('chatDetailCtrl', function ($scope, $rootScope, $stateParams, $ionicScrollDelegate, $http, $ionicSideMenuDelegate, locationCategory, $timeout, $ionicModal, $window) {
      var initTextSize = $("#inputText").css('height');
      var initFooterSize = $("#footerBar").css('height');

      // $rootScope.socket = io.connect("http://192.168.0.190:10001");
      $rootScope.socket = io.connect("http://14.32.66.104:8084");
      /*     $http.get($rootScope.url + "8081/app/chat/getChatRoomInfo", {
        params : {
          roomNo : $stateParams.chatRoomNo
        }
      })q
        .success(function (data) {
          $scope.roomInfo = data;
          console.log($scope.roomInfo);
        })*/
      $scope.viewRecentlyChat = false;
      $http.get($rootScope.url + "8081/app/chat/joinRoom", {
        params : {
          chatRoomInfoNo : $stateParams.chatRoomNo,
          userUid : $rootScope.rootUser.userUid
        }
      })
        .success(function (data) {
          $scope.userInfoList = data;
          $scope.userCount = data.length;
        });
      var initList = document.getElementById('msgList');
      initList.innerHTML = " ";

     /* $http.get($rootScope.url + "8081/app/chat/selectRoomUserList",{
        params : {
          chatRoomInfoNo : $stateParams.chatRoomNo
        }
      })
      .success(function (data) {
        $scope.userInfoList = data;
        $scope.userCount = data.length;
      });*/

      $rootScope.roomInfo = locationCategory.getChatRoom($stateParams.chatRoomNo);

      var initData = {
        name : $rootScope.rootUser.displayName,
        room : $stateParams.chatRoomNo,
        photoUrl : $rootScope.rootUser.photoUrl,
        uid : $rootScope.rootUser.userUid,
        areacode : $rootScope.roomInfo.areacode
      }

      //$rootScope.socket.emit("connection", initData);
      $rootScope.socket.emit('joinRoom',initData);
      var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
      $scope.scrollDown = true;
      $scope.toggleLeftSideMenu = function() {
        $ionicSideMenuDelegate.toggleRight();
      };
      console.log($rootScope.rootUser);


  $scope.msgTextBox = [];
  $scope.msg = {
    sendId : "aaa",
    msg : "hi"
  };
  //최초 접속
  $rootScope.socket.on('system',function (data) {
    initList.innerHTML += "<div style='width: 100%; text-align: center'>" + data.message + "</div>";
  });
  $rootScope.socket.on("message", function (data) {
    console.log(data);
    var initdata = {
      type : data.type,
      name : data.name,
      message : data.message,
      photoUrl : data.photoUrl,
      imgUrl : data.imgUrl,
      sendRegDate : new Date()
    }
    var currentTop = viewScroll.getScrollPosition().top;
    console.log("currentTop",currentTop);
    data.sendRegDate = new Date();
    var maxScrollableDistanceFromTop = viewScroll.getScrollView().__maxScrollTop;
    console.log("maxScrollableDistanceFromTop",maxScrollableDistanceFromTop);
    writeText(initdata,"other", data.type);
    if (maxScrollableDistanceFromTop - currentTop >= 100) {
      $scope.writeRecentlyChat(data);
/*      $("#chatUserImg").attr('src', data.photoUrl);
      $("#chatUserName").html(data.name);
      $("#chatUserContent").html(data.message);*/
      console.log("Asdasd");
    } else {
      $ionicScrollDelegate.scrollBottom();
    }
  });
  function writeText(data,user,type) {
    var checkTime = getDate();
    var msgList = document.getElementById('msgList');
    var html = '<div class="item" style="padding: 0 !important; border: none">';
    if(type == 'text') {
      if (user == 'other') {
        html += '<div ng-if="user._id !== message.userId"><img ng-click="viewProfile(message)" class="profile-pic left" src="' + data.photoUrl + '" onerror="onProfilePicError(this)">';
        html += '<div class="chat-bubble left" style="white-space:normal;"><pre>' + data.message + '</pre>';
      }
      if (user =='user') {
        html += '<div ng-if="user._id !== message.userId"><img ng-click="viewProfile(message)" class="profile-pic right" src="' + $rootScope.rootUser.photoUrl + '" onerror="onProfilePicError(this)">';
        html += '<div class="chat-bubble right" style="white-space:normal;"><pre>' + data.message  + '</pre>';
      }
    }
    if (type == 'image') {
      if (user == 'other') {
        html += '<div ng-if="user._id !== message.userId"><img ng-click="viewProfile(message)" class="profile-pic left" src="' + data.photoUrl + '" onerror="onProfilePicError(this)" >';
        html += '<div class="chat-bubble left" style="white-space:normal;"><img id="viewImg" src="' + data.imgUrl  +' " onclick="asdasd()"/>';
      }
      if (user =='user') {
        html += '<div ng-if="user._id !== message.userId"><img ng-click="viewProfile(message)" class="profile-pic right" src="' + $rootScope.rootUser.photoUrl + '" onerror="onProfilePicError(this)">';
        html += '<div class="chat-bubble right" style="white-space:normal;"><img src="' + data.imgUrl  +' " />';
      }
    }
    html += '<div class="message-detail"><span class="bold">' + data.name + '</span>,';
    html += '<span>' + data.sendRegDate.getHours() + ':' + data.sendRegDate.getMinutes() + '</span></div>';
    html += '</div>';
    html += '</div>';
    msgList.innerHTML += html;

    function asdsad() {
      alert("asd");
    }
  }
  for (var i = 0; i < $rootScope.codeTb.length; i++) {
    if ($stateParams.no == $rootScope.codeTb[i].codeNo) {
      $scope.area = $rootScope.codeTb[i];
      console.log($scope.area);
    }
  }

  $scope.sendMsgText = function () {
    $("#footerBar").css('height', initFooterSize);
    $("#inputText").css('height', initTextSize);
    $scope.putPhoto = true;
    var data = {
      type : "text",
      name : $rootScope.rootUser.displayName,
      message : $scope.msgContent,
      uid : $rootScope.rootUser.userUid,
      sendRegDate : new Date()
    }
    $rootScope.socket.emit('user',data);
    $scope.data = data;
    writeText(data,"user","text");
    $scope.msgContent = "";
    $ionicScrollDelegate.scrollBottom();
  }
  $scope.refreshScroll = function (scrollBottom, timeout) {
        $timeout(function () {
          scrollBottom = scrollBottom || $scope.scrollDown;
          viewScroll.resize();
          if (scrollBottom) {
            viewScroll.scrollBottom(true);
          }
          $scope.checkScroll();
        }, timeout || 1000);
      };

      $scope.checkScroll = function () {
        $timeout(function () {
          var currentTop = viewScroll.getScrollPosition().top;
          var maxScrollableDistanceFromTop = viewScroll.getScrollView().__maxScrollTop;
          console.log("maxScrollableDistanceFromTop",maxScrollableDistanceFromTop);
          $scope.scrollDown = (currentTop >= maxScrollableDistanceFromTop);
          $scope.$apply();
        }, 0);
        return true;
      };

      $ionicModal.fromTemplateUrl('views/chat/chatUserListModal.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.modal = modal;
      });
      $scope.closeModal = function () {
        $scope.modal.hide();
      }

      function readImage(input) {
        if ( input.files && input.files[0] ) {
          var FR= new FileReader();
          FR.onload = function(e) {
            var data = {
              type : "image",
              name : $rootScope.rootUser.displayName,
              imgUrl : e.target.result,
              uid : $rootScope.rootUser.userUid,
              sendRegDate : new Date()
            }
            $rootScope.socket.emit('user',data);
            $scope.data = data;
            writeText($scope.data,"user","image");
            console.log(e.target.result);
          };
          FR.readAsDataURL( input.files[0] );
        }
      }
      $("#imgTest").change(function () {
        readImage(this);
      });


      $scope.writeRecentlyChat = function (data) {
          var html = "";
          html += '<div id="scrollMove" style="background-color: #b2b2b2; width: 100%; height: 100%; position: absolute; opacity: 0.7;">';
          html += '<img id="chatUserImg" class="profile-pic left" src="'+ data.photoUrl + '" style="bottom: 4px; width: 34px; height: 34px"/>';
          html += '<div id="chatUserName" style="position: absolute; left: 12%; width: 87%; height: 50%; font-weight: bold; color: black; font-size: small">' + data.name + '</div>';
          html += '<div id="chatUserContent" style="position: absolute; left: 12%; top: 50%; width: 87%; height: 50%; color: black; text-overflow:ellipsis; white-space:nowrap; overflow:hidden">' + data.message + '</div>';
          html += '</div>';

          $("#recentlyChat").html(html);

          $("#scrollMove").click(function () {
            $ionicScrollDelegate.scrollBottom();
            $("#recentlyChat").html("");
          })
      }

/*      function viewChatMessage () {
        $ionicScrollDelegate.scrollBottom();
        $("#recentlyChat").html("");
      }*/
      $("#recentlyChat").css("height",$("#footerBar").css("height"));
      $("#recentlyChat").css("top","-" + $("#footerBar").css("height"));
      $scope.putPhoto = true;
      $scope.resize = function () {
        if($("#inputText").val() != "") {
          $scope.putPhoto = false;
        } else {
          $scope.putPhoto = true;
        }
        var obj = document.getElementById('inputText');
        obj.style.height = "1px";
        obj.style.height = (5+obj.scrollHeight) + "px";
        $("#footerBar").css("height",(19+obj.scrollHeight) + "px");
        console.log(20+obj.scrollHeight);
      }

      $scope.putImg = function () {
        var options = {
          quality : 75,
          destinationType : Camera.DestinationType.DATA_URL,
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit : true,
          encodingType : Camera.EncodingType.JPEG,
          targetWidth : 300,
          targetHeight : 300,
          popoverOptions : CameraPopoverOptions,
          saveToPhotoAlbum : false
        };
        navigator.camera.getPicture(function (imageDATA) {
          var data = {
            type : "image",
            name : $rootScope.rootUser.displayName,
            imgUrl : 'data:image/jpeg;base64,' + imageDATA,
            uid : $rootScope.rootUser.userUid,
            sendRegDate : new Date()
          }
          $rootScope.socket.emit('user',data);
          $scope.data = data;
          writeText($scope.data,"user","image");
        }, function (err) {

        }, options);
      };

      $rootScope.socket.on('getUserInfo', function (data) {
        $scope.userInfoList = data;
        $scope.userCount = data.length;
      });

      $rootScope.socket.on('outMsg', function (msg) {
        initList.innerHTML += "<div style='width: 100%; text-align: center'>" + msg.message + "</div>";
      });

      function getDate(writeDate) {
        console.log(writeDate);
        var wDate = new Date(writeDate);
        var now = new Date();
        var nTime = now.getTime() - wDate.getTime();
        var year = nTime/1000/60/60/24/365;
        var day = nTime/1000/60/60/24;
        var hour = nTime/1000/60/60;
        var mi = nTime/1000/60;
        if(year >= 1) {
          return parseInt(year) + "년전";
        }
        if (year == 0 && day >= 1) {
          return parseInt(day) + "일전";
        }
        if (day == 0 && hour >= 1) {
          return parseInt(hour) + "시간전";
        }
        if (hour == 0 && mi >= 1) {
          return parseInt(mi) + "분전";
        }
        return parseInt(mi) +"초전";
      }
})
