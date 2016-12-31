function success(pos) {
  var crd = pos.coords;
  var lng = crd.longitude;
  var lat = crd.latitude;

  console.log('Your current position is:');
  console.log('Latitude : ' + crd.latitude);
  console.log('Longitude: ' + crd.longitude);
  console.log('More or less ' + crd.accuracy + ' meters.');

  initMap(lng, lat);
};

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};

function initMap(userLng, userLat) {
  var userLocation = {lat: userLat, lng: userLng};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: userLocation || {lat: 38.890102, lng: -76.930355}
  });
  var marker = new google.maps.Marker({
    position: userLocation,
    map: map
  });
}

if (navigator.geolocation) {
  var getUserLocation = (function() {
    navigator.geolocation.getCurrentPosition(success, error);
  })();
} else {
  console.log('no geolocation');
}
