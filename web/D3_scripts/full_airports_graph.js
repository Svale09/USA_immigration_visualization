// Define dimensions for the chart
var margin = { top: 20, right: 20, bottom: 10, left: 60 };
var width = 700 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// Load the data
d3.json("FINAL_flightsJSON.json", function (error, data) {
  if (error) throw error;

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

  // Define the axes
  var xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom")
    .tickValues(
      x.domain().filter(function (d, i) {
        return i % 2 === 0;
      })
    );

  var yAxis = d3.svg
    .axis()
    .scale(y)
    .orient("left")
    .tickFormat(function (d) {
      return d / 1000000;
    });

  var svg = d3
    .select("#airports_full")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom * 4)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Add the axes
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -125)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Total Passengers (mil)");

  // Define the line function
  var line = d3.svg
    .line()
    .x(function (d) {
      return x(d.key);
    })
    .y(function (d) {
      return y(d.values);
    });

  // Add the line
  svg
    .append("path")
    .datum(nestedData)
    .attr("class", "line")
    .attr("d", line)
    .style("stroke", "steelblue")
    .style("fill", "none");

  // Create a tooltip element
  var graphTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "graph-tooltip");

  // Add a mousemove event listener to the graph container
  svg.on("mousemove", function () {
    var mouseX = d3.mouse(this)[0]; // Get the x position of the mouse relative to the graph

    // Find the nearest x value in the graph data
    var nearestDataPoint = nestedData.reduce(function (prev, curr) {
      var prevX = x(prev.key);
      var currX = x(curr.key);
      return Math.abs(currX - mouseX) < Math.abs(prevX - mouseX) ? curr : prev;
    });

    // Update the tooltip with the x and y values
    graphTooltip
      .style("left", d3.event.pageX + 10 + "px") // Position the tooltip to the right of the mouse
      .style("top", d3.event.pageY - 10 + "px") // Position the tooltip above the mouse
      .style("opacity", 1)
      .html(
        "Year: " +
          nearestDataPoint.key +
          "<br/>Total Passengers: " +
          +(nearestDataPoint.values / 1000000).toFixed(2) +
          " mil"
      );
  });

  // Add a mouseout event listener to hide the tooltip when the mouse leaves the graph
  svg.on("mouseout", function () {
    graphTooltip.style("opacity", 0);
  });
});