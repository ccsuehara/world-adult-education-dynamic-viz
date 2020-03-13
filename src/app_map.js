//Disclaimer: this code relied in these examples:
//https://www.d3-graph-gallery.com/graph/choropleth_basic.html
//http://duspviz.mit.edu/d3-workshop/mapping-data-with-d3/
//http://bl.ocks.org/palewire/d2906de347a160f38bc0b7ca57721328
//https://blockbuilder.org/micahstubbs/d393bcfde0228430c00b

var width = 1000,
    height = 450;

var projection = d3.geoNaturalEarth()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])

var path = d3.geoPath()
    .projection(projection);

var svg = d3.select("#theMap").append("svg")
    .attr("width", width)
    .attr("height", height);

var colorScheme = d3.schemeReds[6];
    colorScheme.unshift("black")
var colorNoEducation = d3.scaleThreshold()
    .domain([0, 5, 10, 20, 40, 60])
    .range(colorScheme);
var colorNoSecondary = d3.scaleThreshold()
    .domain([0, 20, 40, 60, 75, 90])
    .range(colorScheme);
var colorGenderGap = d3.scaleThreshold()
    .domain([-30, 3, 6, 9, 15, 20])
    .range(colorScheme)

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
    .labels(function (d) {
        return labels[d.i];
    })
    .shapePadding(4)
    .scale(colorNoEducation);
svg.select(".legendThreshold")
    .call(legend);

var noEducationLabels = {
    0: "No data",
    1: "0-5%",
    2: "5-10%",
    3: "10-20%",
    4: "20-40%",
    5: "40-60%",
    6: ">60%"
}

var secondaryLabels = {
    0: "No data",
    1: "0-20%",
    2: "20-40%",
    3: "40-60%",
    4: "60-75%",
    5: "75-90%",
    6: ">90%"
}

var genderGapLabels = {
    0: "No data",
    1: "< 3 pp",
    2: "3-6 pp",
    3: "6-9 pp",
    4: "9-15 pp",
    5: "15-20 pp",
    6: ">20 pp"
}

var yearNow = 1950;

var indicator = "no_education";

var indicators_dict = {
	"no_education": "Population with no education",
	"secondary_incomplete": "Population with incomplete secondary education",
	"gap_female-male_no-education": "Gap female-male population with no education",
	"gap_female-male_secondary-incomplete": "Gap female-male population with no secondary education"
}

var educationByIdYearIndicator = {};

d3.queue()
    .defer(d3.json, "data/raw/world-110m.geojson")
    .defer(d3.csv, "data/clean/data_by_year-country_indicators.csv")
    .await(ready);

// update when timeslide changes
d3.select("#timeslide").on("input", function() {
    update(+this.value);
    });

//update when dropdown menu changes
d3.select("#indicatorList").on("change", function() {
	updateFromDropdown(this.value);
})

// update the fill of each SVG of class "country" with value
function update(value) {
    document.getElementById("range").innerHTML=value;
    yearNow = value;
    d3.selectAll(".country")
    .attr("year", value)
    .attr("fill", countryYearMatch)
    .attr("percentage", percentage);
}

function updateFromDropdown(value) {
	indicator = value;
	d3.selectAll(".country")
	   .attr("indicator", value)
	   .attr("fill", countryYearMatch)
        .attr("percentage", percentage);
	d3.selectAll(".caption")
        .text(indicators_dict[value]);
    d3.selectAll(".label")
        .text(function(d, i) {
            if (indicator == "no_education") {
                return noEducationLabels[i];
            } else if (indicator == "secondary_incomplete") {
                return secondaryLabels[i];
            } else if (indicator == "gap_female-male_no-education") {
                return genderGapLabels[i];
            } else {
                return genderGapLabels[i]
            }
        });
}

function percentage(data, value) {
    idYear = data.id.concat(yearNow).concat(indicator);
    return educationByIdYearIndicator[idYear];
}

function countryYearMatch(data, value) {
    idYear = data.id.concat(yearNow).concat(indicator);
    perc = educationByIdYearIndicator[idYear];
    if (indicator == "no_education") {
        return colorNoEducation(perc);
    } else if (indicator == "secondary_incomplete") {
        return colorNoSecondary(perc);
    } else if (indicator == "gap_female-male_no-education") {
        return colorGenderGap(perc);
    } else {
        return colorGenderGap(perc);
    }
}

function ready(error, world_map, education) {
    if (error) throw error;

    education.forEach(function(d) {
        idYearIndicator = d.id.concat(d.year).concat(d.indicator);
        educationByIdYearIndicator[idYearIndicator] = +d.percentage;
    });

    svg.append("g")
        .selectAll("path")
        .data(world_map.features)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            idYearIndicator = d.id.concat(yearNow).concat(indicator);
            if (idYearIndicator in educationByIdYearIndicator) {
                return colorNoEducation(educationByIdYearIndicator[idYearIndicator]);
            } else {
                return "black";
            }
        })
        .attr("stroke", "black")
        .attr("class", "country")
        .attr("year", yearNow)
        .attr("country_code", function(d) {
        	return d.id;
        })
        .attr("indicator", indicator)
        .attr("percentage", function(d) {
            idYearIndicator = d.id.concat(yearNow).concat(indicator);
            return educationByIdYearIndicator[idYearIndicator];
        });
}