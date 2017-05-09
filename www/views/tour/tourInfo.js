angular.module('App')
  .controller('TourInfoCtrl', function ($scope, $http, $ionicLoading, $compile, $ionicPlatform, $location, $ionicScrollDelegate, $ionicPosition, $cordovaGeolocation) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.keyboard) {
        cordova.plugin.keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

        $scope.mylocation = {
          lat: 0,
          long: 0,
        };

        $scope.mylocation.lat = 37.4943314;
        $scope.mylocation.long = 127.02780369999999;

        initialize();

        $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
          {
            params: {
              contentTypeId: 12,
              mapX: $scope.mylocation.long,
              mapY: $scope.mylocation.lat,
              radius: 2000,
              listYN: 'Y',
              MobileOS: 'ETC',
              MobileApp: "TourAPI3.0_Guide",
              arrange: 'A',
              numOfRows: 12,
              pageNo: '1'
            }
          }
        )
          .success(function (data) {
            $scope.mapList = data.response.body.items.item;
            drop($scope.mapList, $scope.map);

            // api 호출 데이터들과 나와의 거리 $scope.mapList에 추가
            $scope.distanceList = [];
            for (var i = 0; i < $scope.mapList.length; i++) {
              $scope.mapList[i].myDistance = computeDistance($scope.mylocation.long, $scope.mylocation.lat, $scope.mapList[i].mapx, $scope.mapList[i].mapy);
              if (!$scope.mapList[i].firstimage) {
                $scope.mapList[i].firstimage = "../../img/default-thumbnail.jpg";
              }
            }
            console.log("mapList", $scope.mapList);
          });
      // navigator.geolocation.getCurrentPosition(function (position) {
      //   $scope.mylocation = {
      //     lat: position.coords.latitude,
      //     long: position.coords.longitude
      //   }
      //
      //   // $scope.mylocation.long = 127.1596093;
      //   // $scope.mylocation.lat = 35.84977;
      //
      //   console.log($scope.mylocation.long, $scope.mylocation.lat);
      //
      //   initialize();
      //
      //   $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
      //     {
      //       params: {
      //         contentTypeId: 12,
      //         mapX: $scope.mylocation.long,
      //         mapY: $scope.mylocation.lat,
      //         radius: 2000,
      //         listYN: 'Y',
      //         MobileOS: 'ETC',
      //         MobileApp: "TourAPI3.0_Guide",
      //         arrange: 'A',
      //         numOfRows: 12,
      //         pageNo: '1'
      //       }
      //     }
      //   )
      //     .success(function (data) {
      //       $scope.mapList = data.response.body.items.item;
      //       drop($scope.mapList, $scope.map);
      //
      //       // api 호출 데이터들과 나와의 거리 $scope.mapList에 추가
      //       $scope.distanceList = [];
      //       for (var i = 0; i < $scope.mapList.length; i++) {
      //         $scope.mapList[i].myDistance = computeDistance($scope.mylocation.long, $scope.mylocation.lat, $scope.mapList[i].mapx, $scope.mapList[i].mapy);
      //         if (!$scope.mapList[i].firstimage) {
      //           $scope.mapList[i].firstimage = "../../img/default-thumbnail.jpg";
      //         }
      //       }
      //       console.log("mapList", $scope.mapList);
      //     })
      // });

      var map = null;

      // 처음 맵 만드는 함수
      function initialize() {
        var myLatlng = new google.maps.LatLng($scope.mylocation.lat, $scope.mylocation.long);
        var mapOptions = {
          center: myLatlng,
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        new google.maps.Marker({
          position: myLatlng,
          map: map,
          draggable: true
        });

        $scope.map = map;
      }


      var infowindow;
      // 마커 깃발로 만들고, 하나하나 차례 설정
      function addMarkerWithTimeout(mapList, timeout, map) {
        var myLatlng = new google.maps.LatLng(mapList.mapy, mapList.mapx);

        var image = {
          url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
          size: new google.maps.Size(20, 32),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(0, 32)
        };

        window.setTimeout(function () {
          var marker = new google.maps.Marker({
            position: myLatlng,
            icon: image,
            animation: google.maps.Animation.DROP
          });

          infowindow = new google.maps.InfoWindow();
          google.maps.event.addListener(marker, 'click', function () {
            infowindow.close();
            infowindow.setContent('<div><span style="font-size: 11px">' + mapList.title + '</span></div>');
            infowindow.open(map, marker);
            $("a[id^='map-item-']").removeClass('item-myactive');
            $("#map-item-" + mapList.contentid).addClass('item-myactive');

            // 포커스 방법 1
            $location.hash('map-item-' + mapList.contentid);
            $ionicScrollDelegate.anchorScroll();
            // 포커스 방법 2
            // $("#map-item-" + mapList.contentid).focus();
          });
          google.maps.event.addListener(map, 'click', function () {
            infowindow.close();
            $("a[id^='map-item-']").removeClass('item-myactive');
          });
          marker.setMap(map);
        }, timeout);
      }

      // 마커 차례로 떨어트리기
      function drop(mapList, map) {
        for (var i = 0; i < mapList.length; i++) {
          addMarkerWithTimeout(mapList[i], i * 200, map);
        }
      }

      // 출발지와 목적지 사이의 거리(km)
      function computeDistance(startx, starty, destx, desty) {
        var startLatRads = degreesToRadians(startx);
        var startLongRads = degreesToRadians(starty);
        var destLatRads = degreesToRadians(destx);
        var destLongRads = degreesToRadians(desty);

        var earthRadius = 6371;
        var distance = Math.acos(
            Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * earthRadius;
        return distance.toFixed(2);
      }

      function degreesToRadians(degrees) {
        var radians = (degrees * Math.PI) / 180;
        return radians;
      }
    });
  });
  //     $cordovaGeolocation.getCurrentPosition().then(function (data) {
  //       $http.get('https://maps.googleapis.com/maps/api/geocode/json', {params : {latlng: data.coords.latitude + ',' + data.coords.longitude}})
  //         .success(function (response) {
  //           $scope.location = {
  //             lat : data.coords.latitude,
  //             lang: data.coords.longitude,
  //             city: response.results[0].formatted_address,
  //             current: true
  //           };
  //
  //           // // 경주역
  //           $scope.location.lat = 35.8444002;
  //           $scope.location.lang = 129.2157566;
  //           // 광안대교
  //           // $scope.location.lat = 35.1476738
  //           // $scope.location.lang = 129.1278484;
  //           // 불국사
  //           $scope.location.lat = 35.7900971;
  //           $scope.location.lang = 129.3299037;
  //           // 불국사
  //           $scope.location.lat = 35.7900971;
  //           $scope.location.lang = 129.3299037;
  //
  //           initialize();
  //
  //           $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
  //             {params : {
  //               contentTypeId : 12,
  //               mapX : $scope.location.lang,
  //               mapY : $scope.location.lat,
  //               radius : 2000,
  //               listYN :'Y',
  //               MobileOS : 'ETC',
  //               MobileApp : "TourAPI3.0_Guide",
  //               arrange : 'A',
  //               numOfRows :  12,
  //               pageNo : '1'
  //             }}
  //           )
  //             .success(function (data) {
  //               $scope.mapList = data.response.body.items.item;
  //               drop($scope.mapList, $scope.map);
  //
  //               // api 호출 데이터들과 나와의 거리 $scope.mapList에 추가
  //               $scope.distanceList = [];
  //               for (var i = 0; i < $scope.mapList.length; i++) {
  //                 $scope.mapList[i].myDistance = computeDistance($scope.location.lang, $scope.location.lat, $scope.mapList[i].mapx, $scope.mapList[i].mapy);
  //                 if(!$scope.mapList[i].firstimage) {
  //                   $scope.mapList[i].firstimage = "../../img/default-thumbnail.jpg";
  //                 }
  //               }
  //               console.log($scope.mapList);
  //             })
  //         })
  //         .error(function () {
  //           alert("현재 위치를 몰라용");
  //         });
  //     })
  //   });
  //
  //   var map = null;
  //
  //   // 처음 맵 만드는 함수
  //   function initialize() {
  //     var myLatlng = new google.maps.LatLng($scope.location.lat, $scope.location.lang);
  //     var mapOptions = {
  //       center: myLatlng,
  //       zoom: 14,
  //       mapTypeId: google.maps.MapTypeId.ROADMAP
  //     };
  //     var map = new google.maps.Map(document.getElementById("map"), mapOptions);
  //
  //     new google.maps.Marker({
  //       position: myLatlng,
  //       map: map,
  //       draggable: true
  //     });
  //
  //     $scope.map = map;
  //   }
  //
  //   // 마커 깃발로 만들고, 하나하나 차례 설정
  //   function addMarkerWithTimeout(mapList, timeout, map) {
  //     var myLatlng = new google.maps.LatLng(mapList.mapy, mapList.mapx);
  //
  //     var image = {
  //       url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
  //       size: new google.maps.Size(20, 32),
  //       origin: new google.maps.Point(0, 0),
  //       anchor: new google.maps.Point(0, 32)
  //     };
  //
  //     window.setTimeout(function () {
  //       var marker = new google.maps.Marker({
  //         position: myLatlng,
  //         icon: image,
  //         animation: google.maps.Animation.DROP
  //       });
  //
  //       // <a href="https://www.youtube.com/watch?v=CxgELeHSkJA" target="_blank">
  //       // var distance = computeDistance($scope.location.lang, $scope.location.lat, mapList.mapx, mapList.mapy);
  //       // var contentString = '<div id="content" style="font-size: 12px"><a href="#" ng-click="modal.show()">' + mapList.title + '</a><br><span>나와의 거리 : ' + distance + 'km</span></div>';
  //       // var imgSrc = mapList.firstimage;
  //       // var contentString = '<div class="list"><a class="item item-thumbnail-left" href="#"><img src=imgSrc + ""><p>dd</p></a></div>';
  //       // var contentString = '<div><img src="' + mapList.firstimage + '" style="width: 100px; height: 75px"><br><span style="font-size: 11px">' + mapList.title + '</span></div>';
  //       var contentString = '<div><span style="font-size: 11px">' + mapList.title + '</span></div>';
  //       var infowindow = new google.maps.InfoWindow({
  //         content: contentString,
  //         maxWidth: 100
  //       });
  //       marker.addListener('click', function () {
  //         infowindow.open(map, marker);
  //         console.log(marker.getPosition());
  //         console.log(marker.getPosition().lat());
  //         console.log(marker.getPosition().lng());
  //         var mapItem = document.querySelector("#map-item");
  //         console.log(mapItem);
  //       });
  //       google.maps.event.addListener(map, 'click', function () {
  //         infowindow.close();
  //       });
  //       marker.setMap(map);
  //     }, timeout);
  //   }
  //
  //   // 마커 차례로 떨어트리기
  //   function drop(mapList, map) {
  //     for (var i = 0; i < mapList.length; i++) {
  //       addMarkerWithTimeout(mapList[i], i * 200, map);
  //     }
  //   }
  //
  //   // 출발지와 목적지 사이의 거리(km)
  //   function computeDistance(startx, starty, destx, desty) {
  //     var startLatRads = degreesToRadians(startx);
  //     var startLongRads = degreesToRadians(starty);
  //     var destLatRads = degreesToRadians(destx);
  //     var destLongRads = degreesToRadians(desty);
  //
  //     var earthRadius = 6371;
  //     var distance = Math.acos(
  //         Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * earthRadius;
  //     return distance.toFixed(2);
  //   }
  //
  //   function degreesToRadians(degrees) {
  //     var radians = (degrees * Math.PI) / 180;
  //     return radians;
  //   }
  //
  // });

