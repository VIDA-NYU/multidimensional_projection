import React, {Component} from 'react';
import RadVizPlot from './RadVizPlot';
import {csv} from 'd3-request';


class RadViz_ extends Component{


  constructor(props){
    super(props);
    this.state = {};
    this.processResults = this.processResults.bind(this)
  }

  processResults (error, data){
    console.log("data");
    console.log(data);
      this.setState({"data":data});
  }

  componentWillMount(){
    csv("https://raw.githubusercontent.com/uiuc-cse/data-fa14/gh-pages/data/iris.csv", this.processResults)
  }

  render(){

       let dimensions= ["petal_length", "petal_width"];
       let dnames = ["Petal Length", "Petal Width", "Sepal Length", "Sepal Width"];
       let pairs = [];
       for (let i = 0; i < dimensions.length-1; i++){
         for (let j = i+1; j < dimensions.length; j++){
           pairs.push({'dimensions':[dimensions[i], dimensions[j]],
                       'names': [dnames[i], dnames[j]]});
         }
       }

   var urls = [];
   var urlName = ["url1", "url12", "url13", "url14", "url15"];
   var urlDescription = ["urlDescription1", "urlDescription2", "urlDescription3", "urlDescription4", "urlDescription5"];

   for (let i = 0; i < urlName.length; i++) {
       urls.push({
           name: urlName[i],
           description: urlDescription[i],
       });
   }


   return (
     <div>
     {pairs.map((p)=>{
       console.log(p['names'][0]);
          return (
              <RadVizPlot title={p['names'][0] + " x " + p['names'][1]} data={this.state.data}
                  xAcessor={(d)=>d[p['dimensions'][0]]} yAcessor={(d)=>d[p['dimensions'][1]]} labelAcessor={(d)=>d["species"]}
                  xLabel={p['names'][0]} yLabel={p['names'][1]}/>
            )
      })}
     </div>
    )
  }
}

export default RadViz_;
/*{pairs.map((p)=>{
     return (
         <RadVizPlot title={p['names'][0] + " x " + p['names'][1]} data={this.state.data}
             xAcessor={(d)=>d[p['dimensions'][0]]} yAcessor={(d)=>d[p['dimensions'][1]]} labelAcessor={(d)=>d["species"]}
             xLabel={p['names'][0]} yLabel={p['names'][1]}/>
       )
 })}*/
