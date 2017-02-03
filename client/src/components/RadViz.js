import React, { Component } from 'react';
import numeric from 'numeric';
import {scaleLinear} from 'd3-scale';
import $ from 'jquery';
import keydown from 'react-keydown';

class RadViz extends Component {

    constructor(props){
        super(props);
        this.state={'draggingAnchor':false, 'showedData': this.props.showedData};
        this.startDragSelect = this.startDragSelect.bind(this);
        this.startDragAnchor = this.startDragAnchor.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.dragSVG = this.dragSVG.bind(this);
        this.unselectAllData = this.unselectAllData.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.selectionPoly = [];
        this.pointInPolygon = this.pointInPolygon.bind(this);
        this.startDragAnchorGroup = this.startDragAnchorGroup.bind(this);
    }
    componentWillMount(){
    window.addEventListener('keydown', this.handleKeyDown);

      console.log('componentWillMount');
        if (this.props.data){
            let dimNames = Object.keys(this.props.data[0]);
            let nDims = dimNames.length;

            // Normalizing columns to [0, 1]
            let normalizedData = [];
            let mins = [];
            let maxs = [];

            for (let j = 0; j < nDims; ++j){
                mins.push(this.props.data[0][dimNames[j]]);
                maxs.push(this.props.data[0][dimNames[j]]);
            }

            for (let i = 1; i < this.props.data.length; ++i){
                for (let j = 0; j < nDims; ++j){
                    if (this.props.data[i][dimNames[j]] < mins[j]){
                        mins[j] = this.props.data[i][dimNames[j]];
                    }
                    if (this.props.data[i][dimNames[j]] > maxs[j]){
                        maxs[j] = this.props.data[i][dimNames[j]];
                    }
                }
            }

            // computing the denominator of radviz (sums of entries). Also initializing selected array (dots that are selected)
            let denominators = [];
            let selected = [];
            for (let i = 0; i < this.props.data.length; ++i){
                let aux = [];
            	selected.push(false);
                denominators.push(0);
                // normalizing data by columns => equal weights to all dimensions (words)
                let max_entry_by_row = -1;
                for (let j = 0; j < nDims; ++j){
                    let val = (this.props.data[i][dimNames[j]] - mins[j])/(maxs[j] - mins[j]);
                    aux.push(val);
                    if (val > max_entry_by_row){
                        max_entry_by_row = val;
                    }
                }
                // normalizing data by rows => sigmoid computation (max entry in row must be equal to 1)
                if (max_entry_by_row > 0){
                    for (let j = 0; j < nDims; ++j){
                        aux[j] /= max_entry_by_row;
                        denominators[i] += aux[j] * this.sigmoid(aux[j]);
                    }
                }
                normalizedData.push(aux);
            }

            // Computing the anchors
            let anchorAngles = [];

            for (let i = 0; i < nDims; ++i){
                anchorAngles.push(i * 2*Math.PI / nDims)
            }

            this.scaleX = scaleLinear().domain([-1,1]).range([this.props.marginX/2, this.props.width-this.props.marginX/2]);
            this.scaleY = scaleLinear().domain([-1,1]).range([this.props.marginY/2, this.props.height - this.props.marginY/2]);

            this.setState({"normalizedData":normalizedData, "dimNames":dimNames, "nDims":nDims,
            	"anchorAngles":anchorAngles, "denominators":denominators,
            	"selected":selected, "offsetAnchors":0});
        }
    }

    componentWillUnmount(){
      window.removeEventListener('keydown', this.handleKeyDown);
    }

