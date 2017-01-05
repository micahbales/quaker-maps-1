"use strict";

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
  var meetings = $.getJSON("./js/north-america-meetings.json", function (json) {
    var filteredMeetingResults = filterMeetingResults(json);
    createMarkers(map, filteredMeetingResults, bounds);
    map.fitBounds(bounds); // zoom and center the map according to all markers placed
  });
}

function filterMeetingResults(json) {
  var filteredMeetingResults = [];

  if (allCriteriaMustBeTrue) {
    for (var i = 0; i < json.length; i++) {
      var _currentMeeting = json[i];
      var allCriteriaAreTrue = true;

      for (var searchKey in searchLimits) {
        var searchValue = searchLimits[searchKey];
        var meetingValue = _currentMeeting[searchKey];

        if (meetingValue && !meetingValue.includes(searchValue)) {
          allCriteriaAreTrue = false;
        }
      }
      if (allCriteriaAreTrue) {
        allCriteriaAreTrue = true;
        filteredMeetingResults.push(_currentMeeting);
      }
    }
  } else {
    for (var _i = 0; _i < json.length; _i++) {
      var currentMeeting = json[_i];

      for (var searchKey in searchLimits) {
        var _searchValue = searchLimits[searchKey];
        var _meetingValue = currentMeeting[searchKey];

        if (_meetingValue && _meetingValue.includes(_searchValue)) {
          filteredMeetingResults.push(json[_i]);
        }
      }
    }
  }
  return filteredMeetingResults;
}

function createMarkers(map, filteredMeetingResults, bounds) {
  var markers = [];
  for (var i = 0; i < filteredMeetingResults.length; i++) {
    var meetingInfo = filteredMeetingResults[i];
    var lat = Number(filteredMeetingResults[i].latitude);
    var lng = Number(filteredMeetingResults[i].longitude);

    var marker = new google.maps.Marker({
      position: { lat: lat, lng: lng },
      map: map
    });
    setMarkerInfoWindow(map, marker, meetingInfo);
    markers.push(marker);
    bounds.extend(markers[i].getPosition()); // expand `bounds` according to the new marker
  }
};

function setMarkerInfoWindow(map, marker, meetingInfo) {
  var windowContent = "\n  <h1 id='meeting-name'> " + meetingInfo.name + "</h1>\n    <h3>Address:</h3> <em>" + (meetingInfo.address || "") + " " + (meetingInfo.city || "") + ", " + (meetingInfo.state || "") + " " + (meetingInfo.zip || "") + "</em>\n    <h3>Contact:</h3> <em>" + (meetingInfo.email || "") + " " + (meetingInfo.phone || "") + "</em>\n    <h3>Yearly Meeting:</h3> <em>" + (meetingInfo.yearlymeeting || "not affiliated") + "</em>\n    <h3>Branch:</h3> <em>" + (meetingInfo.branch || "not affiliated") + "</em>\n    <h3>Worship Style:</h3> <em>" + (meetingInfo.worshipstyle || "not defined") + "</em>";

  var infowindow = new google.maps.InfoWindow({
    content: windowContent
  });

  marker.addListener('click', function () {
    var currentInfoWindow = infowindow;
    currentInfoWindow.close(map);
    infowindow.open(map, marker);
  });
}

initMap();