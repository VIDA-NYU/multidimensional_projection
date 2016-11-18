//Sonia: word cloud using d3.js
function RadvizWordCloud(){
    this.width = 400;
    this.height = 250;
};

RadvizWordCloud.prototype.wordCloud = function(frequency_list){
  var sizeScale = d3.scale.linear().domain([0, d3.max(frequency_list, function(d) { return d.size} )]).range([10,40]); // 95 because 100 was causing stuff to be missing
  var fill = d3.scale.category20();
  var color =  d3.scale.linear().domain([0, 200, 2000, 5000]).range(["#3182bd", "#6baed6"]).interpolate(d3.interpolateHcl);
  d3.layout.cloud().size([200, 400])
    .words(frequency_list)
    .rotate(0 )//function() { return ~~(Math.random() * 2) * 90; } //rota as  palavras
    .font("Impact")
    .fontSize(function(d) { return sizeScale(d.size); })
    .on("end", draw)
    .start();

  function draw(words) {
      d3.select("#wordCloudR").append("svg")
	  .attr("width", 200)
      .attr("height", 400)
      .append("g")
      .attr("transform", "translate(100, 200)")
      .selectAll("text")
      .data(words)
      .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("font-family", "Impact")
      .style("fill", function(d, i) { return fill(color(d.size)); })
      //.style("fill", function(d, i) { return color(i); })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; });
  }
};
