export function updateGraph(selectedCode, dataset) {
    d3.json("FINAL_flightsJSON.json", function (error, data) {
      if (error) throw error;
  
      // Log the loaded JSON data
      console.log("Loaded Data:", data);
  
      // Filter data by selected.PortCode value
      var filteredData = data.filter(function (d) {
        return d.PortCode === selectedCode;
      });
  
      // Log the filtered data
      console.log("Filtered Data for Airport selectedCode", selectedCode, ":", filteredData);
  
      if (filteredData.length === 0) {
        console.warn("No data found for the selected airport selectedCode:", selectedCode);
        return; // Exit if no data is found
      }
  
      // Group data by month and year, and calculate total passengers for each month
      var monthlyData = d3
        .nest()
        .key(function (d) {
          return d.Year + "-" + d.Month;
        })
        .rollup(function (v) {
          return d3.sum(v, function (d) {
            return d.total_crossings;
          });
        })
        .entries(filteredData);
  
      // Parse dates and total passengers
      var parseDate = d3.time.format("%Y-%B").parse;
      monthlyData.forEach(function (d) {
        d.date = parseDate(d.key);
        d.total_crossings = +d.values;
      });
  
      console.log("Parsed Monthly Data:", monthlyData);
  
      // Define dimensions for the chart
      var margin = { top: 20, right: 20, bottom: 30, left: 50 };
      var width = 700 - margin.left - margin.right;
      var height = 300 - margin.top - margin.bottom;
  
      // Define scales for x and y axes
      var x = d3.time
        .scale()
        .range([0, width])
        .domain(
          d3.extent(monthlyData, function (d) {
            return d.date;
          })
        );
  
      var y = d3.scale
        .linear()
        .range([height, 0])
        .domain([
          0,
          d3.max(monthlyData, function (d) {
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
  
      // Clear any existing SVG elements in the graph1 div
      d3.select("#graph1").selectAll("*").remove();
  
      // Create SVG element in the graph1 div
      var svg = d3
        .select("#graph1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
      // Add x-axis
      svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(
          d3.svg
            .axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.time.format("%Y-%B"))
        )
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");
  
      // Add y-axis
      svg
        .append("g")
        .attr("class", "y axis")
        .call(d3.svg.axis().scale(y).orient("left"));
  
      // Add line
      svg
        .append("path")
        .datum(monthlyData)
        .attr("class", "line")
        .attr("d", line)
        .style("fill", "none") // Ensure there is no fill
        .style("stroke", "steelblue") // Set the stroke color for the line
        .style("stroke-width", "2px"); // Set the stroke width for the line
  
      console.log("Line Path:", line(monthlyData));
    });
  }
  