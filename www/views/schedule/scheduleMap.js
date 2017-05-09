/**
 * Created by Bitcamp on 2016-11-11.
 */
angular.module('App')
.controller('scheduleMapCtrl', function ($scope, $http, $rootScope) {
  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
    viewData.enableBack = true;
  });

  console.log($rootScope.getScheduleLocation);

  // 처음 맵 만드는 함수
  var infowindow;
  var markers = [];
  var map;
  var labels = '123456789';

  var labelIndex = 0;
  function initMap() {
    var myLatlng = new google.maps.LatLng(37.4963799255, 127.0265547405);
    var mapOptions = {
      center: myLatlng,
      zoom: 8
    };

    map = new google.maps.Map(document.getElementById("locationInfoMap"), mapOptions);

    var locationInfos = [];
    for (var i = 0; i < $rootScope.getScheduleLocation.length; i++) {
      var locationInfo = {
        lat : 0.0,
        lng : 0.0
      }
      locationInfo.lat = $rootScope.getScheduleLocation[i].mapY;
      locationInfo.lng = $rootScope.getScheduleLocation[i].mapX;
      locationInfos.push(locationInfo);
    }

    console.log(locationInfos);

    var flightPath = new google.maps.Polyline({
      path: locationInfos,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    flightPath.setMap(map);
    $scope.map = map;
  }
  initMap();
  drop();
  function drop() {
    clearMarkers();
    for (var i = 0; i < $rootScope.getScheduleLocation.length; i++) {
      addMarkerWithTimeout($rootScope.getScheduleLocation[i], i * 200);
    }
  }
  function addMarkerWithTimeout(position, timeout) {
    var locationPosition = {
      lat : position.mapY,
      lng : position.mapX
    }
    window.setTimeout(function() {
     var marker = new google.maps.Marker({
        position: locationPosition,
        map: map,
        animation: google.maps.Animation.DROP,
        label: labels[labelIndex++ % labels.length],
        title : position.title
      });

      markers.push(marker);
      var content = '<a style="text-decoration: none; font-weight: bold" href="#/detailSchedule/mapLocation/' + $rootScope.dSchedule.recordNo + '/' + position.contentCode + '">' + position.title + '</a>';
      console.log(content);
      infowindow = new google.maps.InfoWindow();
      marker.addListener('click',function () {
        infowindow.close();
        infowindow.setContent(content);
        infowindow.open(map, marker);
      })
    }, timeout);
  }

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
    markers = [];
  }

})
