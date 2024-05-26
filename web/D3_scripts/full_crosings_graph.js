// Define dimensions for the chart
var width = 800;
var height = 400;

// Create SVG element
var svg = d3
  .select("#crossings_full")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data
d3.json("FINAL_border_crossing_JSON.json", function (error, data) {
  if (error) throw error;

  console.log("Loaded data:", data);

  // Nest the data by year
  var nestedData = d3
    .nest()
    .key(function (d) {
      return d.Year;
    })
    .rollup(function (v) {
      return d3.sum(v, function (d) {
        return d.total_crossings;
      });
    })
    .entries(data);

  console.log("Nested data:", nestedData);

  // Set up scales
  var x = d3.scale
    .ordinal()
    .domain(
      nestedData.map(function (d) {
        return d.key;
      })
    )
    .rangePoints([0, width]);

  var y = d3.scale
    .linear()
    .domain([
      0,
      d3.max(nestedData, function (d) {
        return d.values;
      }),
    ])
    .range([height, 0]);

  console.log("X Scale domain:", x.domain());
  console.log("Y Scale domain:", y.domain());

  // Define the line function
  var line = d3.svg
    .line()
    .x(function (d) {
      return x(d.key);
    })
    .y(function (d) {
      return y(d.values);
    });

  console.log("Line function:", line);

  // Add the line
  svg.append("path").datum(nestedData).attr("class", "line").attr("d", line).style("fill", "none").style("stroke", "steelblue");

  console.log("Line added");

  // Define the axes
  var xAxis = d3.svg.axis().scale(x).orient("bottom");

  var yAxis = d3.svg.axis().scale(y).orient("left");

  // Add the axes
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Total Crossings");

  console.log("Axes added");
});
