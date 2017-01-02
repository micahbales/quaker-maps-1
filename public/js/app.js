function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  placeMarkers(map);
}

function placeMarkers(map) {
  var bounds = new google.maps.LatLngBounds(); // create boundaries of all markers
  var meetings = $.getJSON("./js/north-america-meetings.json", (json) => {
  createMarkers(json, bounds);
  map.fitBounds(bounds); // zoom and center the map according to all markers placed
});

function createMarkers(json, bounds) {
  var markers = [];
    for (let i = 0; i < json.length; i++) {
      let lat = Number(json[i].latitude);
      let lng = Number(json[i].longitude);

      let marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
      });
      markers.push(marker);
      bounds.extend(markers[i].getPosition()); // expand `bounds` according to the new marker
      console.log(`Marker${i} latitude: ${markers[i].position.lat()}`);
      console.log(`Marker${i} longitude: ${markers[i].position.lat()}`);
    }
  };
}

initMap();
