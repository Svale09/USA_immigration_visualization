export function initializeGraph() {
  // Define dimensions for the chart
  var margin = { top: 20, right: 20, bottom: 10, left: 65 };
  var width = 650 - margin.left - margin.right;
  var height = 300 - margin.top - margin.bottom;

  // Define scales for x and y axes with initial domains
  var x = d3.time.scale().range([0, width]).domain([new Date(1990, 0, 1), new Date(2024, 11, 31)]);
  var y = d3.scale.linear().range([height, 0]).domain([0, 1000]);

  // Limit number of ticks on the y-axis to 5
  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickFormat(function (d) {
    return d / 1000;
  });

  var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format("%Y"));

  // Clear any existing SVG elements in the graph1 div
  d3.select("#graph1").selectAll("*").remove();

  // Create SVG element in the graph1 div
  var svg = d3.select("#graph1").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom * 3)
    .append("g")
    .attr("transform", "translate(" + margin.left + ")");

  // Add x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  // Add y-axis
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0," + 6 + ")")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -65)
    .attr("x", -70)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Total Passengers (k)");

  // Store x, y, and svg in a global object for later use
  window.graph = {
    x: x,
    y: y,
    svg: svg,
    width: width,
    height: height,
    margin: margin,
    xAxis: xAxis,
    yAxis: yAxis,
  };
}

var info_city = document.getElementById("info_city");
var info_name = document.getElementById("info_name");
var info_code = document.getElementById("info_code");
var info_coordinates = document.getElementById("info_coordinates");
var info_type = document.getElementById("info_type");

export function updateGraph(selectedCode, dataset, info) {
  // Update the information in the HTML elements
  info_city.textContent = info.city;
  info_name.textContent = info.name;
  info_code.textContent = selectedCode;
  info_coordinates.textContent = info.coordinates;
  info_type.textContent = info.type;

  var pathToData;

  if (dataset === "airport") {
    pathToData = "FINAL_flightsJSON.json";
  } else if (dataset === "border") {
    pathToData = "FINAL_border_crossing_JSON.json";
  } else {
    console.log("Dataset not recognized: ", dataset);
    return;
  }

  d3.json(pathToData, function (error, data) {
    if (error) throw error;

    var filteredData = data.filter(function (d) {
      return d.PortCode === selectedCode;
    });

    if (filteredData.length === 0) {
      console.warn(
        "No data found for the selected airport selectedCode:",
        selectedCode
      );
      return; // Exit if no data is found
    }

    // Parse the date
    var parseDate = d3.time.format("%Y-%B").parse;
    filteredData.forEach(function (d) {
      d.date = parseDate(d.Year + "-" + d.Month); // Ensure total_crossings is treated as a number
    });

    // Update the scales' domains based on the new data
    var x = window.graph.x;
    var y = window.graph.y;
    x.domain(
      d3.extent(filteredData, function (d) {
        return d.date;
      })
    );
    y.domain([
      0,
      d3.max(filteredData, function (d) {
        return d.total_crossings;
      }),
    ]);

    // Define line function
    var line = d3.svg
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.total_crossings);
      });

    // Select the SVG and remove any existing line
    var svg = window.graph.svg;
    svg.selectAll(".line").remove();

    // Append the new line with transition
    var path = svg.append("path")
      .datum(filteredData)
      .attr("class", "line")
      .attr("d", line) // Set the path initially to be the full line
      .style("fill", "none")
      .style("stroke", "steelblue")
      .style("stroke-width", "2px")
      .attr("stroke-dasharray", function() { return this.getTotalLength(); })
      .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
      .transition() // Initiate a transition
      .duration(2000) // Duration of the transition
      .ease("linear") // Linear easing for smooth transition
      .attr("stroke-dashoffset", 0); // Animate the line drawing from start to finish

    // Update the axes
    svg.select(".x.axis").call(window.graph.xAxis);
    svg.select(".y.axis").call(window.graph.yAxis);

    // Rotate x-axis tick values and style
    svg
      .select(".x.axis")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");
  });
}

export function compareGraphs(portCodes, types) {
  // Define the colors for the two lines
  const colors = ["steelblue", "red"];

  // Remove any existing lines
  window.graph.svg.selectAll(".line").remove();

  // Helper function to load data and return a promise
  function loadData(portCode, type) {
    return new Promise((resolve, reject) => {
      var pathToData;
      if (type === "airport") {
        pathToData = "FINAL_flightsJSON.json";
      } else if (type === "border") {
        pathToData = "FINAL_border_crossing_JSON.json";
      } else {
        reject("Dataset not recognized for portCode:", portCode);
      }

      d3.json(pathToData, function (error, data) {
        if (error) reject(error);

        var filteredData = data.filter(function (d) {
          return d.PortCode === portCode;
        });

        if (filteredData.length === 0) {
          console.warn("No data found for the selected PortCode:", portCode);
          resolve([]); // Resolve with empty array if no data is found
        } else {
          // Parse the date
          var parseDate = d3.time.format("%Y-%B").parse;
          filteredData.forEach(function (d) {
            d.date = parseDate(d.Year + "-" + d.Month); // Ensure total_crossings is treated as a number
          });
          resolve(filteredData);
        }
      });
    });
  }

  // Load data for both port codes
  Promise.all(portCodes.map((portCode, index) => loadData(portCode, types[index])))
    .then(results => {
      const allData = results.flat();

      if (allData.length === 0) {
        console.warn("No data available for the provided port codes.");
        return;
      }

      // Update the scales' domains based on the combined data
      var x = window.graph.x;
      var y = window.graph.y;
      x.domain(
        d3.extent(allData, function (d) {
          return d.date;
        })
      );
      y.domain([
        0,
        d3.max(allData, function (d) {
          return d.total_crossings;
        }),
      ]);

      // Define line function
      var line = d3.svg
        .line()
        .x(function (d) {
          return x(d.date);
        })
        .y(function (d) {
          return y(d.total_crossings);
        });

      // Draw lines for each dataset
      results.forEach((filteredData, index) => {
        if (filteredData.length === 0) return;

        var path = window.graph.svg.append("path")
          .datum(filteredData)
          .attr("class", "line")
          .attr("d", line) // Set the path initially to be the full line
          .style("fill", "none")
          .style("stroke", colors[index])
          .style("stroke-width", "2px")
          .attr("stroke-dasharray", function () { return this.getTotalLength(); })
          .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
          .transition() // Initiate a transition
          .duration(2000) // Duration of the transition
          .ease("linear") // Linear easing for smooth transition
          .attr("stroke-dashoffset", 0); // Animate the line drawing from start to finish
      });

      // Update the axes
      window.graph.svg.select(".x.axis").call(window.graph.xAxis);
      window.graph.svg.select(".y.axis").call(window.graph.yAxis);

      // Rotate x-axis tick values and style
      window.graph.svg
        .select(".x.axis")
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
    })
    .catch(error => {
      console.error("Error loading data:", error);
    });
}


initializeGraph();
