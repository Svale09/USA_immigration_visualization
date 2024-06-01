import { updateGraph } from "./traffic.js";

// Define variables for the dropdowns
var typeDropdown = document.getElementById("typeDropdown");
var specificDropdown = document.getElementById("specificDropdown");

var airportsData = [];
var crossingsData = [];

var type = "airport";

// Load the airport and border crossing data
d3.json("cleaned_airports.json", function (error, data) {
  if (error) throw error;
  airportsData = data;
  
  // Trigger change event after loading airports data
  initializeDropdown();
});

d3.json("coordinates_dataset.json", function (error, data) {
  if (error) throw error;
  crossingsData = data;
});

// Event listener for the type dropdown
typeDropdown.addEventListener("change", function () {
  type = this.value;
  specificDropdown.innerHTML = '<option value="">Select Specific</option>';
  specificDropdown.disabled = type === "";

  if (type === "airport") {
    airportsData.forEach(function (airport) {
      var option = document.createElement("option");
      option.value = JSON.stringify({
        code: airport["Airport Code"],
        name: airport["Airport Name"],
        city: airport["City Name"],
        coordinates: "Lat: " + airport.Latitude + ", Long: " + airport.Longitude,
        type: "Airport",
      });
      option.textContent = airport["Airport Name"];
      specificDropdown.appendChild(option);
    });
  } else if (type === "border") {
    crossingsData.forEach(function (crossing) {
      var option = document.createElement("option");
      option.value = JSON.stringify({
        code: crossing.PortCode,
        name: crossing.PortName,
        city: crossing.PortName, // Assuming city is the same as port name for borders
        coordinates: "Lat: " + crossing.Latitude + ", Long: " + crossing.Longitude,
        type: "Border",
      });
      option.textContent = crossing.PortName;
      specificDropdown.appendChild(option);
    });
  }
});

// Event listener for the specific dropdown
specificDropdown.addEventListener("change", function () {
  var selectedData = JSON.parse(this.value);
  var specificCode = selectedData.code;
  var type = typeDropdown.value;

  if (specificCode) {
    updateGraph(specificCode, type, selectedData);
  }
});

// Initialize dropdown to set initial values and trigger change event
function initializeDropdown() {
  typeDropdown.value = "airport"; // Set initial value
  typeDropdown.dispatchEvent(new Event('change')); // Trigger change event
}
