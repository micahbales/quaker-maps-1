$(document).ready(function(){

  var prevSearchResults = [];
  var prevSearchLimits = new Object();
  var searchLimits = new Object();
  var allCriteriaMustBeTrue = true;
  var markers = [];

  function initMap() {
    // set custom map styles
    let mapStyles = [{"featureType":"administrative","elementType":"labels.text.fill","stylers":[{"color":"#444444"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]}];
    let styledMap = new google.maps.StyledMapType(mapStyles, {name : "QuakerMaps"});
    // create new map with custom controls
    let map = new google.maps.Map(document.getElementById('map'), {
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
    let alertContent = `
    <div class="no-results-alert">
        <h1>Not Found!</h1>
        <p>Looks like no meetings meet your search criteria.</p>
    </div>
    `

    $('main').append(alertContent);

    let fadeOutAlert = window.setTimeout(function(){
      $('.no-results-alert').fadeOut(1500);
    }, 3000);
  }

  function filterMeetingResults(meetingData, searchLimits, allCriteriaMustBeTrue) {
    let filteredResults = [];

    for (let i = 0; i < meetingData.length; i++) {
      let currentMeeting = meetingData[i];
      let allCriteriaAreTrue = true;

      if (currentMeeting.latitude && currentMeeting.longitude) { // must check that latitude & longitude are defined, otherwise Google Maps crashes
        for (let searchKey in searchLimits) {
          let searchValue = searchLimits[searchKey];
          let meetingValue = currentMeeting[searchKey];

          if (!meetingValue || !(meetingValue === searchValue)) {
            allCriteriaAreTrue = false;
          } else if (!allCriteriaMustBeTrue && meetingValue && meetingValue === searchValue) {
            filteredResults.push(currentMeeting);
          }
        }
        if (allCriteriaMustBeTrue && allCriteriaAreTrue) {
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

  function restorePrevSearchLimits(searchLimits, prevSearchLimits) {
    for (let limit in searchLimits) {
      if (prevSearchLimits[limit]) {
        $(`#${limit}`).val(prevSearchLimits[limit]);
      } else {
        $(`#${limit}`).val("none selected");
      }
    }
  }

  function populateMap(map, filteredMeetingResults, searchLimits, allCriteriaMustBeTrue) {
    // create boundaries of all markers
    let bounds = new google.maps.LatLngBounds();
    createMarkers(map, filteredMeetingResults, bounds);
    // zoom and center the map according to all markers placed
    map.fitBounds(bounds);
    let zoomChangeBoundsListener = google.maps.event.addListenerOnce(map, 'bounds_changed', function(event) {
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
      for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
      }
      markers = [];
      // add new markers
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
    }
  };

  // so that only one infowindow may be open at a time
  var infoWindow;
  function getInfoWindow()	{
    if (infoWindow == null)	{
      infoWindow = new google.maps.InfoWindow({
        content: ""
      });
    }
    return infoWindow;
  }

  function setMarkerInfoWindow(map, marker, meetingInfo) {
    let windowContent = `
    <h1 id='meeting-name'> ${meetingInfo.name}</h1>
      <h3>Address:</h3> <em>${meetingInfo.address || ""} ${meetingInfo.city || ""}, ${meetingInfo.state || ""} ${meetingInfo.zip || ""}</em>
      <h3>Contact:</h3> <em>${meetingInfo.email || ""} ${meetingInfo.phone || ""}</em>
      <h3>Yearly Meeting:</h3> <em>${meetingInfo.yearlymeeting || "not affiliated"}</em>
      <h3>Branch:</h3> <em>${meetingInfo.branch || "not affiliated"}</em>
      <h3>Worship Style:</h3> <em>${meetingInfo.worshipstyle || "not defined"}</em>`

    google.maps.event.addListener(marker, 'click', function(){
      getInfoWindow().setContent(windowContent);
      getInfoWindow().open(map,this);
    });
  }

  $('.search-button').on('click', function(e) {
    e.preventDefault();

    let searchLimits = {
      "state": $('#state').val(),
      "worshipstyle": $('#worshipstyle').val(),
      "branch": $('#branch').val(),
      "yearlymeeting": $('#yearlymeeting').val()
    }

    function processSearchLimits(searchLimits) {
      for (let key in searchLimits) {
        if (searchLimits[key] === "none selected") {
          delete searchLimits[key];
        }
      }
      return searchLimits;
    }

    searchLimits = processSearchLimits(searchLimits);

    let filteredMeetingResults = filterMeetingResults(meetingData, searchLimits, allCriteriaMustBeTrue);
    populateMap(map, filteredMeetingResults, searchLimits, allCriteriaMustBeTrue);

  });

  // on initial pageload
  const map = initMap();
  var meetingData;
  $.getJSON("./js/north-america-meetings.json", (json) => {
    meetingData = json;
    populateMap(map, meetingData, searchLimits, allCriteriaMustBeTrue);
  });

});