    componentWillReceiveProps(props){
        /*if(props.showedData!==this.state.showedData || this.state.selected.length>0){
          return;
        }*/
        if (props.data ){
            let dimNames = Object.keys(props.data[0]);
            let nDims = dimNames.length;

            // Normalizing columns to [0, 1]
            let normalizedData = [];
            let mins = [];
            let maxs = [];

            for (let j = 0; j < nDims; ++j){
                mins.push(props.data[0][dimNames[j]]);
                maxs.push(props.data[0][dimNames[j]]);
            }

            for (let i = 1; i < props.data.length; ++i){
                for (let j = 0; j < nDims; ++j){
                    if (props.data[i][dimNames[j]] < mins[j]){
                        mins[j] = props.data[i][dimNames[j]];
                    }
                    if (props.data[i][dimNames[j]] > maxs[j]){
                        maxs[j] = props.data[i][dimNames[j]];
                    }
                }
            }

            // computing the denominator of radviz (sums of entries). Also initializing selected array (dots that are selected)
            let denominators = [];
            let selected = [];
            for (let i = 0; i < props.data.length; ++i){
                let aux = [];
            	selected.push(false);
                denominators.push(0);
                // normalizing data by columns => equal weights to all dimensions (words)
                let max_entry_by_row = -1;
                for (let j = 0; j < nDims; ++j){
                    let val = (props.data[i][dimNames[j]] - mins[j])/(maxs[j] - mins[j]);
                    aux.push(val);
                    if (val > max_entry_by_row){
                        max_entry_by_row = val;
                    }
                }
                // normalizing data by rows => sigmoid computation (max entry in row must be equal to 1)
                if (max_entry_by_row > 0){
                    for (let j = 0; j < nDims; ++j){
                        aux[j] /= max_entry_by_row;
                        denominators[i] += aux[j] * this.sigmoid(aux[j]);
                    }
                }
                normalizedData.push(aux);
            }

            // Computing the anchors
            let anchorAngles = [];

            for (let i = 0; i < nDims; ++i){
                anchorAngles.push(i * 2*Math.PI / nDims)
            }

            this.scaleX = scaleLinear().domain([-1,1]).range([props.marginX/2, props.width-props.marginX/2]);
            this.scaleY = scaleLinear().domain([-1,1]).range([props.marginY/2, props.height - props.marginY/2]);

            if(props.showedData!==this.state.showedData || this.state.selected.length>0){
              this.setState({"normalizedData":normalizedData, "dimNames":dimNames, "nDims":nDims,
                "anchorAngles":anchorAngles, "denominators":denominators, "offsetAnchors":0});
            }
            else{
              this.setState({"normalizedData":normalizedData, "dimNames":dimNames, "nDims":nDims,
                "anchorAngles":anchorAngles, "denominators":denominators,
                "selected":selected, "offsetAnchors":0});
            }

        }
    }

    anglesToXY(anchorAngle, radius=1){
        let initPoint = [radius, 0];
        let offset = this.state.offsetAnchors;
        let rotMat = [[Math.cos(anchorAngle+offset), -Math.sin(anchorAngle+offset)], [Math.sin(anchorAngle+offset), Math.cos(anchorAngle+offset)]];
        return (numeric.dot(rotMat,initPoint));
    }

    radvizMapping(data, anchors){
        console.log('radvizmapping');
      	this.currentMapping = [];
          let ret = [];
          for (let i = 0; i < data.length; ++i){
            let p = [0,0];
            for (let j = 0; j < anchors.length;++j){
                p[0] += anchors[j][0]*data[i][j]/this.state.denominators[i] * this.sigmoid(data[i][j]);
                p[1] += anchors[j][1]*data[i][j]/this.state.denominators[i] *  this.sigmoid(data[i][j]);
            }
            if(isNaN(p[0])) p[0]=0;//when all dimension values were zero.
            if(isNaN(p[1])) p[1]=0;//When all dimension values were zero
            this.currentMapping.push(p);
            if(this.props.showedData===0){
                ret.push(<circle cx={this.scaleX(p[0])} cy={this.scaleY(p[1])} r={5} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>)
            }
            if(this.props.showedData===1){
              if(!this.state.selected[i])
                ret.push(<circle cx={this.scaleX(p[0])} cy={this.scaleY(p[1])} r={5} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>)
            }
            if(this.props.showedData===2 && this.state.selected[i]){
                ret.push(<circle cx={this.scaleX(p[0])} cy={this.scaleY(p[1])} r={5} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>)
            }
          }
          return ret;
    }

    setSelectedAnchors(data){
          let selectedAnchors = [];
          for (let j = 0; j < this.state.dimNames.length;++j){
             selectedAnchors[this.state.dimNames[j]]=false;
          }
          for (let i = 0; i < data.length; ++i){
            for (let j = 0; j < this.state.dimNames.length;++j){
                if((data[i][j]>0 && this.state.selected[i]) || selectedAnchors[this.state.dimNames[j]]){
                  selectedAnchors[this.state.dimNames[j]]=true;
                }
                else selectedAnchors[this.state.dimNames[j]]=false;
            }
          }
          return selectedAnchors;
    }

