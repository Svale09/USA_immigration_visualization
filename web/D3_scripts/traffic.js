export function updateGraph(selectedCode, dataset) {
  console.log("Selected point type: ", dataset);

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

    // Log the loaded JSON data
    console.log("Loaded Data:", data);

    // Filter data by selected.PortCode value
    var filteredData = data.filter(function (d) {
      return d.PortCode === selectedCode;
    });

    // Log the filtered data
    console.log(
      "Filtered Data for entry point selectedCode",
      selectedCode,
      ":",
      filteredData
    );

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

    console.log("Parsed Data:", filteredData);

    // Define dimensions for the chart
    var margin = { top: 20, right: 20, bottom: 10, left: 60 };
    var width = 650 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    // Define scales for x and y axes
    var x = d3.time
      .scale()
      .range([0, width])
      .domain(
        d3.extent(filteredData, function (d) {
          return d.date;
        })
      );

    var y = d3.scale
      .linear()
      .range([height, 0])
      .domain([
        0,
        d3.max(filteredData, function (d) {
          return d.total_crossings;
        }),
      ]);

    var xAxis = d3.svg
      .axis()
      .scale(x)
      .orient("bottom")
      .tickFormat(d3.time.format("%Y"));

    var yAxis = d3.svg
      .axis()
      .scale(y)
      .orient("left")
      .tickFormat(function (d) {
        return d / 1000;
      });

    // Clear any existing SVG elements in the graph1 div
    d3.select("#graph1").selectAll("*").remove();

    // Create SVG element in the graph1 div
    var svg = d3
      .select("#graph1")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom * 2.5)
      .append("g")
      .attr("transform", "translate(" + margin.left + ")");

    // Add x-axis
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-65)");

    svg
      .append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(0," + 6 + ")")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -70)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Total Passengers (k)");

    // Define line function
    var line = d3.svg
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.total_crossings);
      });

    // Add line
    svg
      .append("path")
      .datum(filteredData)
      .attr("class", "line")
      .attr("d", line)
      .style("fill", "none") // Ensure there is no fill
      .style("stroke", "steelblue") // Set the stroke color for the line
      .style("stroke-width", "2px"); // Set the stroke width for the line

    console.log("Line Path:", line(filteredData));
  });
}
