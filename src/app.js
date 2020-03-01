
// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
// (I tend to think it's best to use screaming snake case for imported json)
// const domReady = require('domready');

// domReady(() => {
//   // this is just one example of how to import data. there are lots of ways to do it!
//   fetch('./data/example.json')
//     .then(response => response.json())
//     .then(data => myVis(data))
//     .catch(e => {
//       console.log(e);
//     });
// });

// function myVis(data) {
//   // portrait
//   const width = 5000;
//   const height = (36 / 24) * width;
//   console.log(data, height);
//   console.log('Hi!');
//   // EXAMPLE FIRST FUNCTION
// }



function area_graph(dataset,max_val) {
// set the dimensions and margins of the graph
  var margin = {top: 60, right: 230, bottom: 50, left: 50},
      width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#area_chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  d3.csv(dataset, function(data) {



  //////////
  // GENERAL //
  //////////

  // List of groups = header of the csv files
    var keys = data.columns.slice(1)

  // color palette
    var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeRdBu[4]);

  //stack the data?
    var stackedData = d3.stack()
    .keys(keys)
    (data)

//Adds the title to my graph
    svg.append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Education levels have improved around the world")
    .style("font", "23px avenir")
    .style("fill", "#000000");

//Adds the subtitle to my graph
    svg.append("text")
    .attr("x", 0)
    .attr("y", -35)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Percentage of population in each education level")
    .style("font", "18px avenir")
    .style("fill", "#000000");


//Adds the source at the bottom of the page
    svg.append("text")
    .attr("x", 0)
    .attr("y", 370)
    .attr("dy", "1em")
    .style("font", "12px avenir")
    .style("fill", "#000000")
    .text("Source: Barro-Lee datasets");

  //////////
  // AXIS //
  //////////

  // Add X axis
    var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);
    var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(5))

  // Add X axis label:
    svg.append("text")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height+40 )
      .text("year");



  // Add Y axis
    var y = d3.scaleLinear()
    .domain([0, max_val])
    .range([ height, 0 ]);
    svg.append("g")
    .call(d3.axisLeft(y).ticks(5))



  //////////
  // BRUSHING AND CHART //
  //////////

  // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);

  // Add brushing
    var brush = d3.brushX()                 // Add the brush feature using the d3.brush function
      .extent( [ [0,0], [width,height] ] ) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("end", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function

  // Create the scatter variable: where both the circles and the brush take place
  var areaChart = svg.append('g')
    .attr("clip-path", "url(#clip)")

  // Area generator
    var area = d3.area()
    .x(function(d) { return x(d.data.year); })
    .y0(function(d) { return y(d[0]); })
    .y1(function(d) { return y(d[1]); })

  // Show the areas
    areaChart
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
      .attr("class", function(d) { return "myArea " + d.key })
      .style("fill", function(d) { return color(d.key); })
      .attr("d", area)

  // Add the brushing
    areaChart
    .append("g")
      .attr("class", "brush")
      .call(brush);

    var idleTimeout
    function idled() { idleTimeout = null; }

  // A function that update the chart for given boundaries
  function updateChart() {

    extent = d3.event.selection

    // If no selection, back to initial coordinate. Otherwise, update X axis domain
    if(!extent){
      if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
      x.domain(d3.extent(data, function(d) { return d.year; }))
    }else{
      x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
      areaChart.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
    }

    // Update axis and area position
    xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5))
    areaChart
      .selectAll("path")
      .transition().duration(1000)
      .attr("d", area)
    }



    //////////
    // HIGHLIGHT GROUP //
    //////////

    // What to do when one group is hovered
    var highlight = function(d){
      console.log(d)
      // reduce opacity of all groups
      d3.selectAll(".myArea").style("opacity", .1)
      // expect the one that is hovered
      d3.select("."+d).style("opacity", 1)
    }

    // And when it is not hovered anymore
    var noHighlight = function(d){
      d3.selectAll(".myArea").style("opacity", 1)
    }
   


    //////////
    // LEGEND //
    //////////



    // Add one dot in the legend for each name.
    var size = 20
    svg.selectAll("myrect")
      .data(keys)
      .enter()
      .append("rect")
        .attr("x", 600)
        .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", 600 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){ return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

 });
}

