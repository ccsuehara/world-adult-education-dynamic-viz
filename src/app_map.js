//Disclaimer: this code relied in these examples:
//https://www.d3-graph-gallery.com/graph/choropleth_basic.html
//http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/
//http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328

var width = 1000,
    height = 450;

var projection = d3.geoNaturalEarth()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var colorScheme = d3.schemeReds[6];
    colorScheme.unshift("black")
var color = d3.scaleThreshold()
    .domain([0, 5, 10, 20, 40, 60])
    .range(colorScheme);

// Legend
var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Population with no education");
var labels = ['No data', '0-5%', '5-10%', '10-20%', '20-40%', '40-60%', '>60%'];
var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(color);
svg.select(".legendThreshold")
    .call(legend);

var yearNow = 1950;

var educationByIdYear = {};

d3.queue()
    .defer(d3.json, "data/raw/world-110m.geojson")
    .defer(d3.csv, "data/clean/no_education_by_country.csv")
    .await(ready);

// when the input range changes update the value 
d3.select("#timeslide").on("input", function() {
    update(+this.value);
    });

// update the fill of each SVG of class "country" with value
function update(value) {
    document.getElementById("range").innerHTML=value; //updates text
    yearNow = value;
    d3.selectAll(".country")
    .attr("year", value)
    .attr("fill", countryYearMatch); //updates year
}

function countryYearMatch(data, value) {
    idYear = data.id.concat(yearNow);
    return color(educationByIdYear[idYear]);
}

function ready(error, world_map, education) {
    if (error) throw error;

    education.forEach(function(d) {
        idYear = d.id.concat(d.year);
        educationByIdYear[idYear] = +d.no_education;
    })
          
    svg.append("g")
        .selectAll("path")
        .data(world_map.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            year = yearNow
            idYear = d.id.concat(year);
            if (idYear in educationByIdYear) {
                return color(educationByIdYear[idYear]);
            } else {
                return "black"
            }
        })
        .attr("stroke", "black")
        .attr("class", "country")
        .attr("year", function(d) {
            year = yearNow
            return year;
        })
        .attr("country_code", function(d) {
            return d.id;
        });
}