import React, { Component } from 'react';
import {scaleLinear} from 'd3-scale';
import $ from 'jquery';
import {line, curveBasis} from 'd3-shape';
import {color} from 'd3-color';

class StackedBarChart extends Component {
    constructor(props){
        super(props);
        this.state = {'draggingSelection':false, 'dragStart':null, 'dragEnd':null, 'sortedTerms':[] };
        this.startDrag = this.startDrag.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.dragSVG = this.dragSVG.bind(this);
        this.sortedTerms={};
    }

    componentWillReceiveProps(props){
      this.state = {'draggingSelection':false, 'dragStart':null, 'dragEnd':null};
    }

    render(){
        if (this.props.type === "HORIZONTAL"){
            return this.renderHorizontal();
        }
    }

    getStartEnd(dragStart, dragEnd){
      let start, end;
      if (dragStart[1] < dragEnd[1]){
        start = dragStart[1];
        end = dragEnd[1];
      }else{
        start = dragEnd[1];
        end = dragStart[1];
      }
      return [start, end];
    }


    termInPolygon(y_termPosition, dragStart , dragEnd ){
      let inside = false;
      let start_end = this.getStartEnd(dragStart , dragEnd);
      if(y_termPosition>=start_end[0] && start_end[1]>=y_termPosition){
        return !inside;
      }
      return inside;
    }

    startDrag(e){
      let container = $('#svg_bar_charts').get(0).getBoundingClientRect();
      let mouse = [e.nativeEvent.clientX - container.left - this.props.x, e.nativeEvent.clientY - container.top - this.props.y];
      this.setState({'draggingSelection':true, 'dragStart': mouse, 'dragEnd':null});
    }

    stopDrag(e){
      let container = $('#svg_bar_charts').get(0).getBoundingClientRect();
      let mouse = [e.nativeEvent.clientX - container.left - this.props.x, e.nativeEvent.clientY - container.top - this.props.y];

      let selectedDims = [];
      for (let i = 0; i < this.props.dimNames.length; ++i){
        var nameFeature = this.props.dimNames[i];
        if(nameFeature != 'labels' && nameFeature != 'urls' && nameFeature != 'pred_labels' ){
          var y_termPosition = this.sortedTerms[nameFeature][2]; //[2] = coordinate y
          var tempSelected = this.termInPolygon(y_termPosition,this.state.dragStart , mouse);

          if(tempSelected) {
            selectedDims.push(this.sortedTerms[nameFeature][0]);
          } //store id
        }
      }
      this.props.highlightDataBySelectedDims(selectedDims);
      this.setState({'draggingSelection':false, 'dragEnd':mouse});

    }

    dragSVG(e){
      if (this.state.draggingSelection){
        let container = $('#svg_bar_charts').get(0).getBoundingClientRect();
        let mouse = [e.nativeEvent.clientX - container.left - this.props.x, e.nativeEvent.clientY - container.top - this.props.y];
        this.setState({'dragEnd':mouse});
      }
    }

    //############################################################################################################################################

    renderHorizontal() {
        let bars = [];
        var y_text_bar = 20;
        var y_rec_bar = 10;
        var list = this.props.termFrequencies;
        var termsSorted = Object.keys(list).sort(function(a,b){return list[b]-list[a]}); //this is an arrays of sorted terms.

        termsSorted.forEach(function(termSorted) {
            if (this.props.selectedAnchors[termSorted] || !(this.props.selectedAnchors.includes(true)) ){ //boolean operator OR . if there is not anyitem selected, then show all features.
                let bars_i =   <g key={termSorted}>
                  <rect x={25} y={y_rec_bar} width={this.props.termFrequencies[termSorted]} height="11"  fill={"#FFFF00"} stroke={"#CCCC00"}/>
                  <text textAnchor='start' x={25} y={y_text_bar}  fontSize={11} fill={this.props.colorText} >{termSorted}</text>
                  </g>;
                bars.push(bars_i);
                y_text_bar=y_text_bar+14;
                y_rec_bar=y_rec_bar+14;
                var id_term_y=[];
                var id = this.props.dimNames.indexOf(termSorted);
                id_term_y.push(id);
                id_term_y.push(termSorted);
                id_term_y.push(y_text_bar-20);
                this.sortedTerms[termSorted] = id_term_y;
            }
        }.bind(this));

        let selectionPoly = [];
        let selectionLines = [];
        if (!(this.state.dragEnd==null) && !(this.state.dragStart==null)){
          let selectionStyle = {fill:'white', fillOpacity:0.8};

          let start, end;
          if (this.state.dragStart[1] < this.state.dragEnd[1]){
            start = this.state.dragStart[1];
            end = this.state.dragEnd[1];
          }else{
            start = this.state.dragEnd[1];
            end = this.state.dragStart[1];
          }

          let styleSelectionLine = {stroke:"#EEE",strokeWidth:2};
          if (start !== end){
              selectionPoly = [<rect x={this.props.x} width={this.props.width} y={this.props.y} height={Math.max(0, start)}
                                    style={selectionStyle} key={1}/>,
                             <rect x={this.props.x} width={this.props.width} y={this.props.y + end} height={this.props.height}
                                    style={selectionStyle} key={2}/>];

              selectionLines = [<line x1={this.props.x} y1={this.props.y + start} x2={this.props.x + this.props.width} y2={this.props.y + start} style={styleSelectionLine} key={1} />,
                                <line x1={this.props.x} y1={this.props.y + end} x2={this.props.x + this.props.width} y2={this.props.y + end} style={styleSelectionLine} key={2} />]
          }
      }

        return (
          <svg id={'svg_bar_charts'} width ={150} height ={this.props.height} style={{float:'left', marginLeft:'-200', cursor:'default',MozUserSelect:'none', WebkitUserSelect:'none',msUserSelect:'none', cursor:'crosshair'}}
          onMouseDown={this.startDrag} onMouseMove={this.dragSVG}  onMouseUp={this.stopDrag}>
            <g>
              {bars}
              {selectionPoly}
              {selectionLines}
            </g>
          </svg>

        );
    }
}

StackedBarChart.propTypes = {
};

StackedBarChart.defaultProps = {
    x:0,
    y:0,
    width:150,
    height:700,
    type: 'HORIZONTAL',
    colorText:'black',
};


export default StackedBarChart;