function scatterPlot(datafile){
  var margin = { top: 30, right: 200, bottom: 40, left: 200};
        var width = 1400 - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;


    var svg = d3.select("body")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var xscale = d3.scaleLinear()
    .domain([0,15])
    .range([0,width]);

  var yscale = d3.scaleLinear()
    .domain([0,15])
    .range([height,0]);

  var radius = d3.scaleSqrt()
    .range([2,7]);

  var xAxis = d3.axisBottom()
    .tickSize(-height)
    .scale(xscale);

  var yAxis = d3.axisLeft()
    .tickSize(-width)
    .scale(yscale)

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  d3.csv(datafile, function(error, data) {
    // data pre-processing
    data.forEach(function(d) {
      d.y = +d["2010"];
      d.x = +d["1950"];
      d.r = +d["1975"];
    });

    data.sort(function(a,b) { return b.r - a.r; });

    // yscale.domain(d3.extent(data, function(d) {
    //   return d.y;
    // })).nice();

    radius.domain(d3.extent(data, function(d) {
      return d.r;
    })).nice();

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(xAxis);

    svg.append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "y axis")
      .call(yAxis);

    var group = svg.selectAll("g.bubble")
      .data(data)
      .enter().append("g")
      .attr("class", "bubble")
      .attr("transform", function(d) {
        return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")"
      });

    var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

    var tipMouseover = function(d) {
                    // var color = scaleOrdinal(d.region_code);
                    var html  = d.country + "<br/>" +
                                 d['1950'] + "</b> before <b/>" + "<br/>" +
                                 d['2010'] + "</b> after <b/>"+ "<br/>" +
                                 d['1975'] + "</b> population <b/>"

                    tooltip.html(html)
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                      .transition()
                        .duration(200) // ms
                        .style("opacity", .9) // started as 0!

                };

    // tooltip mouseout event handler
    var tipMouseout = function(d) {
                    tooltip.transition()
                        .duration(500) // ms
                        .style("opacity", 0); // don't care about position!
                };


    group
      .append("circle")
      .attr("r", function(d) { return radius(d.r);  })
      .style("fill", function(d) {
        return color(d["region_code"]);
      })
      .on("mouseover", tipMouseover)
      .on("mouseout", tipMouseout)
      .merge(group)
      .transition()
        .duration(3000);

    // group
    //   .append("text")
    //   .attr("x", function(d) { return radius(d.r); })
    //   .attr("alignment-baseline", "middle");
      // .text(function(d) {
      //   return d["country"];  
      // });

    svg.append("text")
      .attr("x", 6)
      .attr("y", -2)
      .attr("class", "label")
      .text("Years of Education (2010)");

    svg.append("text")
      .attr("x", width-2)
      .attr("y", height-6)
      .attr("text-anchor", "end")
      .attr("class", "label")
      .text("Years of Education (1950)");

             // add diagonal line
     svg.append("line")
              .attr("x1", xscale(0))
              .attr("y1", yscale(0))
              .attr("x2", xscale(15))
              .attr("y2", yscale(15))
              .attr("stroke-width", 2)
              .attr("stroke", "gray")
              .attr("stroke-dasharray", "2,5")  //style of svg-line
              ;

    var buble_legend = svg.selectAll(".buble_legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "buble_legend")
        .attr("transform", function(d, i) { return "translate(2," + i * 15 + ")"; });

    buble_legend.append("rect")
        .attr("x", width)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);

    buble_legend.append("text")
        .attr("x", width + 20)
        .attr("y", 6)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

    buble_legend.on("mouseover", function(type) {
        d3.selectAll(".buble_legend")
          .style("opacity", 0.1);
        d3.select(this)
          .style("opacity", 1);
        d3.selectAll(".bubble")
          .style("opacity", 0.1)
          .filter(function(d) { return d["region_code"] == type; })
          .style("opacity", 1);
      })
      .on("mouseout", function(type) {
        d3.selectAll(".buble_legend")
          .style("opacity", 1);
        d3.selectAll(".bubble")
          .style("opacity", 1);
      });
  });

}

