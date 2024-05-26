// Define dimensions for the chart
var margin = { top: 20, right: 20, bottom: 30, left: 50 };
var width = 800 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

// Create SVG element
var svg = d3
  .select("#airports_full")
  .append("svg")
  .attr("width", width)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
        return d.total_passengers;
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

  var yAxis = d3.svg.axis().scale(y).orient("left");

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
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Total Passengers");
});
