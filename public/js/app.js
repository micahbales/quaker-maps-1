mapboxgl.accessToken = 'pk.eyJ1IjoibWljYWhiYWxlcyIsImEiOiJjaXg4OTlrNHgwMDAyMnlvNDRleXBrdGNrIn0.d3eUGWL--AriB6n5MXy5TA';

function newMap(pos) {
  let crd = pos.coords;
  let long = crd.longitude;
  let lat = crd.latitude;

  var map = new mapboxgl.Map({
      container: 'map', // container id
      style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
      center: [long, lat], // starting position
      zoom: 15 // starting zoom
  });
}

function error(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
};

function initializeMap() {
  navigator.geolocation.getCurrentPosition(newMap, error); // use geolocation to set map's center
}

initializeMap();
