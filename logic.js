function buildUrl() {
    const earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
    const plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
    return [plateURL, earthquakeUrl]
}

// Marker size
function markerSize(mag) {
    return mag * 4;
  }
 
// Marker color 
function setColor(mag) {
    if (mag <= 1) {
        return "#98EE00";
    } else if (mag <= 2) {
        return "#D4EE00";
    } else if (mag <= 3) {
        return "#EECC00";
    } else if (mag <= 4) {
        return "#EE9C00";
    } else if (mag <= 5) {
        return "#EA822C";
    } else {
        return "#EA2C2C";
    };
    }

function createFeatures(boundaryData, earthquakeData) {

  function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: setColor(feature.properties.mag),
            color: "#000000",
            radius: markerSize(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
  
  function onEachFeature(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }

  const earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,
        onEachFeature: onEachFeature
    });

    const boundaries = L.geoJSON(boundaryData, {
        color: "orange",
        weight: 2
    });
  
  
    // Sending our earthquakes layer to the createMap function
    createMap(boundaries, earthquakes);
  }

function createMap(boundaries, earthquakes) {

    // Define Map layers
    const streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.streets",
            accessToken: API_KEY
    });

    const darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
    });

    const outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    const baseMaps = {
            "Street Map": streetMap,
            "Dark Map": darkMap,
            "Outdoors": outdoorMap
    };

    // Create overlay object to hold our overlay layer
    const overlayMaps = {
            "Earthquakes": earthquakes,
            "Fault Lines": boundaries
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    const myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [streetMap, boundaries, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);

    //add legend
    const legend = L.control({
      position: 'bottomright'
    });

    legend.onAdd = function (map) {
    
      const div = L.DomUtil.create('div', 'info legend')
      const magnitudes = [0, 1, 2, 3, 4, 5]
  
      for ( i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + setColor(magnitudes[i] + 1) + '"></i>  ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  legend.addTo(myMap);
}
// function to pull data and wait for response
(async function(){
    //const queryUrl = buildUrl();
    let urlArray = buildUrl();
    plateURL = urlArray[0];
    earthquakeUrl = urlArray[1];
    const p_data = await d3.json(plateURL);
    const e_data = await d3.json(earthquakeUrl);
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(p_data.features, e_data.features);

})();