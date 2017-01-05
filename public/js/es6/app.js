var allCriteriaMustBeTrue = true;
var searchLimits = new Object();
searchLimits.worshipstyle = "Semi-programmed";
searchLimits.city = "Richmond";

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  populateMap(map);
}

function populateMap(map) {
  var bounds = new google.maps.LatLngBounds(); // create boundaries of all markers
  var meetings = $.getJSON("./js/north-america-meetings.json", (json) => {
    var filteredMeetingResults = filterMeetingResults(json);
    createMarkers(map, filteredMeetingResults, bounds);
    map.fitBounds(bounds); // zoom and center the map according to all markers placed
  });
}

function filterMeetingResults(json) {
  let filteredMeetingResults = [];

  if (allCriteriaMustBeTrue) {
    for (let i = 0; i < json.length; i++) {
      let currentMeeting = json[i];
      let allCriteriaAreTrue = true;

      for (var searchKey in searchLimits) {
        var searchValue = searchLimits[searchKey];
        var meetingValue = currentMeeting[searchKey];

        if (meetingValue && !meetingValue.includes(searchValue)) {
          allCriteriaAreTrue = false;
        }
      }
      if (allCriteriaAreTrue) {
        allCriteriaAreTrue = true;
        filteredMeetingResults.push(currentMeeting);
      }
    }
  } else {
    for (let i = 0; i < json.length; i++) {
      var currentMeeting = json[i];

      for (var searchKey in searchLimits) {
        let searchValue = searchLimits[searchKey];
        let meetingValue = currentMeeting[searchKey];

        if (meetingValue && meetingValue.includes(searchValue)) {
          filteredMeetingResults.push(json[i]);
        }
      }
    }
  }
  return filteredMeetingResults;
}

function createMarkers(map, filteredMeetingResults, bounds) {
  var markers = [];
  for (let i = 0; i < filteredMeetingResults.length; i++) {
    let meetingInfo = filteredMeetingResults[i];
    let lat = Number(filteredMeetingResults[i].latitude);
    let lng = Number(filteredMeetingResults[i].longitude);

    let marker = new google.maps.Marker({
      position: {lat: lat, lng: lng},
      map: map
    });
    setMarkerInfoWindow(map, marker, meetingInfo);
    markers.push(marker);
    bounds.extend(markers[i].getPosition()); // expand `bounds` according to the new marker
  }
};

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
