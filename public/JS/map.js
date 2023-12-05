mapboxgl.accessToken = mapToken;
//Create Map
const map = new mapboxgl.Map({
  container: "map", // container ID
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/mapbox/satellite-streets-v12", // style URL
  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 12, // starting zoom
});

//Add Marker

const marker = new mapboxgl.Marker({color: "red"})
.setLngLat(listing.geometry.coordinates)
.setPopup(new mapboxgl.Popup({offset: 25}).setHTML(
  `<div class="markerPopup">
  <h4 class="markerTitle">${listing.title}</h4>
  <p class="markertext">Exact location well be provided after booking </p>
  </div>`
  ))
.addTo(map);

 
// Add Directions
map.addControl(
  new MapboxDirections({
      accessToken: mapboxgl.accessToken
  }),
  'top-left'
);

//Add Search Bar

map.addControl(
  new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl
  })
  );


  // Mouse Hover

  map.on('load', () => {
    map.addSource('places', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'description':
                            `<div class="markerPopup">
                            <h4 class="markerTitle">${listing.title}</h4>
                            <p class="markerLocation" >[${listing.location}]</p>
                            <p class="markertext">Exact location well be provided after booking </p>
                            </div>`
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': listing.geometry.coordinates
                    }
                },
            ]
        }
    });
    // Add a layer showing the places.
    map.addLayer({
        'id': 'places',
        'type': 'circle',
        'source': 'places',
        'paint': {
            'circle-color': '#00CED1',
            'circle-radius': 6,
            'circle-stroke-width': 5,
            'circle-stroke-color': `#FDF5E6`,
        }
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'places', (e) => {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Copy coordinates array.
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(coordinates).setHTML(description).addTo(map);
    });

    map.on('mouseleave', 'places', () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});
