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
    zoom: 4,
    center: userLocation || {lat: 48.21158, lng: -99.59531} // defaults to geographical center of north america
  });
  placeMarkers(map);
}

// and place markers when initMap is triggered

function placeMarkers(map) {
  var meetings = $.getJSON("./js/north-america-meetings.json", (json) => {

    for (let i = 0; i < json.length; i++) {

      let lat = Number(json[i].latitude);
      let lng = Number(json[i].longitude);

      var marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
      });
    }
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
