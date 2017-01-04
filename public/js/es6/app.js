function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  populateMap(map);
}

function populateMap(map) {
  var bounds = new google.maps.LatLngBounds(); // create boundaries of all markers
  var meetings = $.getJSON("./js/north-america-meetings.json", (json) => {
  var key = "yearlymeeting";
  var value = "Great Plains YM"
  var filteredMeetings = filterMeetingResults(json, key, value);
  createMarkers(map, filteredMeetings, bounds);
  map.fitBounds(bounds); // zoom and center the map according to all markers placed
});

function filterMeetingResults(json, key, value) {
  let filteredMeetings = [];
  for (let i = 0; i < json.length; i++) {
    if (json[i][key] === value) {
      filteredMeetings.push(json[i]);
    }
  }
  return filteredMeetings;
}

function createMarkers(map, json, bounds) {
  var markers = [];
    for (let i = 0; i < json.length; i++) {
      let meetingInfo = json[i];
      let lat = Number(json[i].latitude);
      let lng = Number(json[i].longitude);

      let marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
      });
      setMarkerInfoWindow(map, marker, meetingInfo);
      markers.push(marker);
      bounds.extend(markers[i].getPosition()); // expand `bounds` according to the new marker
    }
  };
}

function setMarkerInfoWindow(map, marker, meetingInfo) {
  let windowContent = `
  <h1 id='meeting-name'> ${meetingInfo.name}</h1>
    <h3>Address:</h3> <em>${meetingInfo.address || ""} ${meetingInfo.city || ""}, ${meetingInfo.state || ""} ${meetingInfo.zip || ""}</em>
    <h3>Contact:</h3> <em>${meetingInfo.email || ""} ${meetingInfo.phone || ""}</em>
    <h3>Yearly Meeting:</h3> <em>${meetingInfo.yearlymeeting || "not affiliated"}</em>
    <h3>Branch:</h3> <em>${meetingInfo.branch || "not affiliated"}</em>
    <h3>Worship Style:</h3> <em>${meetingInfo.worshipstyle || "not defined"}</em>`

  var infowindow = new google.maps.InfoWindow({
    content: windowContent
  });

  marker.addListener('click', () => {
    let currentInfoWindow = infowindow;
    currentInfoWindow.close(map);
    infowindow.open(map, marker);
  });
}

initMap();