    stopDrag(e){
    	if (this.state.draggingSelection){
            if (this.selectionPoly.length > 0){
        		let selected = [];
        		for (let i = 0; i < this.props.data.length; ++i){
        			selected.push(this.pointInPolygon(this.currentMapping[i], this.selectionPoly));
        		}
        		this.selectionPoly= [];
        		this.setState({'draggingSelection':false, 'selected':selected})
        		this.props.callbackSelection(selected);
            this.props.setSelectedPoints(selected);
            console.log(this.state.selected);
            }

    	}
    	if (this.state.draggingAnchorGroup){
    		let anchorAngles = this.state.anchorAngles.slice();
    		for (let i = 0; i < anchorAngles.length; ++i){
    			anchorAngles[i] += this.state.offsetAnchors;
    		}
    		this.setState({'draggingAnchorGroup':false, 'startAnchorGroupAngle':0, 'anchorAngles':anchorAngles, 'offsetAnchors':0});
    	}
    	if (this.state.draggingAnchor){
    		this.setState({'draggingAnchor':false});
    	}

    }

    startDragAnchor(i){
        return function(e){
            this.setState({'draggingAnchor':true, 'draggingAnchor_anchor_id':i});
            e.stopPropagation();
        }.bind(this);
    }

    pointInPolygon(point, polygon){
        polygon.push(polygon[0])
    	let inside = false;
    	for (let n = polygon.length, i = 0, j = n-1, x = point[0], y = point[1]; i < n; j = i++){
    		let xi = this.scaleX.invert(polygon[i][0]), yi = this.scaleY.invert(polygon[i][1]),
    		    xj = this.scaleX.invert(polygon[j][0]), yj = this.scaleY.invert(polygon[j][1]);
        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    	}
    	return inside;
    }

    dragSVG(e){

        let container = $("#svg_radviz").get(0).getBoundingClientRect();
        let mouse = [e.nativeEvent.clientX - container.left, e.nativeEvent.clientY - container.top];
        if (this.state.draggingAnchor){
            let center=[this.props.width/2, this.props.height/2];
            let vec=[mouse[0] - center[0], mouse[1]-center[1]];
            let normVec=numeric.norm2(vec);
            vec[0] /= normVec;
            vec[1] /= normVec;
            // Computing the angle by making a dot product with the [1,0] vector
            let cosAngle = vec[0];
            let angle = Math.acos(cosAngle);
            if (mouse[1] < center[1])
                angle *= -1;
            let newAnchorAngles = this.state.anchorAngles.slice();
            newAnchorAngles[this.state.draggingAnchor_anchor_id] = angle;
            this.setState({'anchorAngles':newAnchorAngles});
        }else if(this.state.draggingSelection){
            this.selectionPoly.push(mouse);
            this.setState(this.state);
        }else if(this.state.draggingAnchorGroup){
	        let center=[this.props.width/2, this.props.height/2];
	        let vec=[mouse[0] - center[0], mouse[1]-center[1]];
	        let normVec=numeric.norm2(vec);
	        vec[0] /= normVec;
	        vec[1] /= normVec;
	        // Computing the angle by making a dot product with the [1,0] vector
	        let cosAngle = vec[0];
	        let angle = Math.acos(cosAngle);
	        if (mouse[1] < center[1])
	            angle *= -1;
	        let angleDifference = angle - this.state.startAnchorGroupAngle;
	        this.setState({"offsetAnchors":angleDifference});
        }
    }

    sigmoid(x){
        return (1/(1+Math.exp(-(this.props.sigmoid_scale*(x + this.props.sigmoid_translate)))));
    }

    svgPoly(points){
        /*if ( event ) {
          alert(event);
        }*/

        if (points && points.length > 0){
            let pointsStr = "";
            for (let i = 0; i < points.length; ++i){
                pointsStr = pointsStr + points[i][0] + "," + points[i][1] + " "
            }
            return (<polygon points={pointsStr} style={{fill:'rgba(0,75,100,0.4)',stroke:'none',strokeWidth:1}}/> )
        }else{
            return ;
        }
    }

