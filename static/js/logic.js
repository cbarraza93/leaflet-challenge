// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var queryUrl2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(data.features);
});

// Perform a GET request to the query URL for tectonic plates/
d3.json(queryUrl2).then(function (data2) {
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(data2.features);
});

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Perform a GET request to the query URL/
d3.json(queryUrl2).then(function (data2) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data2.features);
});

function markerSize(mag) {
  return mag*5;
}

function markerColor(depth) {
  return depth > 90  ? 'red' :
        depth > 70  ? 'brown' :
        depth > 50  ? 'orange' :
        depth > 30  ? 'yellow' :
        depth > 10  ? 'greenYellow' :
                  'chartreuse';
}

function createFeatures(earthquakeData) {
  
  var earthquakes = L.geoJSON(earthquakeData, {
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  onEachFeature : function (feature, layer) {
    layer.bindPopup(`<h3>Location:${feature.properties.place}</h3><hr><p>Time:${new Date(feature.properties.time)}</p><hr><p>Magnitude:${(feature.properties.mag)}</p><hr><p>Depth:${(feature.geometry.coordinates[2])}</p>`)
    },     pointToLayer: function (feature, latlng) {
      return new L.circleMarker(latlng,
        {radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        stroke: true,
        color: 'black',
        weight: 0.5
    })
  }
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.satellite",
    accessToken: config.API_KEY
  });
  
  var grayscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 17,
    id: "mapbox.light",
    accessToken: config.API_KEY
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satellite": satellite,
    "Grayscale": grayscale
  };

  // Create an overlay object to hold our overlay.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3.5,
    layers: [satellite, earthquakes]
  });

  // Create a layer/legend control.
  // Pass it our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var info = L.control({
    position: "bottomright"
});

info.onAdd = function(){
    var div = L.DomUtil.create("div","legend");
    return div;
}

info.addTo(myMap);

document.querySelector(".legend").innerHTML=displayLegend();
}
  function displayLegend(){
    var legendInfo = [{
        limit: "Depth: -10-10",
        color: "chartreuse"
    },{
        limit: "Depth: 10-30",
        color: "greenYellow"
    },{
        limit:"Depth: 30-50",
        color:"yellow"
    },{
        limit:"Depth: 50-70",
        color:"orange"
    },{
        limit:"Depth: 70-90",
        color:"brown"
    },{
        limit:"Depth: 90+",
        color:"red"
    }];

    var header = "<h3>Earthquake Depth</h3><hr>";

    var strng = "";
   
    for (i = 0; i < legendInfo.length; i++){
        strng += "<p style = \"background-color: "+legendInfo[i].color+"\">"+legendInfo[i].limit+"</p>";
    }
    
    return header+strng+"<h4>Note: Marker Size is</br>dependent on Magnitude</h4>";


}


