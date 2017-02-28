import React, { Component } from 'react';

import {scaleLinear} from 'd3-scale';


class SigmoidGraph extends Component {
	constructor(props){
		super(props);
		this.scaleX = scaleLinear().domain([-2,2]).range([this.props.marginX, this.props.width-this.props.marginX]);
        this.scaleY = scaleLinear().domain([1,-1]).range([this.props.marginY, this.props.height - this.props.marginY]);
	}

	render(){
		let path = ""
		for (let x = -2; x <= 2; x += 0.01){
			path = path + this.scaleX(x) + "," + this.scaleY(this.sigmoid(x)) + " ";
		}

		return (
			<svg style={{width:this.props.width, height:this.props.height, borderColor:"#9E9E9E", borderLeft:'1px solid', borderBottom:'1px solid',}}>
			<polyline points={path} style={{fill:'none',stroke:'00aaff',strokeWidth:3}}/>
			<g className="axis" ref="axis" transform={100}></g>
			</svg>
			)
	}

	sigmoid(x){
        return (1/(1+Math.exp(-(this.props.sigmoid_scale*(x + this.props.sigmoid_translate)))));
    }

}



SigmoidGraph.defaultProps = {
	width:210,
	height:80,
	marginX:1,
	marginY:1
}

export default SigmoidGraph;
