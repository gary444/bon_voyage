import * as d3 from './d3.min.js';

//to load trophy and city data into a helpful format for rendering
export default class DataLoader {
  constructor(){

    this.ready = false;

    d3.csv('data/aviation_deaths.csv').then( (data) => {
      this.data = data;
      this.ready = true;
    });
  }

  isReady() {
    return this.ready;
  }

  getColNames(){
    return this.data.columns;
  }
  getByJourney(){
    return this.data[0];
  }
  getByHour(){
    return this.data[1];
  }
  getByKm(){
    return this.data[2];
  }
  getAllData(){
    return this.data;
  }
}
