import { updateGraph, compareGraphs } from "./traffic.js";

var selectedPorts = [];
var types = [];

function addToSelectedPorts(portCode, type) {
  // Add the portCode to the array
  selectedPorts.push(portCode);
  types.push(type)

  // If there are more than two portCodes, remove the first one (FIFO principle)
  if (selectedPorts.length > 2) {
    selectedPorts.shift(); // Remove the first element from the array
    types.shift();
  }
  console.log("Added to list: " + portCode);
  console.log(selectedPorts);
  console.log(types)
}

var margin = { top: 10, right: 70, bottom: 10, left: 10 };
var width = 820 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var circleRadius_regular = 5;
var circleRadius_hover = 10;

var info_city = document.getElementById("info_city");
var info_name = document.getElementById("info_name");
var info_code = document.getElementById("info_code");
var info_coords = document.getElementById("info_coordinates");
var info_type = document.getElementById("info_type");

var projection = d3.geo
  .albersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

var path = d3.geo.path().projection(projection);

var svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var g = svg.append("g");

var tooltip = d3
  .select("#map")
  .append("div")
  .attr("class", "tooltip")
  .style("pointer-events", "none")
  .style("opacity", 0)
  .style("top", margin.top + "px")
  .style("right", margin.right + "px");

d3.json("us_features.json", function (error, us) {
  if (error) throw error;

  g.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(us.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#B6CFD4")
    .style("stroke", "#fff")
    .style("stroke-width", "1px");

  var airportGroup = g.append("g").attr("class", "airports");

  d3.json("cleaned_airports.json", function (error, airportData) {
    if (error) throw error;

    airportGroup
      .selectAll("circle")
      .data(airportData)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[0];
      })
      .attr("cy", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[1];
      })
      .attr("r", circleRadius_regular)
      .style("fill", "red")
      .style("opacity", 0.5)
      .on("mouseover", function (d) {
        d3.select(this).attr("r", circleRadius_hover).style("opacity", 0.8);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          "Airport: " + d["Airport Name"] + "<br/>City: " + d["City Name"]
        );
        console.log("Airport coordinates: ", [+d.Latitude, +d.Longitude]);
        console.log("Airport Code:", d["Airport Code"]);
        var airportCode = d["Airport Code"];
        var info = {
          city: d["City Name"],
          name: d["Airport Name"],
          code: airportCode,
          coords: [+d.Latitude, +d.Longitude],
          type: "Airport",
        };
        updateGraph(airportCode, "airport", info);

        info_city.textContent = d["City Name"];
        info_name.textContent = d["Airport Name"];
        info_code.textContent = airportCode;
        info_coords.textContent =
          "Lat: " + d.Latitude.toFixed(2) + ", Long: " + d.Longitude.toFixed(2);
        info_type.textContent = " Airport";
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", circleRadius_regular).style("opacity", 0.5);
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .on("click", function (d) {
        addToSelectedPorts (d["Airport Code"], "airport");

          compareGraphs(selectedPorts, types);
      });
  });

  var crossingGroup = g.append("g").attr("class", "crossings");

  d3.json("coordinates_dataset.json", function (error, crossingsData) {
    if (error) throw error;

    crossingGroup
      .selectAll("circle")
      .data(crossingsData)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[0];
      })
      .attr("cy", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[1];
      })
      .attr("r", circleRadius_regular)
      .style("fill", "green")
      .style("opacity", 0.5)

      .on("mouseover", function (d) {
        d3.select(this).attr("r", circleRadius_hover).style("opacity", 0.8);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          "Border Crossing: " + d.PortName + "<br/>Code: " + d.PortCode
        );
        console.log("Crossing coordinates: ", [+d.Latitude, +d.Longitude]);
        console.log("Port code:", d.PortCode);
        var info = {
          city: d.PortName,
          name: d.State,
          code: d.PortCode,
          coords: [+d.Latitude, +d.Longitude],
          type: "Borders",
        };
        updateGraph(d.PortCode, "border", info);

        info_city.textContent = d.PortName;
        info_name.textContent = d.State;
        info_code.textContent = d.PortCode;
        info_coords.textContent =
          "Lat: " + d.Latitude + ", Long: " + d.Longitude;
        info_type.textContent = "Border";
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", circleRadius_regular).style("opacity", 0.5);
        tooltip.transition().duration(500).style("opacity", 0);
      })
      .on("click", function (d) {
        addToSelectedPorts (d.PortCode, "border");

        compareGraphs(selectedPorts, types)
      });
  });

  var zoom = d3.behavior
    .zoom()
    .scaleExtent([1, 10])
    .on("zoom", function () {
      var translate = d3.event.translate;
      var scale = d3.event.scale;

      var tbound = -height * scale + height;
      var bbound = height * scale - height;
      var lbound = -width * scale + width;
      var rbound = width * scale - width;

      translate = [
        Math.max(Math.min(translate[0], rbound), lbound),
        Math.max(Math.min(translate[1], bbound), tbound),
      ];

      g.attr("transform", "translate(" + translate + ")scale(" + scale + ")");

      airportGroup
        .selectAll("circle")
        .attr("cx", function (d) {
          var coords = projection([+d.Longitude, +d.Latitude]);
          return coords[0];
        })
        .attr("cy", function (d) {
          var coords = projection([+d.Longitude, +d.Latitude]);
          return coords[1];
        })
        .attr("r", circleRadius_regular / zoom.scale());
      crossingGroup
        .selectAll("circle")
        .attr("cx", function (d) {
          var coords = projection([+d.Longitude, +d.Latitude]);
          return coords[0];
        })
        .attr("cy", function (d) {
          var coords = projection([+d.Longitude, +d.Latitude]);
          return coords[1];
        })
        .attr("r", circleRadius_regular / zoom.scale());
    });

  svg.call(zoom).on("wheel.zoom", function () {
    d3.event.preventDefault();

    var mouse = d3.mouse(this);

    var scale = zoom.scale();
    var newScale = scale * (d3.event.wheelDelta > 0 ? 1.1 : 0.9);

    newScale = Math.max(
      zoom.scaleExtent()[0],
      Math.min(zoom.scaleExtent()[1], newScale)
    );

    var translate = [
      mouse[0] - (mouse[0] - zoom.translate()[0]) * (newScale / scale),
      mouse[1] - (mouse[1] - zoom.translate()[1]) * (newScale / scale),
    ];

    var tbound = -height * newScale + height;
    var bbound = height * newScale - height;
    var lbound = -width * newScale + width;
    var rbound = width * newScale - width;

    translate = [
      Math.max(Math.min(translate[0], rbound), lbound),
      Math.max(Math.min(translate[1], bbound), tbound),
    ];

    zoom.scale(newScale).translate(translate);
    g.attr("transform", "translate(" + translate + ")scale(" + newScale + ")");

    airportGroup
      .selectAll("circle")
      .attr("cx", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[0];
      })
      .attr("cy", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[1];
      })
      .attr("r", circleRadius_regular / zoom.scale())
      .on("mouseover", function (d) {
        d3.select(this)
          .attr("r", circleRadius_hover / zoom.scale())
          .style("opacity", 0.8);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          "Airport: " + d["Airport Name"] + "<br/>City: " + d["City Name"]
        );
        console.log("Airport coordinates: ", [+d.Latitude, +d.Longitude]);
        console.log("Airport Code:", d["Airport Code"]);
        var airportCode = d["Airport Code"];
        var info = {
          city: d["City Name"],
          name: d["Airport Name"],
          code: airportCode,
          coords: [+d.Latitude, +d.Longitude],
          type: "Airport",
        };
        updateGraph(airportCode, "airport", info);

        info_city.textContent = d["City Name"];
        info_name.textContent = d["Airport Name"];
        info_code.textContent = airportCode;
        info_coords.textContent =
          "Lat: " + d.Latitude.toFixed(2) + ", Long: " + d.Longitude.toFixed(2);
        info_type.textContent = " Airport";
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("r", circleRadius_regular / zoom.scale())
          .style("opacity", 0.5);
        tooltip.transition().duration(500).style("opacity", 0);
      });

    crossingGroup
      .selectAll("circle")
      .attr("cx", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[0];
      })
      .attr("cy", function (d) {
        var coords = projection([+d.Longitude, +d.Latitude]);
        return coords[1];
      })
      .attr("r", circleRadius_regular / zoom.scale())
      .on("mouseover", function (d) {
        d3.select(this)
          .attr("r", circleRadius_hover / zoom.scale())
          .style("opacity", 0.8);
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip.html(
          "Border Crossing: " + d.PortName + "<br/>Code: " + d.PortCode
        );
        console.log("Crossing coordinates: ", [+d.Latitude, +d.Longitude]);
        console.log("Port code:", d.PortCode);
        var info = {
          city: d.PortName,
          name: d.State,
          code: d.PortCode,
          coords: [+d.Latitude, +d.Longitude],
          type: "Borders",
        };
        updateGraph(d.PortCode, "border", info);

        info_city.textContent = d.PortName;
        info_name.textContent = d.State;
        info_code.textContent = d.PortCode;
        info_coords.textContent =
          "Lat: " + d.Latitude + ", Long: " + d.Longitude;
        info_type.textContent = "Border";
      })
      .on("mouseout", function (event, d) {
        d3.select(this)
          .attr("r", circleRadius_regular / zoom.scale())
          .style("opacity", 0.5);
        tooltip.transition().duration(500).style("opacity", 0);
      });
  });
});