    startDragSelect(e){
        this.setState({'draggingSelection':true})
            this.selectionPoly = [];
    }

    unselectAllData(e){
      let selected = [];
      for (let i = 0; i < this.props.data.length; ++i){
        selected.push(false);
      }
      this.setState({'draggingSelection':false, 'selected':selected});
      this.props.setSelectedPoints(selected);
    }
    handleKeyDown(e){
      if (e.keyCode === 27){
        this.unselectAllData(e);
      }
    }

    startDragAnchorGroup(e){
    	let container = $("#svg_radviz").get(0).getBoundingClientRect();
        let mouse = [e.nativeEvent.clientX - container.left, e.nativeEvent.clientY - container.top];
        let center=[this.props.width/2, this.props.height/2];
        let vec=[mouse[0] - center[0], mouse[1]-center[1]];
        let normVec=numeric.norm2(vec);
        vec[0] /= normVec;
        vec[1] /= normVec;
        // Computing the angle by making a dot product with the [1,0] vector
        let cosAngle = vec[0];
        let angle = Math.acos(cosAngle);
        if (mouse[1] < center[1])
            angle *= -1;
        e.stopPropagation();
    	this.setState({'draggingAnchorGroup':true, 'startAnchorGroupAngle':angle});
    }

    render() {
        console.log("rendering radViz");
        let sampleDots = [];
        let anchorDots = [];
        let anchorText = [];
        let selectedAnchors = [];
        if (this.props.data){
            let anchorXY = [];
            for (let i = 0; i < this.state.nDims; ++i)
                anchorXY.push(this.anglesToXY(this.state.anchorAngles[i], 1));

            selectedAnchors = this.setSelectedAnchors(this.state.normalizedData);
            console.log(selectedAnchors);
            for (let i = 0; i < this.state.nDims; ++i){

                anchorDots.push(<circle cx={this.scaleX(anchorXY[i][0])} cy={this.scaleX(anchorXY[i][1])} r={5}
                        key={i} onMouseDown={this.startDragAnchor(i)} style={{cursor:'hand', stroke:(this.state.selected[i]?'black':'none'), fill:(selectedAnchors[this.state.dimNames[i]]?'black':'black'), opacity:((selectedAnchors[this.state.dimNames[i]]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);
                  anchorText.push(
                          <g transform={`translate(${this.scaleX(anchorXY[i][0]*1.06)}, ${this.scaleX(anchorXY[i][1]*1.06)})`} key={i}>
                          <text x={0} y={0} transform={`rotate(${(this.state.anchorAngles[i] + this.state.offsetAnchors)*180/Math.PI})`} style={{fill:(selectedAnchors[this.state.dimNames[i]]?'black':'black'), opacity:((selectedAnchors[this.state.dimNames[i]]||(!(this.state.selected.includes(true))))?1:0.3),}}>{this.state.dimNames[i]}</text>
                          </g>);


            }

              sampleDots = this.radvizMapping(this.state.normalizedData, anchorXY);
        }
        return (
                <svg  id={"svg_radviz"}  style={{cursor:((this.state.draggingAnchor || this.state.draggingAnchorGroup)?'hand':'default'), width:this.props.width, height:this.props.height, MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none'}}
                onMouseMove={this.dragSVG} onMouseUp={this.stopDrag} onMouseDown={this.startDragSelect} onDoubleClick = {this.unselectAllData} onClick={this.unselectAllData}  onKeyDown={this.handleKeyDown}>
	                <ellipse cx={this.props.width/2} cy={this.props.height/2} rx={(this.props.width-this.props.marginX)/2} ry={(this.props.height - this.props.marginY)/2}
                  style={{stroke:'aquamarine',fill:'none', strokeWidth:5, cursor:'hand'}} onMouseDown={this.startDragAnchorGroup}/>
                  {sampleDots}
                  {this.svgPoly(this.selectionPoly)}
                  {anchorText}
	                {anchorDots}
                </svg>
               );
    }
}

RadViz.defaultProps = {
	width:700,
	height:700,
	marginX:200,
	marginY:200,
    sigmoid_translate:0,
    sigmoid_scale:1,
	colors:["red","green","blue"],
	callbackSelection:function(selected){}
}

export default RadViz;
//{sampleDots}
//{this.svgPoly(this.selectionPoly)}
//{anchorText}
