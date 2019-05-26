import * as d3 from './d3.min.js';



export default class RadarPlot {

  constructor(root_group, width, centre, axes, datasets, lineColours, title) {

    this.root_group = root_group;
    this.width = width;
    this.centre = centre;
    this.axes = axes;
    this.datasets = datasets;
    this.title = title;

    this.lineColours = lineColours;

    this.radialOffset = 0.33;

    //set placement
    this.plot = this.root_group.append("g")
      .attr("transform", "translate(" + (this.centre[0]-this.width/2) + "," + (this.centre[1]-this.width/2) + ")");
    this.popup = this.root_group.append("g");

    //get log values of data
    this.dataLabels = []
    this.dataArray = []
    this.maxes = []


    for (var i = 0; i < datasets.length; i++) {
      this.dataLabels.push(Object.values(this.datasets[i]));
      this.dataArray.push(this.dataLabels[i].map(function(x) {
        let val = parseFloat(x);
        if (+val === +val) {
          return Math.log10(val + 1);
        }
        else {
          return 0;
        }
      }));

      let max = Math.max(...this.dataArray[i]);
      this.maxes.push(max * 1.1);
    }

    console.log(this.dataArray);

    this.renderTitle();
    this.renderAxes();
    this.renderDataLines();
    this.renderPoints();
    this.renderIcons();


  }

  //add title in centre of diagrams
  renderTitle() {
    this.plot.append("text")
    .classed("diagramTitle", true)
    .classed("diagramSubTitle", true)
    .text("deaths per")
    .attr("x",this.width/2)
    .attr("y",this.width/2 - (this.width * 0.05))
    .style("font-size","2vh")

    this.plot.append("text")
    .classed("diagramTitle", true)
    .text(this.title)
    .attr("x",this.width/2)
    .attr("y",this.width/2 + (this.width * 0.07))
  }

  //render line corresponding to data
  renderDataLines(){

    for (var j = 0; j < this.datasets.length; j++) {

      let data = this.dataArray[j]
      let min = Math.min(...data);
      let radius = this.width / 2;
      let angleGap = 2 * Math.PI / data.length;

      //break array into chunks to leave out 0 values
      let lines = [];
      let line = [];
      let zeroValues = 0;
      for (var i = 0; i < data.length; i++) {
        if (data[i] != 0){
          line.push(data[i])
        }
        else {
          zeroValues++;
          if (line.length != 0){
            lines.push(line);
            line = [];
          }
        }
      }
      lines.push(line);

      //link first and last lines if possible (if first and last elements are not 0)
      let startPoint = 0;
      //if there is more than 1 line, join last and first
      if (lines.length > 1){
        if (data[data.length-1] != 0 && data[0] != 0) {
          let firstLine = lines[0];
          startPoint = firstLine.length + zeroValues
          lines.shift();
          lines[lines.length-1] = lines[lines.length-1].concat(firstLine);
        }
      }
      //if only one line, add extra elememt to it
      else {
        lines[0].push(lines[0][0]);
      }

      //more compact offset names
      let radOff = this.radialOffset;
      let invRadOff = 1.0 - this.radialOffset;

      var lineDrawer = d3.lineRadial()
          .angle(function(d,n) { return angleGap*(startPoint+n); })
          .radius((d) => { return (radOff + (d / this.maxes[j] * invRadOff)) * radius ; })
          .curve(d3.curveCatmullRom);

      //draw line
      lines.forEach((l) => {
        this.plot.append("path")
          .attr("transform", "translate(" + this.width/2 + "," + this.width/2 + ")")
          .classed("dataLine", true)
          .attr("d", lineDrawer(l))
          .style("stroke", this.lineColours[j])

        startPoint+=l.length+1;
      })

    }

  }

  //render a radial axis for each data point received
  renderAxes(){
    let numAxes = this.axes.length;
    let radius = this.width / 2;
    let angleGap = 2 * Math.PI / numAxes;
    var lineGenerator = d3.line();

    //more compact offset names
    let radOff = this.radialOffset;
    let invRadOff = 1.0 - this.radialOffset;

    //for each data point
    for (var i = 0; i < numAxes; i++) {
      //draw axes lines
      let angle = angleGap * i;
      let data = [[(this.width/2) + (radius * this.radialOffset * Math.sin(angle)), (this.width/2) - (radius * this.radialOffset    * Math.cos(angle))], [(this.width/2) + (radius * Math.sin(angle)), (this.width/2) - (radius * Math.cos(angle))]];
      //draw axis from centre to target point
      this.plot.append("path")
        .classed("axis", true)
        .attr("d", lineGenerator(data))

    }

    //circles?
    this.plot.append("circle")
      .classed("titleCircles",true)
      .attr("cx",this.width/2)
      .attr("cy",this.width/2)
      .attr("r", this.width/2*radOff)

  }

