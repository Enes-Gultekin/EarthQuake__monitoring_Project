const table_content = document.getElementById("table_container");
const main_container = document.getElementById("main_container");
const rowss = document.getElementById("create_rows");
const search_button = document.getElementById("search_button");
const search_input = document.getElementById("search_input");
const recent_eq = document.getElementById("recent_input");
const significant_eq = document.getElementById("significant_input");
const fault_input = document.getElementById("fault_input");
let country_name = new Array();

const map = L.map("map", {
  maxZoom: 17,
  minZoom: 3,
  maxBounds: [
    [-90, -180], // Southwest coordinates
    [90, 180], // Northeast coordinates
  ],
}).setView([49.75863040315576, 6.6431523766027], 1);
var Stadia_AlidadeSmoothDark = L.tileLayer(
  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}",
  {
    attribution:
      '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: "png",
  }
);
var CartoDB_Positron = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }
).addTo(map);
var OSM = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {});

//limit the max boundaries of map
var southWest = L.latLng(-90, -180),
  northEast = L.latLng(90, 180);
bounds = L.latLngBounds(southWest, northEast);

map.setMaxBounds(bounds);
map.on("drag", function () {
  map.panInsideBounds(bounds, { animate: false });
});

//create layer of maps
var basemaps = {
  OSM: OSM,
  Carto: CartoDB_Positron,
  Stadia: Stadia_AlidadeSmoothDark,
};
var layerGroup = L.layerGroup();
L.control.layers(basemaps).addTo(map);

//this code creates rows and markers and it gets attributes
function createTable(
  checkbox,
  markers_group,
  place,
  magnitude,
  date,
  lat,
  lng
) {
  checkbox.addEventListener("change", () => {
    var table_body = document.createElement("tr");
    table_body.addEventListener("click", () => {
      map.flyTo([lat, lng], 8);
    });
    table_body.innerHTML = `    
        
          <td scope="row">${place}</th>          
          <td>${magnitude}</td>
          <td>${date}</td> `;

    if (checkbox.checked) {
      markers_group.addTo(map);
      table_content.appendChild(table_body);
    } else {
      markers_group.remove();
      table_content.innerHTML = "";
    }
  });
}

//fetch most deadliest earthquakes data from database(PostGre)
fetch("service.php")
  .then((request) => {
    return request.json();
  })
  .then((response) => {
    console.log("Number of significant Earth-Quakes:" + response.length);
    for (var i = 0; i < response.length; i++) {
      var data = response[i];
      var place = data.country;
      var magnitude = data.magnitude;
      var date = data.date;
      const geometry = [data.latitude, data.longitude];
      var latitude = data.latitude;
      var longitude = data.longitude;
      var each_country = L.icon({
        iconUrl: "data/earthquake.png",
        iconSize: [40, 40],
        iconAnchor: [20, 0],
        className: "icons",
      });
      const markers = L.marker(geometry, {
        icon: each_country,
      });

      const damage = parseInt(data.total_damage) * 1000;
      damage_fixed = damage.toLocaleString();

      markers.bindPopup(
        "<h3 style='text-transform: capitalize'>" +
          place +
          "</h3>" +
          "<b>Magnitude: </b>" +
          "<span style='float:right'>" +
          magnitude +
          "</span>" +
          "<br><b>Date: </b>" +
          "<span style='float:right'>" +
          date +
          "</span>" +
          "<br><b>Total Death Number: </b>" +
          "<span style='float:right'>" +
          data.total_deaths +
          "</span>" +
          "<br><b>Total Damage in Dollars: $</b>" +
          "<span style='float:right'>" +
          damage_fixed +
          "</span>"
      );

      layerGroup.addLayer(markers);
      createTable(
        significant_eq,
        layerGroup,
        place,
        magnitude,
        date,
        latitude,
        longitude
      );
    }
  });

let current_time = new Date();
current_time = current_time.toISOString().split("T")[0];
let one_days_before = new Date();
one_days_before.setDate(one_days_before.getDate());
one_days_before = one_days_before.toISOString().split("T")[0];

