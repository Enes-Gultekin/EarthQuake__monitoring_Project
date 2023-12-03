const table_content = document.getElementById("table_container");
const main_container = document.getElementById("main_container");
const rowss = document.getElementById("create_rows");
const search_button = document.getElementById("search_button");
const search_input = document.getElementById("search_input");

const map = L.map("map", {
  maxZoom: 20,
  minZoom: 3.2,
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
);
var OSM = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {}
).addTo(map);

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

fetch("service.php")
  .then((request) => {
    return request.json();
  })
  .then((response) => {
    console.log("Number of significant Earth-Quakes:" + response.length);
    for (var i = 0; i < response.length; i++) {
      var row = response[i];

      const geometry = [row.latitude, row.longitude];
      var each_country = L.icon({
        iconUrl: "data/earthquake.png",
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        className: "icons",
      });
      const markers = L.marker(geometry, {
        icon: each_country,
      });

      const damage = parseInt(row.total_damage) * 1000;

      //create table rows
      const table_body = document.createElement("tr");
      table_body.innerHTML = `    
        
          <td scope="row">${row.country}</th>          
          <td>${row.magnitude}</td>
          <td>${row.date}</td>
       
              
      `;

      damage_fixed = damage.toLocaleString();

      markers.bindPopup(
        "<h3 style='text-transform: capitalize'>" +
          row.country +
          "</h3>" +
          "<b>Magnitude: </b>" +
          "<span style='float:right'>" +
          row.magnitude +
          "</span>" +
          "<br><b>Date: </b>" +
          "<span style='float:right'>" +
          row.date +
          "</span>" +
          "<br><b>Total Death Number: </b>" +
          "<span style='float:right'>" +
          row.total_deaths +
          "</span>" +
          "<br><b>Total Damage in Dollars: $</b>" +
          "<span style='float:right'>" +
          damage_fixed +
          "</span>"
      );

      layerGroup.addLayer(markers);
      function updateTable() {
        if (map.hasLayer(layerGroup)) {
          // Create or update the table
          createTable();
        } else {
          // Remove the table
          removeTable();
        }
      }

      function createTable() {
        table_content.appendChild(table_body);
      }
      function removeTable() {
        table_content.remove();
      }
      // Event listener for layer control changes
      map.on("overlayadd overlayremove", updateTable);

      map.on("overlayadd", function (event) {
        if (event.name === "Significant Earth-Quakes") {
          // 'Markers' layer is checked, create the table
          createTable();
        }
      });

      map.on("overlayremove", function (event) {
        if (event.name === "Significant Earth-Quakes") {
          // 'Markers' layer is unchecked, remove the table
          removeTable();
        }
      });
    }
  });

let current_time = new Date();
current_time = current_time.toISOString().split("T")[0];
let three_days_before = new Date();
three_days_before.setDate(three_days_before.getDate() - 3);
three_days_before = three_days_before.toISOString().split("T")[0];

//fetch geojson from usgs
const api_url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${three_days_before}&endtime=${current_time}`;
var layergroup_recenteq = L.layerGroup();

fetch(api_url)
  .then((response) => response.json())
  .then((resp) => {
    resp.features.forEach((item) => {
      const coor = item.geometry.coordinates;

      var time_stamp = new Date(item.properties.time);
      var date = time_stamp.toISOString().split("T")[0];
      var time = time_stamp.toISOString().split("T")[1];
      time = time.slice(0, -5);
      const mag = item.properties.mag;
      const id = item.id;
      const list = document.createElement("tr");
      const place = item.properties.place;

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
        var green_marker = L.marker([coor[1], coor[0]], {
          icon: green_icon,
        });

        var pulsingIcon = L.icon.pulse({
          iconSize: [20, 20],
          fillColor: "green",
          color: "green",
        });
        var green_circle_marker = L.marker([coor[1], coor[0]], {
          icon: pulsingIcon,
        });

        layergroup_recenteq.addLayer(green_circle_marker);
        layergroup_recenteq.addLayer(green_marker);

        green_marker.bindPopup(popup_content);
      } else if (mag > 2.5 && mag < 3) {
        var white_marker = L.marker([coor[1], coor[0]], {
          icon: white_icon,
          stroke: true,

          className: "icons",
        });
        var pulsingIcon = L.icon.pulse({
          iconSize: [20, 20],
          fillColor: "white",
          color: "white",
        });
        var white_circle_marker = L.marker([coor[1], coor[0]], {
          icon: pulsingIcon,
        });

        layergroup_recenteq.addLayer(white_circle_marker);
        layergroup_recenteq.addLayer(white_marker);

        white_marker.bindPopup(popup_content);
      } else if (mag > 5 && mag < 6) {
        var pulsingIcon = L.icon.pulse({
          iconSize: [20, 20],
          fillColor: "orange",
          color: "orange",
        });
        var orange_circle_marker = L.marker([coor[1], coor[0]], {
          icon: pulsingIcon,
        });
        var orange_marker = L.marker([coor[1], coor[0]], {
          icon: orange_icon,

          iconSize: [30, 30],
        });
        layergroup_recenteq.addLayer(orange_marker);
        layergroup_recenteq.addLayer(orange_circle_marker);
        orange_marker.bindPopup(popup_content);
      } else if (mag >= 6) {
        var red_marker = L.marker([coor[1], coor[0]], {
          icon: red_icon,

          iconSize: [30, 30],
        });
        var pulsingIcon = L.icon.pulse({
          iconSize: [20, 20],
          fillColor: "red",
          color: "red",
        });
        var red_circle_marker = L.marker([coor[1], coor[0]], {
          icon: pulsingIcon,
        });

        layergroup_recenteq.addLayer(red_circle_marker);
        layergroup_recenteq.addLayer(red_marker);

        red_marker.bindPopup(popup_content);
      }
    });
  });

var fault_lines;
fetch("data/fault_line.geojson")
  .then((request) => {
    return request.json();
  })
  .then((data) => {
    fault_lines = L.geoJSON(data);

    L.control
      .layers(basemaps, {
        "Significant Earth-Quakes": layerGroup,
        "Recent Earth-Quakes": layergroup_recenteq,
        "Fault Line": fault_lines,
      })
      .addTo(map);
  });

var location_button = document.getElementById("location_button");
location_button.addEventListener("click", () => {
  console.log("button clicked");
  map.locate().on("locationfound", locf);
});

function locf(e) {
  console.log(e.latLng);
  var location_icon = L.icon({
    iconUrl: "data/current_loc_pin.png",
    iconSize: [64, 64],
    iconAnchor: [32, 64],
    className: "icons",
  });
  map.flyTo([e.latitude, e.longitude], 10);
  const location_markers = L.marker([e.latitude, e.longitude], {
    icon: location_icon,
  }).addTo(map);
  location_markers.on("click", () => {
    location_markers.remove();
  });
}

//get country coordinates from api
search_button.addEventListener("click", () => {
  console.log(search_input.value);
  fetch("https://restcountries.com/v3.1/all")
    .then((response) => response.json())
    .then((items) => {
      var countryFound = false;

      items.forEach((data) => {
        var country = data.name.common;

        if (search_input.value === country) {
          map.flyTo([data.latlng[0], data.latlng[1]], 7);
          countryFound = true;
        }
      });

      if (!countryFound) {
        alert("There is no such Country: " + search_input.value);
      }
    })
    .catch((error) => {
      console.error("Error fetching countries:", error);
    });
});
