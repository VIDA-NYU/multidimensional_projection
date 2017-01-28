import React, { Component } from 'react';
import 'react-vis/main.css';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {
  XYPlot,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  MarkSeries} from 'react-vis';
import {scaleOrdinal, schemeCategory10} from 'd3-scale';

class RadVizPlot extends Component {
    constructor(props){
        super(props);
        this.state = {};
        this.colorscheme = scaleOrdinal([1,2,3]);
    }

    create_data(data){
        let self=this;
        if (data){
            let processed_data = {};
            data.forEach((d)=>{
                if (!processed_data[self.props.labelAcessor(d)]){
                    processed_data[self.props.labelAcessor(d)] = [];
                }
                processed_data[self.props.labelAcessor(d)].push({
                    "x": parseFloat(self.props.xAcessor(d)),
                    "y": parseFloat(self.props.yAcessor(d)),
                });
            });
            return processed_data;
        }
        return {};
    }

    render() {
        let mydata = this.create_data(this.props.data);
        return (
                <div style={{display: "inline-block"}}>
                    <p>{this.props.title}</p>
                    <XYPlot width={this.props.width} height={this.props.height}>
                        <VerticalGridLines />
                        <HorizontalGridLines />
                        {Object.keys(mydata).map((k)=>{
                          console.log("k: " +k);
                           console.log(mydata[k]);
                            return <MarkSeries data={mydata[k]}/>
                        })}
                    </XYPlot>
                </div>
        );
    }
}

RadVizPlot.defaultProps = {
  width: 400,
  height: 400,
  dotSize: 5,
  title: "title"
};


export default RadVizPlot;