//fetch geojson from usgs
const api_url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${one_days_before}&endtime=${current_time}&minmagnitude=2.5`;

var layergroup_recent_earthquakes = L.layerGroup();
let country_names;

//the function gets data from usgs api.
async function recent_eq_function() {
  await fetch(api_url)
    .then((response) => response.json())
    .then((resp) => {
      resp.features.forEach((item) => {
        //change the date to normal format
        var time_stamp = new Date(item.properties.time);
        var date = time_stamp.toISOString().split("T")[0];
        var time = time_stamp.toISOString().split("T")[1];
        time = time.slice(0, -5);
        var date_n_time = date + " " + time;

        const mag = item.properties.mag;
        var place = item.properties.place;

        var latitude = item.geometry.coordinates[1];
        var longitude = item.geometry.coordinates[0];

        var popup_content =
          "<h3>Attributes</h3>" +
          "<br><b>Place: </b>" +
          place +
          "<br><b>Magnitude: </b><span style='float: right;'>" +
          mag +
          "</span>" +
          "<br><b>Date: </b><span style='float: right;'>" +
          date +
          "</span>" +
          "<br><b>Time: </b><span style='float: right;'>" +
          time +
          "</span>";
        //custumize markers
        var green_icon = L.icon({
          iconUrl: "data/green_earthquake.png",
          iconAnchor: [32, 64],
          popupAnchor: [0, -80],
          className: "icons",
        });
        var white_icon = L.icon({
          iconUrl: "data/white_earthquake.png",
          iconAnchor: [32, 64],
          popupAnchor: [0, -80],
          className: "icons",
        });
        var red_icon = L.icon({
          iconUrl: "data/red_earthquake.png",
          iconAnchor: [32, 64],
          popupAnchor: [0, -80],
          className: "icons",
        });
        var orange_icon = L.icon({
          iconUrl: "data/orange_earthquake.png",
          iconAnchor: [32, 64],
          popupAnchor: [0, -80],
          className: "icons",
        });
        if (mag >= 3 && mag < 5) {
          var green_marker = L.marker([latitude, longitude], {
            icon: green_icon,
          });

          var pulsingIcon = L.icon.pulse({
            iconSize: [20, 20],
            fillColor: "green",
            color: "green",
          });
          var green_circle_marker = L.marker([latitude, longitude], {
            icon: pulsingIcon,
          });

          layergroup_recent_earthquakes.addLayer(green_circle_marker);
          layergroup_recent_earthquakes.addLayer(green_marker);

          green_marker.bindPopup(popup_content);

          //adjust attributes of markers. markers and pulsing circles added
        } else if (mag > 2.5 && mag < 3) {
          var white_marker = L.marker([latitude, longitude], {
            icon: white_icon,
            stroke: true,

            className: "icons",
          });
          var pulsingIcon = L.icon.pulse({
            iconSize: [20, 20],
            fillColor: "white",
            color: "white",
          });
          var white_circle_marker = L.marker([latitude, longitude], {
            icon: pulsingIcon,
          });

          layergroup_recent_earthquakes.addLayer(white_circle_marker);
          layergroup_recent_earthquakes.addLayer(white_marker);
          white_marker.bindPopup(popup_content);
        } else if (mag > 5 && mag < 6) {
          var pulsingIcon = L.icon.pulse({
            iconSize: [20, 20],
            fillColor: "orange",
            color: "orange",
          });

          var orange_circle_marker = L.marker([latitude, longitude], {
            icon: pulsingIcon,
          });

          var orange_marker = L.marker([latitude, longitude], {
            icon: orange_icon,

            iconSize: [30, 30],
          });

          layergroup_recent_earthquakes.addLayer(orange_marker);
          layergroup_recent_earthquakes.addLayer(orange_circle_marker);
          orange_marker.bindPopup(popup_content);
        } else if (mag >= 6) {
          var red_marker = L.marker([latitude, longitude], {
            icon: red_icon,

            iconSize: [30, 30],
          });

          var pulsingIcon = L.icon.pulse({
            iconSize: [20, 20],
            fillColor: "red",
            color: "red",
          });

          var red_circle_marker = L.marker([latitude, longitude], {
            icon: pulsingIcon,
          });

          layergroup_recent_earthquakes.addLayer(red_circle_marker);
          layergroup_recent_earthquakes.addLayer(red_marker);
          red_marker.bindPopup(popup_content);
        }

        createTable(
          recent_eq,
          layergroup_recent_earthquakes,
          place,
          mag,
          date_n_time,
          latitude,
          longitude
        );
      });
    });

  //creates fault-line vector layer.
  var fault_lines;
  fetch("data/fault_line.geojson")
    .then((request) => {
      return request.json();
    })
    .then((data) => {
      fault_lines = L.geoJSON(data);
    });
  fault_input.addEventListener("change", () => {
    if (fault_input.checked) {
      console.log("fault lines checked");
      fault_lines.addTo(map);
    } else {
      console.log("fault line didnt checked");
      fault_lines.remove();
    }
  });
}

//gets current location and zoom to the coordinate
var location_button = document.getElementById("location_button");
location_button.addEventListener("click", () => {
  console.log("button clicked");
  map.locate().on("locationfound", locf);
});
// create a location button and marker on the map
function locf(e) {
  console.log(
    "Your Location: Latitude:" + e.latitude + " Longitude:" + e.longitude
  );
  var location_icon = L.icon({
    iconUrl: "data/current_loc_pin.png",
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    className: "icons",
  });
  map.flyTo([e.latitude, e.longitude], 5);
  const location_markers = L.marker([e.latitude, e.longitude], {
    icon: location_icon,
  }).addTo(map);
  location_markers.on("click", () => {
    location_markers.remove();
  });
}

//assign attributes to search button and get country coordinates from api. when gets value, zoom to the related country
search_button.addEventListener("click", () => {
  console.log(search_input.value);
  var search_text =
    search_input.value[0].toUpperCase() + search_input.value.slice(1); //to capitalize the first letter of search input
  fetch("https://restcountries.com/v3.1/all")
    .then((response) => response.json())
    .then((items) => {
      var countryFound = false;

      items.forEach((data) => {
        var country = data.name.common;

        if (search_text === country) {
          map.flyTo([data.latlng[0], data.latlng[1]], 7);
          countryFound = true;
        }
      });

      if (!countryFound) {
        alert("There is no such Country: " + search_text);
      }
    });
});

recent_eq_function();

const modal = document.getElementById("message_container");
const close_message = document.getElementById("close_message");
close_message.addEventListener("click", () => {
  modal.remove();
});

var wmsLayer = L.tileLayer
  .wms(
    "http://neowms.sci.gsfc.nasa.gov/wms/wms?version=1.3.0&service=WMS&REQUEST=GetMap&LAYERS=MODAL2_D_CLD_CI&CRS=CRS:84&FORMAT=image/png&HEIGHT=1800&WIDTH=3600&TRANSPARENT=TRUE&BBOX=-180.0,-90.0,180.0,90.0&STYLES=rgb    ",
    {
      layers: "MODAL2_D_CLD_CI",
      format: "image/png", // or other supported format
      transparent: true,
      attribution: "Harvard GeoData Service",
    }
  )
  .addTo(map);
