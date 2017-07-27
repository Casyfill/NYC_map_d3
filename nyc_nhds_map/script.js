// version 0.2.1
var max_height = 500,
    max_width = 600;

var t = textures.lines()
          .size(4)
          .strokeWidth(.5)
          .stroke("#004C74")
          .background("#D4ECFA");

var t2 = textures.lines()
                .size(4)
                .strokeWidth(.5)
                .stroke('#4BDDC2')
                .background("white");

var svg = d3.select("#container")
            .append("svg")
            .attr("width", "100%")
            .attr("height", max_height)


svg.call(t);
svg.call(t2);


var infodiv = d3.select('#container')
                .append("div")
                .attr("id", "infodiv")


// var curr_format = d3.format("$,.0f")
var pct_format = d3.format(".1%")
var projection = d3.geoMercator()
  .center([-73.92, 40.74])
  .scale(55000)
  .translate([(max_width) / 2, (max_height) / 2]);

var path = d3.geoPath()
    .projection(projection);



function ready(error, boundaries, data){
  if (error) throw error;
  console.log(boundaries);
  
  d3.select("h1")
    .text(data['title'])

  d3.select("h2")
    .text(data['subtitle'])

  var datas = data['data']

  boundaries.features = boundaries.features.filter(function(dd){ return dd['properties']['Borough'] != "Staten Island"});
  console.log(boundaries);

  boundaries.features.forEach(function(d){
    var value = datas.filter(function(dd){return d['properties']['area_id'] == dd['area_id']})[0];
    if(!value || value == ''){d['properties']['value'] = null} else {d['properties']['value']=value['value']}
  })

  var max_value = d3.max( boundaries.features, function(d) { return d['properties']['value'] });
  var median_value = d3.median( boundaries.features, function(d) { return d['properties']['value'] });
  var color_scale = d3.scaleLinear().domain([0, median_value, max_value]).range(['#D4ECFA', '#53baf3', '#004C74']);
  colorbar(median_value, 1);

  function color_if_not_Null(value){
    if(value != 'undefined' &&
       value != 'NaN' &&
       value != null &&
       value != ''){
         return color_scale(value)
      } else {
        return t2.url()
      }
  }


  var bs = svg.append("g").attr('id','boros');
  var nhds = svg.append("g").attr('id','nhds');

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
      .style('fill', function(d) { return color_if_not_Null(d['properties']['value'])})
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);



function TooltipPos(mouseX){
  if (mouseX < 450){
    return mouseX + 10
  } else {
    return mouseX - 200
  }
}


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

      tooltip.style("left", TooltipPos(d3.event.pageX) + "px")
             .style("top", (d3.event.pageY) + "px");

      tooltip.select('h4')
             .text(d.properties.name)

      tooltip.select('p')
             .text(data['variable']  + ' ' + or_NA(d.properties.value))


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
  .defer(d3.json, "data/var/" +  getParameterByName('data') + '.json')
  .await(ready);


function or_null(value){
    if (value === 'undefined') {
        value = null;
       }
    return value;
}


function or_NA(value){
    if (value === '' || value === null) {
        value = "NA";
       } else {
        value = pct_format(value)
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



// tooltip

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

tooltip.append('h4');
tooltip.append('p');

// Colorbar

function colorbar(d_median, d_max){
      var key = svg.append('g')
                   .attr("id", "legend")
                   .attr("width", 120).attr("height", 300)
                   .attr("transform", "translate(12,25)");

      var legend = key.append("defs").append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("y1", "100%").attr("x1", "0%")
        .attr("y2", "0%").attr("x2", "0%")
        .attr("spreadMethod", "pad");

      legend.append("stop").attr("offset", "0%")
        .attr("stop-color", '#D4ECFA')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "50%")
        .attr("stop-color", '#53baf3')
        .attr("stop-opacity", 1);

      legend.append("stop").attr("offset", "100%")
        .attr("stop-color", '#004C74')
        .attr("stop-opacity", 1);

      key.append("rect")
         .attr("width", 10)
         .attr("height", 300)
         .style("fill", "url(#gradient)")

      var y = d3.scaleLinear().range([0, 300]).domain([1, 0]);
      var yAxis = d3.axisRight(y)
                    .tickValues([0, .5, 1])
                    .tickFormat(pct_format);

      key.append("g")
         .attr("class", "y axis")
         .call(yAxis)
         .attr("transform", "translate(15, 0)")
        //  .append("text")
      //    .attr("dy", ".62em")
      //    .style("text-anchor", "end")
      //    .text('Median asking price');


}



function getParameterByName(name, url) {
     if (!url) url = window.location.href;
     name = name.replace(/[\[\]]/g, "\\$&");
     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
     if (!results) return 'example';
     if (!results[2]) return '';
     return decodeURIComponent(results[2].replace(/\+/g, " ")).replace(/\"/g, ""); //Remove qoutes
    }

