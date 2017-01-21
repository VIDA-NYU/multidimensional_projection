import React, { Component } from 'react';
import './App.css';
import RadViz from './RadViz'
import {csv} from 'd3-request'
import {scaleOrdinal, schemeCategory10} from 'd3-scale';


class App extends Component {
    constructor(props){
        super(props);
        this.state = {};
        this.processResults = this.processResults.bind(this)
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


    render() {
        return (
                <div className="App">
                <RadViz data={this.state.data} colors={this.state.colors}/>
                </div>
               );
    }
}

export default App;
