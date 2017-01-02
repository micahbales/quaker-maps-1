function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  placeMarkers(map);
}

function placeMarkers(map) {
  var bounds = new google.maps.LatLngBounds(); // create boundaries of all markers
  var meetings = $.getJSON("./js/north-america-meetings.json", (json) => {
  createMarkers(map, json, bounds);
  map.fitBounds(bounds); // zoom and center the map according to all markers placed
});

function createMarkers(map, json, bounds) {
  var markers = [];
    for (let i = 0; i < json.length; i++) {
      let lat = Number(json[i].latitude);
      let lng = Number(json[i].longitude);

      let marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
      });
      setMarkerInfoWindow(map, marker, json[i]);
      markers.push(marker);
      bounds.extend(markers[i].getPosition()); // expand `bounds` according to the new marker
    }
  };
}

function setMarkerInfoWindow(map, marker, meetingInfo) {
  let windowContent = `
  <h1 id='meeting-name'> ${meetingInfo.name}</h1>
    <h3>Address:</h3> <em>${meetingInfo.address} ${meetingInfo.city}, ${meetingInfo.state} ${meetingInfo.zip}</em>
    <h3>Contact:</h3> <em>${meetingInfo.email} ${meetingInfo.phone}</em>
    <h3>Yearly Meeting:</h3> <em>${meetingInfo.yearlymeeting}</em>
    <h3>Branch:</h3> <em>${meetingInfo.branch}</em>
    <h3>Worship Style:</h3> <em>${meetingInfo.worshipstyle}</em>`
  var infowindow = new google.maps.InfoWindow({
    content: windowContent
  });

  marker.addListener('click', function() {
    infowindow.open(map, marker);
  });
}

initMap();
