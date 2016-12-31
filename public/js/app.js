// grab coordinate from geolocation and plug them into initMap

function loadMapGeolocation(pos) {
  var crd = pos.coords;
  var lng = crd.longitude;
  var lat = crd.latitude;

  initMap(lng, lat);
};

// if there is an error with geolocation

function geolocationError(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};

// otherwise, create the map to be displayed

function initMap(userLng, userLat) {
  var userLocation = {lat: userLat, lng: userLng};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: userLocation || {lat: 38.890102, lng: -76.930355} // defaults to washington, dc
  });
  placeMarkers(map, userLng, userLat);
}

// and place markers when initMap is triggered

function placeMarkers(map, lng, lat) {
  var marker = new google.maps.Marker({
    position: {lat: lat, lng: lng},
    map: map
  });
};

// get user geolocation and execute the above code

if (navigator.geolocation) {
  var getUserLocation = (function() {
    navigator.geolocation.getCurrentPosition(loadMapGeolocation, geolocationError);
  })();
} else {
  console.log('no geolocation');
}
