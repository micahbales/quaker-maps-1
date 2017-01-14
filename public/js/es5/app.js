"use strict";

var allCriteriaMustBeTrue = true;
var searchLimits = new Object();

var infoWindow;

function getInfoWindow()	{
  if (infoWindow == null)	{
    infoWindow = new google.maps.InfoWindow({
      content: ""
    });
  }
  return infoWindow;
}

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'));
  populateMap(map);
}

function populateMap(map) {
  var bounds = new google.maps.LatLngBounds(); // create boundaries of all markers
  var meetings = $.getJSON("./js/north-america-meetings.json", function (meetingData) {
    var filteredMeetingResults = filterMeetingResults(meetingData);
    createMarkers(map, filteredMeetingResults, bounds);
    map.fitBounds(bounds); // zoom and center the map according to all markers placed
  });
}

function setSearchLimits(style, branch, state)  {
  searchLimits.worshipstyle = style || "";
  searchLimits.branch = branch || "";
  searchLimits.state = state || "";
  console.log(searchLimits);
}

/* The form data might have radio buttons or checkboxes (which in JS
 * are RadioNodeLists of HTMLInputElements), or select lists allowing
 * multiple options (HTMLSelectElements containing HTMLOptionElements);
 * they all behave similarly enough that it's just a matter of passing
 * in the appprpriate property to determine which ones have been
 * selected.
 */
function getSelectedOrChecked(collection, prop) {
  var items = [];
  for (var c = 0; c < collection.length; c++) {
      if (collection[c][prop]) {
        items.push(collection[c].value);
      }
  }
  return items;
}

function handleInput(formData) {
  var styleList = getSelectedOrChecked(formData.worshipstyle, "checked").join(", ");
  console.log(styleList);
  var branchList = getSelectedOrChecked(formData.branch, "checked").join(", ");
  console.log(branchList);
  var stateList = getSelectedOrChecked(formData.state, "selected").join(", ");
  console.log(stateList);

  setSearchLimits(styleList, branchList, stateList);
}

/* TODO: allow for more maximal search values (e.g., when state is "IL, IN") */
function filterMeetingResults(meetingData) {
  var filteredResults = [];

  for (var i = 0; i < meetingData.length; i++) {
    var currentMeeting = meetingData[i];
    var allCriteriaAreTrue = true;

    for (var searchKey in searchLimits) {
      var searchValue = searchLimits[searchKey];
      var meetingValue = currentMeeting[searchKey];

      if (meetingValue && !meetingValue.includes(searchValue)) {
        allCriteriaAreTrue = false;
      } else if (meetingValue && meetingValue.includes(searchValue) && !allCriteriaMustBeTrue) {
        filteredResults.push(currentMeeting);
      }
    }
    if (allCriteriaMustBeTrue && allCriteriaAreTrue) {
      allCriteriaAreTrue = true;
      filteredResults.push(currentMeeting);
    }
  }
  return filteredResults;
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

  google.maps.event.addListener(marker, 'click', function(){
    getInfoWindow().setContent(windowContent);
    getInfoWindow().open(map,this);
  });

}

initMap();
