function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: {lat: 48.21158, lng: -99.59531} // defaults to geographical center of north america
  });
  placeMarkers(map);
}

function placeMarkers(map) {
  var meetings = $.getJSON("./js/north-america-meetings.json", (json) => {
  var markers = [];

    for (let i = 0; i < json.length; i++) {

      let lat = Number(json[i].latitude);
      let lng = Number(json[i].longitude);

      let marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map
      });
      markers.push(marker);
      console.log(`Marker${i} latitude: ${markers[i].position.lat()}`);
      console.log(`Marker${i} longitude: ${markers[i].position.lat()}`);
    }
  });
};

initMap();
