"use strict";

$(document).ready(function () {

  var prevSearchResults = [];
  var prevSearchLimits = new Object();
  var searchLimits = new Object();
  var markers = [];

  function initMap() {
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
    return map;
  }

  function noResultsAlert() {
    var alertContent = "\n    <div class=\"no-results-alert\">\n        <h1>Not Found!</h1>\n        <p>Looks like no meetings meet your search criteria.</p>\n    </div>\n    ";

    $('main').append(alertContent);

    var fadeOutAlert = window.setTimeout(function () {
      $('.no-results-alert').fadeOut(1500);
    }, 3000);
  }

  function filterMeetingResults(meetingData, searchLimits) {
    var filteredResults = [];

    for (var i = 0; i < meetingData.length; i++) {
      var currentMeeting = meetingData[i];

      if (currentMeeting.latitude && currentMeeting.longitude) {
        // must check that latitude & longitude are defined, otherwise Google Maps crashes
        var searchKeyCount = 0;

        for (var searchKey in searchLimits) {
          var searchValue = searchLimits[searchKey];
          var meetingValues = makeValuesArray(currentMeeting[searchKey]) || null;
          var trueValuePresent = false;

          for (var value in meetingValues) {
            var meetingValue = meetingValues[value];
            if (meetingValue && meetingValue === searchValue) {
              trueValuePresent = true;
              break;
            }
          }
          if (meetingValues && trueValuePresent) {
            searchKeyCount += 1;
          }
        }
        if (searchKeyCount >= Object.keys(searchLimits).length) {
          filteredResults.push(currentMeeting);
        }
      }
    }

    if (filteredResults.length > 0) {
      prevSearchResults = filteredResults;
      prevSearchLimits = searchLimits;
      return filteredResults;
    } else {
      noResultsAlert();
      restorePrevSearchLimits(searchLimits, prevSearchLimits);
      return prevSearchResults;
    }
  }

  function makeValuesArray(meetingValues) {
    var valuesArray = void 0;
    if (meetingValues) {
      valuesArray = meetingValues.split(',');
      for (var i = 0; i < valuesArray.length; i++) {
        valuesArray[i] = valuesArray[i].trim();
      }
    }
    return valuesArray;
  }

  function restorePrevSearchLimits(searchLimits, prevSearchLimits) {
    for (var limit in searchLimits) {
      if (prevSearchLimits[limit]) {
        $("#" + limit).val(prevSearchLimits[limit]);
      } else {
        $("#" + limit).val("none selected");
      }
    }
  }

  function populateMap(map, filteredMeetingResults, searchLimits) {
    // create boundaries of all markers
    var bounds = new google.maps.LatLngBounds();
    createMarkers(map, filteredMeetingResults, bounds);
    // zoom and center the map according to all markers placed
    map.fitBounds(bounds);
    var zoomChangeBoundsListener = google.maps.event.addListenerOnce(map, 'bounds_changed', function (event) {
      // make sure the zoom isn't too tight or wide
      if (this.getZoom() > 14) {
        this.setZoom(14);
      }
      if (this.getZoom() < 2) {
        this.setZoom(2);
      }
    });
  }

  function createMarkers(map, filteredMeetingResults, bounds) {

    if (filteredMeetingResults) {
      // remove previous markers from map
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
      // add new markers
      for (var _i = 0; _i < filteredMeetingResults.length; _i++) {
        var meetingInfo = filteredMeetingResults[_i];
        var lat = Number(filteredMeetingResults[_i].latitude);
        var lng = Number(filteredMeetingResults[_i].longitude);
        var branch = filteredMeetingResults[_i].worshipstyle;
        var icon = void 0;

        switch (branch) {
          case "Programmed":
            icon = "./images/programmed.png";
            break;
          case "Unprogrammed":
            icon = "./images/unprogrammed.png";
            break;
          case "Semi-programmed":
            icon = "./images/semiprogrammed.png";
            break;
          case "Programmed, Unprogrammed":
            icon = "./images/semiprogrammed.png";
            break;
          case "Semi-programmed, Unprogrammed":
            icon = "./images/semiprogrammed.png";
            break;
          default:
            icon = "./images/other.png";
        }

        var marker = new google.maps.Marker({
          position: { lat: lat, lng: lng },
          map: map,
          icon: icon
        });
        setMarkerInfoWindow(map, marker, meetingInfo);
        markers.push(marker);
        bounds.extend(markers[_i].getPosition()); // expand `bounds` according to the new marker
      }
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
    var windowContent = "\n    <h1 id='meeting-name'> " + meetingInfo.name + "</h1>\n      <h3>Address:</h3> <em>" + (meetingInfo.address || "") + " " + (meetingInfo.city || "") + ", " + (meetingInfo.state || "") + " " + (meetingInfo.zip || "") + "</em>\n      <h3>Contact:</h3> <em>" + (meetingInfo.email || "") + " " + (meetingInfo.phone || "") + "</em>\n      <h3>Yearly Meeting:</h3> <em>" + (meetingInfo.yearlymeeting || "not affiliated") + "</em>\n      <h3>Branch:</h3> <em>" + (meetingInfo.branch || "not affiliated") + "</em>\n      <h3>Worship Style:</h3> <em>" + (meetingInfo.worshipstyle || "not defined") + "</em>";

    google.maps.event.addListener(marker, 'click', function () {
      getInfoWindow().setContent(windowContent);
      getInfoWindow().open(map, this);
    });
  }

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

    var filteredMeetingResults = filterMeetingResults(meetingData, searchLimits);
    populateMap(map, filteredMeetingResults, searchLimits);
  });

  // on initial pageload
  var map = initMap();
  var meetingData;
  $.getJSON("./js/north-america-meetings.json", function (json) {
    meetingData = json;
    populateMap(map, meetingData, searchLimits);
  });
});