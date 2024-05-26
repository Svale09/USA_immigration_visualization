import { updateGraph } from './traffic.js';

var width = 900;
var height = 500;

var circleRadius_regular = 4;
var circleRadius_hover = 10;

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

// Load US map data
d3.json("us_features.json", function (error, us) {
  if (error) throw error;

  // Draw states
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

  // Group for airports
  var airportGroup = g.append("g").attr("class", "airports");

  // Load airport data
  d3.json("cleaned_airports.json", function (error, airportData) {
    if (error) throw error;

    // Draw circles representing airport locations
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
      .attr("r", circleRadius_regular) // Smaller regular radius
      .style("fill", "red")
      .style("opacity", 0.5) // Less visible regular opacity
      // Add event listeners for hover events
      .on("mouseover", function () {
        d3.select(this)
          .attr("r", circleRadius_hover) // Bigger radius on hover
          .style("opacity", 0.8); // More visible on hover
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("r", circleRadius_regular) // Restore regular radius on mouseout
          .style("opacity", 0.5); // Restore regular opacity on mouseout
      })
      .on("click", function (d) {
        console.log("Airport coordinates: ", [+d.Latitude, +d.Longitude]);
        console.log("Airport Code:", d["Airport Code"]);
        var airportCode = d["Airport Code"];
        updateGraph(airportCode)
      });
  });

  // Group for border crossings
  var crossingGroup = g.append("g").attr("class", "crossings");

  // Load border crossing data
  d3.json("coordinates_dataset.json", function (error, crossingsData) {
    if (error) throw error;

    // Draw circles representing border crossings
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
      .attr("r", circleRadius_regular) // Smaller regular radius
      .style("fill", "green")
      .style("opacity", 0.5) // Less visible regular opacity
      // Add event listeners for hover events
      .on("mouseover", function () {
        d3.select(this)
          .attr("r", circleRadius_hover) // Bigger radius on hover
          .style("opacity", 0.8); // More visible on hover
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("r", circleRadius_regular) // Restore regular radius on mouseout
          .style("opacity", 0.5); // Restore regular opacity on mouseout
      })
      .on("click", function (d) {
        console.log("Crossing coordinates: ", [+d.Latitude, +d.Longitude]);
        console.log("Port code:", d.PortCode);
      });
  });

  // Zoom behavior
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

      // Adjust airport positions based on the new translate and scale
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
        .attr("r", circleRadius_regular / zoom.scale()); // Adjust the radius based on the scale

      // Adjust border crossing positions based on the new translate and scale
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
        .attr("r", circleRadius_regular / zoom.scale()); // Adjust the radius based on the scal
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

    // Adjust airport positions based on the new translate and scale
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
      .on("mouseover", function () {
        d3.select(this)
          .attr("r", circleRadius_hover / zoom.scale()) // Bigger radius on hover
          .style("opacity", 0.8); // More visible on hover
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("r", circleRadius_regular / zoom.scale()) // Restore regular radius on mouseout
          .style("opacity", 0.5); // Restore regular opacity on mouseout
      });

    // Adjust border crossing positions based on the new translate and scale
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
      .on("mouseover", function () {
        d3.select(this)
          .attr("r", circleRadius_hover / zoom.scale()) // Bigger radius on hover
          .style("opacity", 0.8); // More visible on hover
      })
      .on("mouseout", function () {
        d3.select(this)
          .attr("r", circleRadius_regular / zoom.scale()) // Restore regular radius on mouseout
          .style("opacity", 0.5); // Restore regular opacity on mouseout
      }); // Adjust the radius based on the scale
  });
});
