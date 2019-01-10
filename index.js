mapboxgl.accessToken = "pk.eyJ1Ijoic2dtYXBib3giLCJhIjoiY2pxbWgzeHVtMWFnazQ4bTA5OXk2bDF2aiJ9.YTk-s8p9Qoni97bVZfAISA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/sgmapbox/cjqmk8fxikef22rthjh7oe40p",
  center: [-77.03115,38.91992],
  zoom: 12
});

// Set up an object to track app state and data
const isoAppData = {
  params: {
    urlBase: "https://api.mapbox.com/isochrone/v1/mapbox/",
    profile: "cycling/",
    minutes: 10
  },
  origins: {
    a: [-77.03115,38.91992]
  },
  isos: {
    a: {}
  }
};

// Grab the elements from the DOM to assign interactivity
const params = document.getElementById("timelimit");

// Get a single isochrone for a given position and return the GeoJSON
const getIso = function(position) {
  // Build the URL for the isochrone API
  const isoUrl = isoAppData.params.urlBase + isoAppData.params.profile + position.join(",") + "?contours_minutes=" +
  isoAppData.params.minutes + "&polygons=true&access_token=" + mapboxgl.accessToken;

  // Return the GeoJSON
  return fetch(isoUrl).then(res => res.json());
};

// Update the map sources so the isochrones draw on the map
const setIsos = function(isos) {
  // Save the isochrone data into the app object
  isoAppData.isos.a = isos[0];

  // Update the map
  map.getSource("isoSource").setData(isoAppData.isos.a);
};

// Get the isochrone data from the API, then update the map
const renderIso = function() {
  const isochroneA = getIso(isoAppData.origins.a);

  // Once the isochrones are received, update the map
  Promise.all([isochroneA]).then(values => {
    setIsos(values);
  });
};

map.on('load', function(){
  console.log("Map is ready");

  // Add sources and layers for the two isochrones
  map.addSource("isoSource", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
      ]
    }
  });

  map.addLayer({
    "id": "isoLayer",
    "type": "fill",
    "source": "isoSource",
    "layout": {},
    "paint": {
      "fill-color": "#0bec72",
      "fill-opacity": 0.3
    }
  });

  // Once the map is all set up, load some isochrones
  renderIso();
});


// Set up the origin markers and their interactivity
const originPoint = new mapboxgl.Marker({
  draggable: true
})
  .setLngLat(isoAppData.origins.a)
  .addTo(map);

// When the point is moved, refresh the isochrones
function onDragEndA() {
  const lngLat = originPoint.getLngLat();
  isoAppData.origins.a = [lngLat.lng, lngLat.lat];
  renderIso();
}

originPoint.on("dragend", onDragEndA);

params.addEventListener("change", e => {
  if (e.target.id === "timelimit") {
    isoAppData.params.minutes = e.target.value;
    renderIso();
  }
});
