import * as d3 from './modules/d3.min.js';
import RadarPlot from './modules/RadarPlot.js';
import DataLoader from './modules/DataLoader.js';
import MultiRadarPlot from './modules/MultiRadarPlot.js';




//icon credit:
// <a href="https://www.freepik.com/free-photos-vectors/icon">Icon vector created by freepik - www.freepik.com</a>


let dataLoader = new DataLoader();

const svg_width = window.innerWidth * 0.7;
const svg_height = window.innerHeight;

//main svg container
let svgContainer = d3.select("body").append("svg")
  .attr("width", svg_width)
  .attr("height", svg_height)
  .attr("id", "main_svg")

const chartWidth = svg_width * 0.25;
const largeChartWidth = svg_width * 0.5;

const chart1Centre = [svg_width*0.35,svg_height*0.2];
const chart2Centre = [svg_width*0.15,svg_height*0.5];
const chart3Centre = [svg_width*0.35,svg_height*0.8];
const bigChartCentre = [svg_width * 0.75,svg_height*0.5];




//for diagrams - ids needed?
let slot1 = svgContainer.append("g");
let slot2 = svgContainer.append("g");
let slot3 = svgContainer.append("g");
let slot4 = svgContainer.append("g");

//wait until data is ready
let dataWait = setInterval(function(){
  if (dataLoader.isReady()) {

    render();
    renderSidelist();
    clearInterval(dataWait);
  }
  else {
    console.log("not ready");
  }
}, 100);

function render(){

  let plot1 = new RadarPlot(slot1, chartWidth, chart1Centre, dataLoader.getColNames(), dataLoader.getByJourney(), "#406E8E", "Journey");

  let plot2 = new RadarPlot(slot2, chartWidth, chart2Centre, dataLoader.getColNames(), dataLoader.getByHour(), "#E63946", "Hour");

  let plot3 = new RadarPlot(slot3, chartWidth, chart3Centre, dataLoader.getColNames(), dataLoader.getByKm(), "#659B5E", "KM");


  let bigPlot = new MultiRadarPlot(slot4, largeChartWidth, bigChartCentre, dataLoader.getColNames(), dataLoader.getAllData(), ["#406E8E","#E63946","#659B5E"], "All...");


}

function renderSidelist() {

  // let labels = Object.values(dataLoader.getColNames());
  //
  // let sidebarList = d3.select("#sidebarList")


  // for (var i = 0; i < labels.length; i++) {
  //   let listItem = sidebarList.append("li")
  //     // .attr("height", (100.0/labels.length) + "%")
  //   listItem.text(labels[i]);
  //   listItem.append("image")
  //     .attr('xlink:href', "images/icons/" + labels[i] + ".png")
  //       .classed("sideBarIcon", true)
  //
  //
  //
  // }
}
