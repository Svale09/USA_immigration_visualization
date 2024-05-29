import { updateGraph } from "./traffic.js";

// Define variables for the dropdowns
var typeDropdown = document.getElementById("typeDropdown");
var specificDropdown = document.getElementById("specificDropdown");

var airportsData = [];
var crossingsData = [];


// Load the airport and border crossing data
d3.json("cleaned_airports.json", function (error, data) {
  if (error) throw error;
  airportsData = data;
});

d3.json("coordinates_dataset.json", function (error, data) {
  if (error) throw error;
  crossingsData = data;
});

// Event listener for the type dropdown
typeDropdown.addEventListener("change", function () {
  var type = this.value;
  specificDropdown.innerHTML = '<option value="">Select Specific</option>';
  specificDropdown.disabled = type === "";

  if (type === "airport") {
    airportsData.forEach(function (airport) {
      var option = document.createElement("option");
      option.value = airport["Airport Code"];
      option.textContent = airport["Airport Name"];
      specificDropdown.appendChild(option);
    });
  } else if (type === "border") {
    crossingsData.forEach(function (crossing) {
      var option = document.createElement("option");
      option.value = crossing.PortCode;
      option.textContent = crossing.PortName;
      specificDropdown.appendChild(option);
    });
  }
});

// Event listener for the specific dropdown
specificDropdown.addEventListener("change", function () {
  var specificCode = this.value;
  var type = typeDropdown.value;

  if (specificCode) {
    updateGraph(specificCode, type);
  }
});