function update(datafile){

  var svg = svgx

  var xscale = d3.scaleLinear()
    .domain([0,15])
    .range([0,width]);

  var yscale = d3.scaleLinear()
    .domain([0,15])
    .range([height,0]);

  var radius = d3.scaleSqrt()
    .range([2,7]);

  var xAxis = d3.axisBottom()
    .tickSize(-height)
    .scale(xscale);

  var yAxis = d3.axisLeft()
    .tickSize(-width)
    .scale(yscale)

  var color = d3.scaleOrdinal(d3.schemeCategory10);

  d3.csv(datafile, function(error, data) {
    // data pre-processing
    data.forEach(function(d) {
      d.y = +d["2010"];
      d.x = +d["1950"];
      d.r = +d["1975"];
    });

    data.sort(function(a,b) { return b.r - a.r; });

    // yscale.domain(d3.extent(data, function(d) {
    //   return d.y;
    // })).nice();

    radius.domain(d3.extent(data, function(d) {
      return d.r;
    })).nice();

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(xAxis);

    svg.append("g")
      .attr("transform", "translate(0,0)")
      .attr("class", "y axis")
      .call(yAxis);

    var group = svg.selectAll("g.bubble")
      .data(data)
      .enter().append("g")
      .attr("class", "bubble")
      .attr("transform", function(d) {
        return "translate(" + xscale(d.x) + "," + yscale(d.y) + ")"
      });

    var tooltip = d3.select("body").append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

    var tipMouseover = function(d) {
                    // var color = scaleOrdinal(d.region_code);
                    var html  = d.country + "<br/>" +
                                 d['1950'] + "</b> before <b/>" + "<br/>" +
                                 d['2010'] + "</b> after <b/>"+ "<br/>" +
                                 d['1975'] + "</b> population <b/>"

                    tooltip.html(html)
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                      .transition()
                        .duration(200) // ms
                        .style("opacity", .9) // started as 0!

                };

    // tooltip mouseout event handler
    var tipMouseout = function(d) {
                    tooltip.transition()
                        .duration(500) // ms
                        .style("opacity", 0); // don't care about position!
                };


    group
      .append("circle")
      .attr("r", function(d) { return radius(d.r);  })
      .style("fill", function(d) {
        return color(d["region_code"]);
      })
      .on("mouseover", tipMouseover)
      .on("mouseout", tipMouseout)
      // .merge(group)
      .transition()
        .duration(3000);

    // group
    //   .append("text")
    //   .attr("x", function(d) { return radius(d.r); })
    //   .attr("alignment-baseline", "middle");
      // .text(function(d) {
      //   return d["country"];  
      // });

    svg.append("text")
      .attr("x", 6)
      .attr("y", -2)
      .attr("class", "label")
      .text("Years of Education (2010)")
      .transition()
        .duration(3000);;

    svg.append("text")
      .attr("x", width-2)
      .attr("y", height-6)
      .attr("text-anchor", "end")
      .attr("class", "label")
      .text("Years of Education (1950)")
      .transition()
        .duration(3000);;

             // add diagonal line
     svg.append("line")
              .attr("x1", xscale(0))
              .attr("y1", yscale(0))
              .attr("x2", xscale(15))
              .attr("y2", yscale(15))
              .attr("stroke-width", 2)
              .attr("stroke", "gray")
              .attr("stroke-dasharray", "2,5")
              .transition()
                .duration(3000);  //style of svg-line
             

    var buble_legend = svg.selectAll(".buble_legend")
        .data(color.domain())
      .enter().append("g")
        .attr("class", "buble_legend")
        .attr("transform", function(d, i) { return "translate(2," + i * 15 + ")"; });

    buble_legend.append("rect")
        .attr("x", width)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", color);

    buble_legend.append("text")
        .attr("x", width + 20)
        .attr("y", 6)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function(d) { return d; });

    buble_legend.on("mouseover", function(type) {
        d3.selectAll(".buble_legend")
          .style("opacity", 0.1);
        d3.select(this)
          .style("opacity", 1);
        d3.selectAll(".bubble")
          .style("opacity", 0.1)
          .filter(function(d) { return d["region_code"] == type; })
          .style("opacity", 1);
      })
      .on("mouseout", function(type) {
        d3.selectAll(".buble_legend")
          .style("opacity", 1);
        d3.selectAll(".bubble")
          .style("opacity", 1);
      });
  });
}

