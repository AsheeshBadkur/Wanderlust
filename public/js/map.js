mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    projection: 'globe',
    zoom: 10,
    center: listing.geometry.coordinates,
});

map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

map.on('style.load', () => {
    map.setFog({});
});

const marker = new mapboxgl.Marker({color:'red'})
    .setLngLat(listing.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({offset: 25})
    .setHTML(`<h5>${listing.location}</h5><p>Exact Location will be provided after booking</p>`))
    .addTo(map);