/*  // 마커 만드는 함수
  function makeMarker(map, mapList) {
    var myLatlng = new google.maps.LatLng(mapList.mapy, mapList.mapx);
    /!*    var myIcon = {
/!*      path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',*!/
      path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
      fillColor: 'red',
      fillOpacity: 0.4,
      scale: 6,
      strokeColor: 'grey',
      strokeWeight: 1
    };*!/
    var image = {
/!*      url: 'https://maps.google.com/mapfiles/kml/shapes/info-i_maps.png',*!/
      url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
      size: new google.maps.Size(20, 32),
      origin: new google.maps.Point(0, 0),
/!*      anchor: new google.maps.Point(17, 34)*!/
      anchor: new google.maps.Point(0, 32)
/!*      scaledSize: new google.maps.Size(25, 25)*!/
    };

    var marker = new google.maps.Marker({
      position: myLatlng,
      icon: image,
      animation: google.maps.Animation.DROP
    });
>>>>>>> master

    });
  });
//     $cordovaGeolocation.getCurrentPosition().then(function (data) {
//       $http.get('https://maps.googleapis.com/maps/api/geocode/json', {params : {latlng: data.coords.latitude + ',' + data.coords.longitude}})
//         .success(function (response) {
//           $scope.location = {
//             lat : data.coords.latitude,
//             lang: data.coords.longitude,
//             city: response.results[0].formatted_address,
//             current: true
//           };
//
//           // // 경주역
//           $scope.location.lat = 35.8444002;
//           $scope.location.lang = 129.2157566;
//           // 광안대교
//           // $scope.location.lat = 35.1476738
//           // $scope.location.lang = 129.1278484;
//           // 불국사
//           $scope.location.lat = 35.7900971;
//           $scope.location.lang = 129.3299037;
//           // 불국사
//           $scope.location.lat = 35.7900971;
//           $scope.location.lang = 129.3299037;
//
//           initialize();
//
//           $http.get('http://api.visitkorea.or.kr/openapi/service/rest/KorService/locationBasedList?ServiceKey=3DmpkuLpruIBYk6zhr6YKNveBk7HgaAuFRZy54iH5nxxt23BRbs8yzfCdsp%2BYhTxwez01fmdHXwXiPP1WTMGag%3D%3D',
//             {params : {
//               contentTypeId : 12,
//               mapX : $scope.location.lang,
//               mapY : $scope.location.lat,
//               radius : 2000,
//               listYN :'Y',
//               MobileOS : 'ETC',
//               MobileApp : "TourAPI3.0_Guide",
//               arrange : 'A',
//               numOfRows :  12,
//               pageNo : '1'
//             }}
//           )
//             .success(function (data) {
//               $scope.mapList = data.response.body.items.item;
//               drop($scope.mapList, $scope.map);
//
//               // api 호출 데이터들과 나와의 거리 $scope.mapList에 추가
//               $scope.distanceList = [];
//               for (var i = 0; i < $scope.mapList.length; i++) {
//                 $scope.mapList[i].myDistance = computeDistance($scope.location.lang, $scope.location.lat, $scope.mapList[i].mapx, $scope.mapList[i].mapy);
//                 if(!$scope.mapList[i].firstimage) {
//                   $scope.mapList[i].firstimage = "../../img/default-thumbnail.jpg";
//                 }
//               }
//               console.log($scope.mapList);
//             })
//         })
//         .error(function () {
//           alert("현재 위치를 몰라용");
//         });
//     })
//   });
//
//   var map = null;
//
//   // 처음 맵 만드는 함수
//   function initialize() {
//     var myLatlng = new google.maps.LatLng($scope.location.lat, $scope.location.lang);
//     var mapOptions = {
//       center: myLatlng,
//       zoom: 14,
//       mapTypeId: google.maps.MapTypeId.ROADMAP
//     };
//     var map = new google.maps.Map(document.getElementById("map"), mapOptions);
//
//     new google.maps.Marker({
//       position: myLatlng,
//       map: map,
//       draggable: true
//     });
//
//     $scope.map = map;
//   }
//
//   // 마커 깃발로 만들고, 하나하나 차례 설정
//   function addMarkerWithTimeout(mapList, timeout, map) {
//     var myLatlng = new google.maps.LatLng(mapList.mapy, mapList.mapx);
//
//     var image = {
//       url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
//       size: new google.maps.Size(20, 32),
//       origin: new google.maps.Point(0, 0),
//       anchor: new google.maps.Point(0, 32)
//     };
//
//     window.setTimeout(function () {
//       var marker = new google.maps.Marker({
//         position: myLatlng,
//         icon: image,
//         animation: google.maps.Animation.DROP
//       });
//
//       // <a href="https://www.youtube.com/watch?v=CxgELeHSkJA" target="_blank">
//       // var distance = computeDistance($scope.location.lang, $scope.location.lat, mapList.mapx, mapList.mapy);
//       // var contentString = '<div id="content" style="font-size: 12px"><a href="#" ng-click="modal.show()">' + mapList.title + '</a><br><span>나와의 거리 : ' + distance + 'km</span></div>';
//       // var imgSrc = mapList.firstimage;
//       // var contentString = '<div class="list"><a class="item item-thumbnail-left" href="#"><img src=imgSrc + ""><p>dd</p></a></div>';
//       // var contentString = '<div><img src="' + mapList.firstimage + '" style="width: 100px; height: 75px"><br><span style="font-size: 11px">' + mapList.title + '</span></div>';
//       var contentString = '<div><span style="font-size: 11px">' + mapList.title + '</span></div>';
//       var infowindow = new google.maps.InfoWindow({
//         content: contentString,
//         maxWidth: 100
//       });
//       marker.addListener('click', function () {
//         infowindow.open(map, marker);
//         console.log(marker.getPosition());
//         console.log(marker.getPosition().lat());
//         console.log(marker.getPosition().lng());
//         var mapItem = document.querySelector("#map-item");
//         console.log(mapItem);
//       });
//       google.maps.event.addListener(map, 'click', function () {
//         infowindow.close();
//       });
//       marker.setMap(map);
//     }, timeout);
//   }
//
//   // 마커 차례로 떨어트리기
//   function drop(mapList, map) {
//     for (var i = 0; i < mapList.length; i++) {
//       addMarkerWithTimeout(mapList[i], i * 200, map);
//     }
//   }
//
//   // 출발지와 목적지 사이의 거리(km)
//   function computeDistance(startx, starty, destx, desty) {
//     var startLatRads = degreesToRadians(startx);
//     var startLongRads = degreesToRadians(starty);
//     var destLatRads = degreesToRadians(destx);
//     var destLongRads = degreesToRadians(desty);
//
//     var earthRadius = 6371;
//     var distance = Math.acos(
//         Math.sin(startLatRads) * Math.sin(destLatRads) + Math.cos(startLatRads) * Math.cos(destLatRads) * Math.cos(startLongRads - destLongRads)) * earthRadius;
//     return distance.toFixed(2);
//   }
//
//   function degreesToRadians(degrees) {
//     var radians = (degrees * Math.PI) / 180;
//     return radians;
//   }
//
// });

/*  // 마커 만드는 함수
 function makeMarker(map, mapList) {
 var myLatlng = new google.maps.LatLng(mapList.mapy, mapList.mapx);
 /!*    var myIcon = {
 /!*      path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',*!/
 path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
 fillColor: 'red',
 fillOpacity: 0.4,
 scale: 6,
 strokeColor: 'grey',
 strokeWeight: 1
 };*!/
 var image = {
 /!*      url: 'https://maps.google.com/mapfiles/kml/shapes/info-i_maps.png',*!/
 url: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
 size: new google.maps.Size(20, 32),
 origin: new google.maps.Point(0, 0),
 /!*      anchor: new google.maps.Point(17, 34)*!/
 anchor: new google.maps.Point(0, 32)
 /!*      scaledSize: new google.maps.Size(25, 25)*!/
 };

 var marker = new google.maps.Marker({
 position: myLatlng,
 icon: image,
 animation: google.maps.Animation.DROP
 });

 var contentString = '<div id="content"><span>' + mapList.title + '</span></div>';
 var infowindow = new google.maps.InfoWindow({
 content: contentString
 });
 marker.addListener('click', function () {
 infowindow.open(map, marker);
 });

 // To add the marker to the map, call setMap();
 marker.setMap(map);
 }*/














//
// $scope.centerOnMe = function() {
//   if(!$scope.map) {
//     return;
//   }
//
//   $scope.loading = $ionicLoading.show({
//     content: 'Getting current location...',
//     showBackdrop: false
//   });
//
//   navigator.geolocation.getCurrentPosition(function(pos) {
//     $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
//     $scope.loading.hide();
//   }, function(error) {
//     alert('Unable to get location: ' + error.message);
//   });
// };
