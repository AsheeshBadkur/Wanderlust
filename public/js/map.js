console.log("Map token:", mapToken);
console.log("Listing geometry:", listing.geometry);
console.log("Coordinates:", listing.geometry ? listing.geometry.coordinates : "NO GEOMETRY");
console.log("Coordinates length:", listing.geometry && listing.geometry.coordinates ? listing.geometry.coordinates.length : "N/A");
mapboxgl.accessToken = mapToken;

if (
    !listing.geometry ||
    !listing.geometry.coordinates ||
    listing.geometry.coordinates.length === 0
) {
    document.getElementById('map').style.display = 'none';
    const placeholder = document.getElementById('map-placeholder');
    if (placeholder) placeholder.style.display = 'block';
} else {
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

    const marker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
        .setHTML(`<h5>${listing.location}</h5><p>Exact location will be provided after booking</p>`))
        .addTo(map);
}