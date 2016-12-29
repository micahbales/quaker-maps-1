mapboxgl.accessToken = 'pk.eyJ1IjoibWljYWhiYWxlcyIsImEiOiJjaXg4OTlrNHgwMDAyMnlvNDRleXBrdGNrIn0.d3eUGWL--AriB6n5MXy5TA';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v9', //stylesheet location
    center: [-76.930355, 38.890102], // starting position
    zoom: 15 // starting zoom
});
