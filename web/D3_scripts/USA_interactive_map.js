var width = 900;
var height = 500;

var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height)

var usaProjection = d3.geo.albersUsa()
  .scale(600)
  .translate([250, 150])

path = d3.geoPath().projeciton(usaProjection);

pathGenerator = d3.geo.path().projection(usaProjection)
geoJsonUrl = "/USA_map/us_features.json"