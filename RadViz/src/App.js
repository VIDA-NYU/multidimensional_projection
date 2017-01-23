import React, { Component } from 'react';
import './App.css';
import RadViz from './RadViz'
import {csv} from 'd3-request'
import {scaleOrdinal, schemeCategory10} from 'd3-scale';
import 'rc-slider/assets/index.css';
import Slider  from 'rc-slider'
import SigmoidGraph from './SigmoidGraph'

class App extends Component {
    constructor(props){
        super(props);
        this.state = {'sigmoidScale':1, 'sigmoidTranslate':0};
        this.processResults = this.processResults.bind(this)
        this.updateSigmoidScale = this.updateSigmoidScale.bind(this);
        this.updateSigmoidTranslate = this.updateSigmoidTranslate.bind(this);
    }    

    processResults (error, data){
        let numericalData = [];
        let dimNames = Object.keys(data[0]);
        let scaleColor = scaleOrdinal(schemeCategory10);
        let colors = [];
        for (let i = 0; i < data.length; ++i){
            colors.push(scaleColor(data[i]['Species']));
            let aux = {};
            for (let j = 0; j < 4; ++j){
                aux[dimNames[j]] = parseFloat(data[i][dimNames[j]]);
            }
            numericalData.push(aux);
        }
        this.setState({"data":numericalData, "colors":colors});
    }

    componentWillMount(){
        csv("./iris.csv", this.processResults);
    }

    updateSigmoidScale(s){
        this.setState({'sigmoidScale':s})
    }

    updateSigmoidTranslate(s){
        this.setState({'sigmoidTranslate':s})
    }


    render() {
        return (
                <div className="App">
                <RadViz data={this.state.data} colors={this.state.colors} sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}/>
                <div style={{paddingLeft:100,width:300}}>
                Sigmoid translation: <Slider min={-1} max={1} step={0.01} defaultValue={0} onChange={this.updateSigmoidTranslate}/>
                </div>
                <div style={{paddingLeft:100,width:300}}>
                Sigmoid scale: <Slider min={0} max={100} step={1} defaultValue={1} onChange={this.updateSigmoidScale}/>
                </div>
                <div style={{paddingLeft:100,width:300}}>
                <SigmoidGraph sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}/>
                </div>
                </div>
               );
    }
}

export default App;
