// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova','ng-mfb'])


.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('map', {
    url: '/',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  });

  $urlRouterProvider.otherwise("/");

})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $ionicLoading, $cordovaSms) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  $scope.name = 'World';
  $scope.menuState = 'closed';
//sujeet
  var marker = [];
  var infowindow = new google.maps.InfoWindow({size: new google.maps.Size(150,50)});
  var services;
  var request;
  var map,latLng;
  var pos1 = {lat:0,lng:0};
  var markers = [];
  var autocomplete;
  var hospital_details =[];
  var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
  var hostnameRegexp = new RegExp('^https?://.+?/');

  //comment when using ionic serve
      $ionicLoading.show({
          template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring your location!'
      });

  $cordovaGeolocation.getCurrentPosition(options).then(function(position)
  {

     latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    //var latLng = new google.maps.LatLng(12.8379176,77.6390923);
    var mapOptions = {
      center: latLng,
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

        marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng
    });

     infoWindow = new google.maps.InfoWindow({
        content: "Here I am!"
    });


    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open($scope.map, marker);

    });
    $ionicLoading.hide();
    search();
  });


//===========search places start==============
services = new google.maps.places.PlacesService($scope.map);
function search() {

  var search = {
    bounds: $scope.map.getBounds(),
    types: ['hospital']
  };

  services.nearbySearch(search, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
     clearResults();
     clearMarkers();
      // Create a marker for each hotel found, and
      // assign a letter of the alphabetic to each marker icon.


      for (var i = 0; i < results.length; i++) {
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';

        // Use marker animation to drop the icons incrementally on the map.
        markers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });
        // If the user clicks a hotel marker, show the details of that hotel
        // in an info window.
        markers[i].placeResult = results[i];
//console.log(results[i]);
        services.getDetails({placeId: markers[i].placeResult.place_id},
            function(place, status) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                hospital_details.hospital_name = place.name;
                hospital_details.hospital_phone = place.formatted_phone_number;
                //console.log(hospital_details);

              }

        });

        google.maps.event.addListener(markers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
      }
    }
  });
}


function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

function dropMarker(i) {
  return function() {
    markers[i].setMap($scope.map);
  };
}


function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
  var marker = this;
  services.getDetails({placeId: marker.placeResult.place_id},
      function(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          var contentStr = '<h5>'+place.name+'</h5><p>'+place.vicinity;
          if (!!place.formatted_phone_number) contentStr += '<br>'+place.formatted_phone_number;
          infowindow.setContent(contentStr);
          infowindow.open($scope.map,marker);
        }
        else {
        var contentStr = "<h5>No Result, status="+status+"</h5>";
        infowindow.setContent(contentStr);
        infowindow.open($scope.map,marker);
      }
  });
}

//==========serch places end=================

  }, function(error){
    console.log("Could not get location");
  });

//console.log("before clicked send sms");
//send sms function
  $scope.sendsms = function() {

    var msg = "Please help me. Need emergency assistance. My Current location is https://www.google.co.in/maps/@" + latLng;
    console.log(msg);
    var options = {
      replaceLineBreaks: false, // true to replace \n by a new line, false by default
      android: {
        intent: '' // send SMS with the native android SMS messaging
          //intent: '' // send SMS without open any other app
          //intent: 'INTENT' // send SMS inside a default SMS app
      }
    };

    $cordovaSms
      .send('7022618862', msg , options)
      .then(function() {
        alert('Success');
        // Success! SMS was sent
      }, function(error) {
        alert('Error');
        // An error occurred
      });

  }

})

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})
