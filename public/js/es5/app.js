"use strict";

function initMap() {
  var searchLimits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : searchLimits || new Object();
  var allCriteriaMustBeTrue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : allCriteriaMustBeTrue || true;

  // set custom map styles
  var mapStyles = [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#444444" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f2f2f2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#46bcec" }, { "visibility": "on" }] }];
  var styledMap = new google.maps.StyledMapType(mapStyles, { name: "QuakerMaps" });
  // create new map with custom controls
  var map = new google.maps.Map(document.getElementById('map'), {
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  });
  // assign custom styles to new map
  map.mapTypes.set('styled_map', styledMap);
  map.setMapTypeId('styled_map');
  populateMap(map, searchLimits, allCriteriaMustBeTrue);
}

function populateMap(map, searchLimits, allCriteriaMustBeTrue) {
  var bounds = new google.maps.LatLngBounds(); // create boundaries of all markers
  var meetings = $.getJSON("./js/north-america-meetings.json", function (meetingData) {
    var filteredMeetingResults = filterMeetingResults(meetingData, searchLimits, allCriteriaMustBeTrue);
    createMarkers(map, filteredMeetingResults, bounds);
    map.fitBounds(bounds); // zoom and center the map according to all markers placed
  });
}

function filterMeetingResults(meetingData, searchLimits, allCriteriaMustBeTrue) {
  var filteredResults = [];

  for (var i = 0; i < meetingData.length; i++) {
    var currentMeeting = meetingData[i];
    var allCriteriaAreTrue = true;

    if (currentMeeting.latitude && currentMeeting.longitude) {
      // must check that latitude & longitude are defined, otherwise Google Maps crashes
      for (var searchKey in searchLimits) {
        var searchValue = searchLimits[searchKey];
        var meetingValue = currentMeeting[searchKey];
        if (!meetingValue || !meetingValue.includes(searchValue)) {
          allCriteriaAreTrue = false;
        } else if (!allCriteriaMustBeTrue && meetingValue && meetingValue.includes(searchValue)) {
          filteredResults.push(currentMeeting);
        }
      }
      if (allCriteriaMustBeTrue && allCriteriaAreTrue) {
        filteredResults.push(currentMeeting);
      }
    }
  }
  if (filteredResults.length > 0) {
    return filteredResults;
  } else {
    alert('There are no meetings matching these criteria. Please try using different search criteria.');
    initMap();
  }
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

// so that only one infowindow may be open at a time
var infoWindow;
function getInfoWindow() {
  if (infoWindow == null) {
    infoWindow = new google.maps.InfoWindow({
      content: ""
    });
  }
  return infoWindow;
}

function setMarkerInfoWindow(map, marker, meetingInfo) {
  var windowContent = "\n  <h1 id='meeting-name'> " + meetingInfo.name + "</h1>\n    <h3>Address:</h3> <em>" + (meetingInfo.address || "") + " " + (meetingInfo.city || "") + ", " + (meetingInfo.state || "") + " " + (meetingInfo.zip || "") + "</em>\n    <h3>Contact:</h3> <em>" + (meetingInfo.email || "") + " " + (meetingInfo.phone || "") + "</em>\n    <h3>Yearly Meeting:</h3> <em>" + (meetingInfo.yearlymeeting || "not affiliated") + "</em>\n    <h3>Branch:</h3> <em>" + (meetingInfo.branch || "not affiliated") + "</em>\n    <h3>Worship Style:</h3> <em>" + (meetingInfo.worshipstyle || "not defined") + "</em>";

  google.maps.event.addListener(marker, 'click', function () {
    getInfoWindow().setContent(windowContent);
    getInfoWindow().open(map, this);
  });
}

$(document).ready(function () {
  initMap();
});

$('.search-button').on('click', function (e) {
  e.preventDefault();

  var searchLimits = {
    "state": $('#state').val(),
    "worshipstyle": $('#worshipstyle').val(),
    "branch": $('#branch').val(),
    "yearlymeeting": $('#yearlymeeting').val()
  };

  function processSearchLimits(searchLimits) {
    for (var key in searchLimits) {
      if (searchLimits[key] === "none selected") {
        delete searchLimits[key];
      }
    }
    return searchLimits;
  }

  searchLimits = processSearchLimits(searchLimits);

  initMap(searchLimits);
});