  renderPoints(){


    for (var j = 0; j < this.datasets.length; j++) {

      let angleGap = 2 * Math.PI / this.dataArray[j].length;
      let radius = this.width/2;

      let pointData = this.dataArray[j];

      //more compact offset names
      let radOff = this.radialOffset;
      let invRadOff = 1.0 - this.radialOffset;

      this.dataArray[j].forEach((d,i) => {
        if (d != 0){

          this.plot.append("circle")
            .classed("point", true)
            .attr("cx", radius + ((radOff + d/this.maxes[j]*invRadOff)*radius * Math.sin(angleGap*i)))
            .attr("cy", radius - ((radOff + d/this.maxes[j]*invRadOff)*radius * Math.cos(angleGap*i)))
            .style("opacity", () => {
              if (d===0){return 0.0}
              return 1.0
            })
            .style("fill",this.lineColours[j])

          //wider transparent circle for hovering
          this.plot.append("circle")
            .classed("hoverPoint", true)
            .attr("cx", radius + ((radOff + d/this.maxes[j]*invRadOff)*radius * Math.sin(angleGap*i)))
            .attr("cy", radius - ((radOff + d/this.maxes[j]*invRadOff)*radius * Math.cos(angleGap*i)))
            .attr("val",this.dataLabels[j][i])
            .on("mouseover", this.showValue)
            .on("mouseout", this.hideValue)
            .style("fill",this.lineColours[j])
        }
      })

    }
  }

  renderIcons(){


    let axesArray = Object.values(this.axes);
    let angleGap = 2 * Math.PI / axesArray.length;
    let iconRadius = this.width * 0.45;
    let iconSize = this.width * 0.1;
    let angleOffset = angleGap * 0.3;

    this.plot.selectAll("image")
    .data(axesArray).enter()
    .append("image")
      .classed("icon", true)
      .attr("x", (d,i) => {
        return this.width/2 + (iconRadius * Math.sin(angleGap*i - angleOffset)) - (iconSize/2);
      })
      .attr("y", (d,i) => {
        return this.width/2 - (iconRadius * Math.cos(angleGap*i - angleOffset)) - (iconSize/2);
      })
      .attr('xlink:href', (d) => {
        return "images/icons/" + d + ".png";
          // return "images/icons/" + d + ".bmp";
      })
      .attr('width', iconSize)
      .attr('height', iconSize)
      .attr("tooltip", (d) => {return d;})
      .on("mouseover", this.showTooltip)
      .on("mouseout", this.hideTooltip)
  }

  showValue(c){

    d3.select(this).style("opacity",1.0);

    d3.select("svg").append("g")
      .attr("id","popup")
      .style("opacity",0)

    d3.select("#popup").transition()
     .duration(400)
     .style("opacity", 1.0);

    let width = d3.select("svg").attr("width");
    let height = d3.select("svg").attr("height");
    let container_x_offset = d3.select("svg").node().getBoundingClientRect().x;
    let container_y_offset = d3.select("svg").node().getBoundingClientRect().y;

    let x_offset = width * 0.02;
    let y_offset = width * 0.02;

    d3.select("#popup").append("rect")
      .classed("popupbox", true)
      .attr("x",d3.event.pageX - container_x_offset + x_offset)
      .attr("y",d3.event.pageY - container_y_offset + y_offset)
      .attr("rx",width*0.005)
      .attr("ry",width*0.005)
    d3.select("#popup").append("text")
      .classed("popupbox", true)
      .text(d3.select(this).attr("val"))
      .attr("x",d3.event.pageX - container_x_offset + x_offset + width*0.045)
      .attr("y",d3.event.pageY - container_y_offset + y_offset + height*0.02)
  }

  hideValue(c){
    d3.select(this).style("opacity",0);
    let duration = 200;

    d3.select("#popup").transition()
     .duration(duration)
     .style("opacity", 0.0);

    setTimeout(() => {
       d3.select("#popup").remove();
    }, (duration*1.01));


  }

  showTooltip(c){
    // d3.select(this).style("opacity",1.0);

    d3.select("svg").append("g")
      .attr("id","popup")
      .style("opacity",0)

    d3.select("#popup").transition()
     .duration(200)
     .style("opacity", 1.0);

    let width = d3.select("svg").attr("width");
    let height = d3.select("svg").attr("height");
    let container_x_offset = d3.select("svg").node().getBoundingClientRect().x;
    let container_y_offset = d3.select("svg").node().getBoundingClientRect().y;
    let x_offset = width * 0.02;
    let y_offset = width * 0.02;

    d3.select("#popup").append("rect")
      .classed("popupbox", true)
      .attr("x",d3.event.pageX - container_x_offset)
      .attr("y",d3.event.pageY - container_y_offset + y_offset)
      .attr("rx",width*0.005)
      .attr("ry",width*0.005)
    d3.select("#popup").append("text")
      .classed("popupbox", true)
      .text(d3.select(this).attr("tooltip"))
      .attr("x",d3.event.pageX - container_x_offset + x_offset + width*0.045)
      .attr("y",d3.event.pageY - container_y_offset + y_offset + height*0.02)
  }

    hideTooltip(c){
      // d3.select(this).style("opacity",0);
      let duration = 100;

      d3.select("#popup").transition()
       .duration(duration)
       .style("opacity", 0.0);

      setTimeout(() => {
         d3.select("#popup").remove();
      }, (duration*1.01));


    }



}
