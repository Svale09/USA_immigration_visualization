var width = 900;
var height = 500;

var projection = d3.geo
  .albersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);

var path = d3.geo.path().projection(projection);

var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var g = svg.append("g");

d3.json("us_features.json", function (error, us) {
  if (error) throw error;

  g.append("g")
    .attr("class", "states")
    .selectAll("path")
    .data(us.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "#9FDDEA")
    .style("stroke", "#fff")
    .style("stroke-width", "1px");
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
});

// AIRPORTS visualization

d3.json("FINAL_flightsJSON.json", function (error, airportData) {
  if (error) throw error;

  // Define the projection for airport data
  var airportProjection = d3.geo
    .albersUsa()
    .scale(1000)
    .translate([width / 2, height / 2]);

  // Draw circles representing airport locations
  svg
    .selectAll("circle")
    .data(airportData)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      console.log("Longitude:", d.Longitude);
      return airportProjection(d.Longitude, d.Latitude);
    })
    .attr("cy", function (d) {
      console.log("Latitude:", d.Latitude);
      return airportProjection(d.Latitude, d.Latitude);
    })
    .attr("r", 5)
    .style("fill", "red")
    .style("opacity", 0.75);
});
