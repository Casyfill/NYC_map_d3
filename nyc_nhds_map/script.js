var max_height = 600,
    max_width = 600;

var t = textures.lines()
          .size(4)
          .strokeWidth(.5)
          .stroke("#004C74")
          .background("#D4ECFA");

var t2 = textures.lines()
                .size(4)
                .strokeWidth(.5)
                .stroke("#004C74")
                .background("white");

var svg = d3.select("#container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", max_height)

svg.call(t);
svg.call(t2);


var projection = d3.geoMercator()
  .center([-74.04, 40.70])
  .scale(50000)
  .translate([(max_width) / 2, (max_height) / 2]);

var path = d3.geoPath()
    .projection(projection);



function ready(error, boundaries, csv_data){
  if (error) throw error;

  boundaries.features.forEach(function(d){
    var value = csv_data.filter(function(dd){return d['properties']['area_id'] == dd['area_id']})[0];
    if(!value || value = ''){d['properties']['value'] = null} else {d['properties']['value']=value['value']}
  })

  // var ttip = d3.select("body").append("div")
  //   .attr("class", "tooltip")
  //   .style("opacity", 0);
  var max_value = d3.max( boundaries.features, function(d) { return d['properties']['value'] });
  var median_value = d3.median( boundaries.features, function(d) { return d['properties']['value'] });
  var color_scale = d3.scaleLinear().domain([0, median_value, max_value]).range(['white', '#4BDDC2', '#004C74']);
  colorbar(median_value, max_value);

  // var parks = svg.append("g").attr('id','parks');
  var bs = svg.append("g").attr('id','boros');
  var nhds = svg.append("g").attr('id','nhds');

  // infoblock
  // var card = svg.append("g")
  //     .attr("id", "infocard")
  //     .attr("transform", "translate(0,50)");
  //
  // var card_back = card.append("rect")
  //     .attr("id", 'cardBack')
  //     .attr("width", 310)
  //     .attr("height", 100);
  //
  // var nhd_name = card.append("text")
  //                    .attr('id', 'tooltip')
  //                    .attr("x", 10)
  //                    .attr("y", 25);

  bs.selectAll(".boro")
    .data(boundaries.features.filter(function(d){return d["properties"]['area_type']=="borough"}))
    .enter().append("path")
    .attr("class", "boro")
    .attr("name", function(d) { return d.properties.name;})
    .attr("d", path)
    .style("fill", t.url());

  nhds.selectAll(".nhd")
      .data(boundaries.features.filter(function(d){return d["properties"]['area_type']=="neighborhood"}))
      .enter().append("path")
      .attr("class", "hood")
      .attr("d", path)
      .attr("name", function(d) { return d.properties.name;})
      .style('fill', function(d) { return color_scale(d['properties']['value'])})
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);


  // Functions

    function handleMouseOver(d, i) {  // Add interactivity
      console.log(d);
        // Use D3 to select element, change color and size
      d3.select(this)
        .transition()
        .style('fill', "#FDC436");

      tooltip.transition()
             .duration(200)
            .style("opacity", .9);

      tooltip.html('Hello')
             .style("left", (d3.event.pageX) + "px")
             .style("top", (d3.event.pageY - 28) + "px");


        //  // Specify where to put label of text
      // ttip.html(d.properties.name)
      //     .style("left", (d3.event.pageX ) + "px")
      //     .style("top", (d3.event.pageY - 40) + "px")
      //     .style( "opacity", 1.0);
      //
      // nhd_name.text(d.properties.name)
    }


    function handleMouseOut(d, i) {

        d3.select(this)
          .transition()
          .style('fill', function(d){return color_if_not_Null(d['properties']['value'])});

        tooltip.transition()
               .duration(500)
               .style("opacity", 0);
        //
        // ttip.style("opacity",0);
        // nhd_name.text('');
      }

}


d3.queue(2)
  .defer(d3.json, "data/boundaries.json")
  .defer(d3.csv, "data/example.csv")
  .await(ready);


function or_null(value){
    if (value === 'undefined') {
        value = null;
       }
    return value;
}

// RESIZE

// d3.select(window).on('resize', sizeChange);

// function sizeChange() {
//       var mwidth  = Math.min($("#container").width(), max_width);
//       console.log(mwidth)
//       d3.select("svg").attr("transform", "scale(" + mwidth/700 + ")");
//       $("svg").height(Math.min($("#container").width()*.86, max_height));
// }

function color_if_not_Null(value){
  if(value != 'undefined' &&
     value != 'NaN' &&
     value != null &&
     value != ''){
       return color_scale(value)
    } else {
      return t2.call()
    }
}

// tooltip

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Colorbar

function colorbar(d_median, d_max){
      var key = svg.append('g')
                   .attr("id", "legend")
                   .attr("width", 300).attr("height", 120)
                   .attr("transform", "translate(280,520)");

      var legend = key.append("defs").append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("y1", "100%").attr("x1", "0%")
        .attr("y2", "100%").attr("x2", "100%")
        .attr("spreadMethod", "pad");

      legend.append("stop").attr("offset", "0%")
        .attr("stop-color", 'white')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "50%")
        .attr("stop-color", '#4BDDC2')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "100%")
        .attr("stop-color", '#004C74')
        .attr("stop-opacity", 1);

      key.append("rect")
         .attr("width", 300)
         .attr("height", 10)
         .style("fill", "url(#gradient)")

      var y = d3.scaleLinear().range([0, 150, 300]).domain([0, d_median, d_max]);
      var yAxis = d3.axisBottom(y).ticks(5);

      key.append("g")
         .attr("class", "y axis")
         .call(yAxis)
         .attr("transform", "translate(0, 15)")
        //  .append("text")
      //    .attr("dy", ".62em")
      //    .style("text-anchor", "end")
      //    .text('Median asking price');


}
