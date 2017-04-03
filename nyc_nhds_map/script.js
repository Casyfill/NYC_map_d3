var width = 700, 
    height = 600;



var projection = d3.geo.mercator()
  .center([-73.94, 40.70])
  .scale(50000)
  .translate([(width) / 2, (height) / 2]);

var path = d3.geo.path()
    .projection(projection);



var svg = d3.select("#container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", height)
  .append("g");


var ttip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0); 

// title
var form = d3.select("body")
    .append("div")
    .append("h1")
    .attr('id', 'title')
    .text("StreetEasy Neighborhoods");



function handleMouseOver(d, i) {  // Add interactivity
  console.log(d.properties.name);
    // Use D3 to select element, change color and size
  d3.select(this).style(
      'fill', "rgb(34, 157, 224)")
  .style("fill-opacity",1.0);

    //  // Specify where to put label of text
  ttip.html(d.properties.name)
      .style("left", (d3.event.pageX ) + "px")
      .style("top", (d3.event.pageY - 40) + "px")
      .style( "opacity", 1.0);
}


function handleMouseOut(d, i) {
    
    d3.select(this).attr({
    }).style("fill-opacity", 0);

    ttip.style("opacity",0);
  }

    
  



// var Palletes = [
//   ["#B7F8C7", "#91DFAE", "#70C699", "#52AD89", "#39937A", "#257A6C", "#14615E"],
//   ["#DAF495", "#CAEA8C", "#BAE083", "#AAD67B", "#9BCC73", "#8DC26B", "#7FB964"]
// ];

d3.json("data/parks_t.json", function(error, prks) {

  console.log('parks uploaded')

  var parks = svg.append("g")
      .attr('id','parks')
      .selectAll(".park")
      .data(topojson.feature(prks, prks.objects.parks).features)
      .enter().append("path")
      .attr("class", "park")
      .attr("d", path);


})



d3.json("data/borough.json", function(error, b) {
  console.log('borough uploaded')
  
  var bs = svg.append("g")
      .attr('id','boros')
      .selectAll(".boro")
      .data(b.features)
      .enter().append("path")
      .attr("class", "boro")
      .attr("d", path)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);


})


// d3.json("data/neighborhood.geojson", function(error, nyb) {
//   console.log('nhds uploaded')


//   var nhds = svg.append("g")
//       .attr('id','nhds')
//       .selectAll(".nhd")
//       .data(nyb.features)
//       .enter().append("path")
//       .attr("class", "nhd")
//       .attr("d", path)
//       .attr("id", function(d) {
//       return "nhd " + d.properties.area_id;
//      }).attr("name", function(d) {
//       return d.properties.name;
//      });

// })


d3.select(window).on('resize', sizeChange);

function sizeChange() {
      var mwidth  = Math.min($("#container").width(), width);
      console.log(mwidth)
      d3.select("svg").attr("transform", "scale(" + mwidth/700 + ")");
      $("svg").height($("#container").width()*.86);


}

