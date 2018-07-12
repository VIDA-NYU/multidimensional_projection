import React, { Component } from 'react';
import numeric from 'numeric';
import {scaleLinear} from 'd3-scale';
import $ from 'jquery';
import TSNE from 'tsne-js';
import PCA from 'ml-pca';
import Checkbox from 'material-ui/Checkbox';
import StackedBarChart from './StackedBarChart'
const styles = {
  block: {
    maxWidth: 250,
  },
  radioButton: {
    fontSize: '10px',
    fontWeight:'small',
    marginLeft:'-15px'
  },
};

class RadViz extends Component {

    constructor(props){
        super(props);
        this.state={'draggingAnchor':false, 'showedData': this.props.showedData, 'selected':[], 'data': undefined,'nDims': 0, 'searchText_FindAnchor':'', 'radvizTypeProjection': this.props.radvizTypeProjection, 'sizeMdproj':this.props.clusterSeparation,  toggledShowLineSimilarity:this.props.toggledShowLineSimilarity,
        'clusterSimilarityThreshold':this.props.clusterSimilarityThreshold, 'expandedData': this.props.expandedData, 'buttonExpand':this.props.buttonExpand, 'termFrequencies':{},
        'showCheckBoxRemoveKeywords': this.props.showCheckBoxRemoveKeywords};
        this.startDragSelect = this.startDragSelect.bind(this);
        this.startDragAnchor = this.startDragAnchor.bind(this);
        this.stopDrag = this.stopDrag.bind(this);
        this.dragSVG = this.dragSVG.bind(this);
        this.unselectAllData = this.unselectAllData.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.selectionPoly = [];
        this.outputScaledPCA = {};
        this.pointInPolygon = this.pointInPolygon.bind(this);
        this.startDragAnchorGroup = this.startDragAnchorGroup.bind(this);
        this.sortDimensions = this.sortDimensions.bind(this);
        this.setSelectedAnchors = this.setSelectedAnchors.bind(this);
        this.highlightData = this.highlightData.bind(this);
        this.startanchorAngles = 0;
        this.currentUpdatedAngle=0;
        this.selectedAnchors=[];
        this.denominator_medoidsCluster = [];
        this.labels_medoidsCluster =[];
        this.normalizedData_medoidsCluster =[];
        this.pairwise_medoidsPoints = [];
        this.maxSimilarities_medoidsPoints = [];
        this.borderStringClusters = [];
        this.maxSimilarities={};
        this.expandedDataLocal=[];
        this.listRemovedKeywords =[];
        this.currentMapping=[];
        this.centroids = [];
        this.clusters_points = [];

    }
    componentWillMount(){
      window.addEventListener('keydown', this.handleKeyDown);//esc key to unselect all data.
      this.preprocessingData(this.props);
    }

    preprocessingData_(props){
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
                      denominators[i] += aux[j] * this.sigmoid(aux[j], props.sigmoid_scale, props.sigmoid_translate);
                  }
              }
              normalizedData.push(aux);
          }

          // Computing the anchors
          let anchorAngles = [];

          for (let i = 0; i < nDims; ++i){
              anchorAngles.push(i * 2*Math.PI / nDims);
          }

          this.scaleX = scaleLinear().domain([-1,1]).range([props.marginX/2, props.width-props.marginX/2]);
          this.scaleY = scaleLinear().domain([-1,1]).range([props.marginY/2, props.height - props.marginY/2]);
          let newState = {'normalizedData':normalizedData, 'dimNames':dimNames, 'nDims':nDims,
                          'denominators':denominators, 'offsetAnchors':0, 'sigmoid_scale':props.sigmoid_scale,
                          'sigmoid_translate':props.sigmoid_translate, 'searchText_FindAnchor':props.searchText_FindAnchor,
                          'radvizTypeProjection': props.radvizTypeProjection};

          if(props.selectedSearchText.length>0) {selected = []; selected=props.selectedSearchText;}
          if(!(props.selectedSearchText.length<=0 && (props.showedData!==this.state.showedData || this.state.selected.length>0))){
            newState['selected'] = selected;
          }
          if(this.state.data !== props.data) {  newState['data'] = props.data; newState['anchorAngles'] = anchorAngles;}
          this.setState(newState);

      }
    }

    preprocessingData(props){
      //console.log('preprocessingData');
      if (props.data ){
          this.expandedDataLocal=[];
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
          let expandedData = [];
          let normalizedClusterData ={};
          let idsDataIntoClusters ={};
          let clusterData_TF = {};
          //let listCluster = [];
          for (let i = 0; i < props.data.length; ++i){

              if(!(props.originalData['pred_labels'][i] in normalizedClusterData)){
                normalizedClusterData[props.originalData['pred_labels'][i]]=[];
                idsDataIntoClusters[props.originalData['pred_labels'][i]]=[];
                clusterData_TF[props.originalData['pred_labels'][i]]=[];
              }
              let aux = [];
              let aux_medoid_cluster = [];
              selected.push(false);
              expandedData.push(false);
              denominators.push(0);
              // normalizing data by columns => equal weights to all dimensions (words)
              let max_entry_by_row = -1;
              for (let j = 0; j < nDims; ++j){
                  let val = (props.data[i][dimNames[j]] - mins[j])/(maxs[j] - mins[j]);
                  aux.push(val);
                  aux_medoid_cluster.push(props.data[i][dimNames[j]]);
                  if (val > max_entry_by_row){
                      max_entry_by_row = val;
                  }
              }
              // normalizing data by rows => sigmoid computation (max entry in row must be equal to 1)
              if (max_entry_by_row > 0){
                  for (let j = 0; j < nDims; ++j){
                      aux[j] /= max_entry_by_row;
                      denominators[i] += aux[j] * this.sigmoid(aux[j], props.sigmoid_scale, props.sigmoid_translate);
                  }
              }
              clusterData_TF[props.originalData['pred_labels'][i]].push(aux_medoid_cluster);
              normalizedData.push(aux);
              idsDataIntoClusters[props.originalData['pred_labels'][i]].push(i);
              normalizedClusterData[props.originalData['pred_labels'][i]].push(aux);
          }
          //this.normalizedClusterData = normalizedClusterData;

          // Computing the anchors
          let anchorAngles = [];

          for (let i = 0; i < nDims; ++i){
              anchorAngles.push(i * 2*Math.PI / nDims);
          }

          this.scaleX = scaleLinear().domain([-1,1]).range([props.marginX/2, props.width-props.marginX/2]);
          this.scaleY = scaleLinear().domain([-1,1]).range([props.marginY/2, props.height - props.marginY/2]);
          let newState = {'normalizedData':normalizedData, 'dimNames':dimNames, 'nDims':nDims,
                          'denominators':denominators, 'offsetAnchors':0, 'sigmoid_scale':props.sigmoid_scale,
                          'sigmoid_translate':props.sigmoid_translate, 'searchText_FindAnchor':props.searchText_FindAnchor,
                          'radvizTypeProjection': props.radvizTypeProjection,'normalizedClusterData':normalizedClusterData,
                          'idsDataIntoClusters':idsDataIntoClusters, 'clusterData_TF':clusterData_TF, toggledShowLineSimilarity:props.toggledShowLineSimilarity,
                          'clusterSimilarityThreshold':props.clusterSimilarityThreshold, 'sizeMdproj':props.clusterSeparation, 'buttonExpand':props.buttonExpand,
                          showCheckBoxRemoveKeywords:props.showCheckBoxRemoveKeywords };

          if(props.selectedSearchText.length>0) {selected = []; selected=props.selectedSearchText; }

          if(!props.showCheckBoxRemoveKeywords) {this.listRemovedKeywords=[]; }; //Remove selected keywords from array (Reset Keywords)

          if(Object.keys(this.state.termFrequencies).length === 0){
            var termFrequencies =  this.setSelectedTermFrequency(props.data,selected,dimNames);
            newState['termFrequencies']=termFrequencies;
          }
          if(!(props.selectedSearchText.length<=0 && (props.showedData!==this.state.showedData || this.state.selected.length>0))){
            if(Object.keys(this.state.termFrequencies).length === 0){
              var termFrequencies =  this.setSelectedTermFrequency(props.data,selected,dimNames);
              newState['termFrequencies']=termFrequencies;
            }
            newState['selected'] = selected;
          }
          if(this.state.expandedData.length==0 || props.expandedData.length==0){
            newState['expandedData'] = expandedData;
          }
          if(this.state.data !== props.data) { this.pairwise_medoidsPoints = []; this.borderStringClusters = []; this.maxSimilarities_medoidsPoints=[]; this.maxSimilarities={}; this.outputScaledPCA = {}; newState['data'] = props.data; newState['anchorAngles'] = anchorAngles;}
          //newState['data'] = props.data;// newState['anchorAngles'] = anchorAngles;
          this.setState(newState);

      }
    }

    componentWillUnmount(){
      window.removeEventListener('keydown', this.handleKeyDown);
    }

    componentWillReceiveProps(props){
          this.preprocessingData(props);

    }
    /*shouldComponentUpdate(nextProps, nextState){
      //console.log('shouldComponentUpdate');
      if(this.state.sigmoid_scale != nextProps.sigmoid_scale || this.state.sigmoid_translate != nextProps.sigmoid_translate
        || this.state.radvizTypeProjection != nextProps.radvizTypeProjection|| this.state.toggledShowLineSimilarity !=nextProps.toggledShowLineSimilarity
        || this.state.clusterSimilarityThreshold !=nextProps.clusterSimilarityThreshold || this.state.searchText_FindAnchor != nextProps.searchText_FindAnchor
        || this.state.sizeMdproj != nextProps.clusterSeparation|| this.state.buttonExpand != nextProps.buttonExpand)  {
          return true;
          //console.log('TRUE');
        }
        else{
          if(this.state.sigmoid_scale != nextState.sigmoid_scale || this.state.sigmoid_translate != nextState.sigmoid_translate
            || this.state.radvizTypeProjection != nextState.radvizTypeProjection|| this.state.toggledShowLineSimilarity !=nextState.toggledShowLineSimilarity
            || this.state.clusterSimilarityThreshold !=nextState.clusterSimilarityThreshold || this.state.searchText_FindAnchor != nextState.searchText_FindAnchor
            || this.state.sizeMdproj != nextState.clusterSeparation|| this.state.buttonExpand != nextState.buttonExpand
            || this.state.selected != nextState.selected) {
              //console.log('TRUE nextState');
              return true;
            }
            else{
              //console.log('FALSE');
              return false;
            }

        }
    }*/

    anglesToXY(anchorAngle, radius=1){
        let initPoint = [radius, 0];
        let offset = this.state.offsetAnchors;
        let rotMat = [[Math.cos(anchorAngle+offset), -Math.sin(anchorAngle+offset)], [Math.sin(anchorAngle+offset), Math.cos(anchorAngle+offset)]];
        return (numeric.dot(rotMat,initPoint));
    }

    setColorPoints(i, ret, p0, p1){
      if(this.props.showedData===0){
          ret.push(<circle cx={this.scaleX(p0)} cy={this.scaleY(p1)} r={3} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);
      }
      if(this.props.showedData===1){
        if(!this.state.selected[i])
          {ret.push(<circle cx={this.scaleX(p0)} cy={this.scaleY(p1)} r={3} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);}
      }
      if(this.props.showedData===2 && this.state.selected[i]){
          ret.push(<circle cx={this.scaleX(p0)} cy={this.scaleY(p1)} r={3} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);
      }
      return ret;
    }

    setColorPointsInClusters(i, ret, p0, p1, k){
      var marginX_up = 0;
      var marginX_down = 0;
      var marginY_up = 0;
      var marginY_down = 0;
      if(k==0){
        marginX_up = this.props.marginX/2+20;
        marginX_down = (marginX_up)+100;
        marginY_up = this.props.marginY/2+20;
        marginY_down = (marginY_up)+100;
      }
      if(k==1){
        marginX_up = this.props.marginX/2+270;
        marginX_down = (marginX_up)+100;
        marginY_up = this.props.marginY/2+20;
        marginY_down = (marginY_up)+100;
      }
      if(k==2){
        marginX_up = this.props.marginX/2+20;
        marginX_down = (marginX_up)+100;
        marginY_up = this.props.marginY/2+270;
        marginY_down = (marginY_up)+100;
      }
      if(k==3){
        marginX_up = this.props.marginX/2+270;
        marginX_down = (marginX_up)+100;
        marginY_up = this.props.marginY/2+270;
        marginY_down = (marginY_up)+100;
      }
      var scaleX_Cluster = scaleLinear().domain([-1,1]).range([marginX_up, marginX_down]);
      var scaleY_Cluster = scaleLinear().domain([-1,1]).range([marginY_up, marginY_down]);
    //  console.log(this.scaleX(p0) + ", " + this.scaleY(p1));
      if(this.props.showedData===0){
          ret.push(<circle cx={this.scaleX(p0)} cy={this.scaleY(p1)} r={3} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);
      }
      if(this.props.showedData===1){
        if(!this.state.selected[i])
          {ret.push(<circle cx={this.scaleX(p0)} cy={this.scaleY(p1)} r={3} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);}
      }
      if(this.props.showedData===2 && this.state.selected[i]){
          ret.push(<circle cx={this.scaleX(p0)} cy={this.scaleY(p1)} r={3} key={i} style={{stroke:(this.state.selected[i]?'black':'none'),fill:this.props.colors[i], opacity:((this.state.selected[i]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);
      }
      return ret;
    }

    computeTSNE(data){
      let model = new TSNE({
          dim: 2,
          perplexity: 45.0,
          earlyExaggeration: 4.0,
          learningRate: 100.0,
          nIter: 50,
          metric: 'euclidean'
        });

        // inputData is a nested array which can be converted into an ndarray
        // alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')
        model.init({
          data: data,
          type: 'dense'
        });
        // `error`,  `iter`: final error and iteration number
        // note: computation-heavy action happens here
        let [error, iter] = model.run();

        // rerun without re-calculating pairwise distances, etc.
        //let [error2, iter2] = model.rerun();

        // `output` is unpacked ndarray (regular nested javascript array)
        //let output = model.getOutput();

        // `outputScaled` is `output` scaled to a range of [-1, 1]
        let outputScaled = model.getOutputScaled();
        return outputScaled;
    }
    /*computeTSNE_server(data){
      //apply onlineClassifier
      $.post(
          '/updateOnlineClassifier',
          {'session':  JSON.stringify(this.state.sessionBody)},
          function(accuracy) {
              this.setState({accuracy: accuracy});
              if(this.state.dimNames[this.state.value]=='Model Result'){
                this.predictUnlabeled();
              }
          }.bind(this)
      );

    }*/

    computePCA(data, clusterName){
      //apply onlineClassifier
      if(!(Object.keys(this.outputScaledPCA).includes(clusterName))){
        this.outputScaledPCA[clusterName] = [];
        let pca = new PCA(data);
        var outputScaledPCA = [];
        outputScaledPCA = pca.predict(data);
        this.outputScaledPCA[clusterName] = outputScaledPCA;
        this.getSumMedoids();
        return outputScaledPCA;
      }
      return this.outputScaledPCA[clusterName];

    }

    cmp(x, y) {
      if (x > y) {
        return 1;
      } else if (x < y) {
        return -1;
      } else {
        return 0;
      }
    }
    turn(p, q, r) {
      return this.cmp((q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1]), 0);
    }
    distance(p, q) {
      var dx = q[0] - p[0];
      var dy = q[1] - p[1];
      return dx * dx + dy * dy;
    }
    nextHullPoints(points, p) {
      var q = p, r, t;
      for (var i = 0; i < points.length; i++) {
        r = points[i];
        t = this.turn(p, q, r);
        if (t == -1 || t == 0 && this.distance(p, r) > this.distance(p, q)) {
          q = r;
        }
      }
      return q;
    }

    //Jarvis March algorithm
    //Given a set of points in the plane. the convex hull of the set is the smallest convex polygon that contains all the points of it.
    convexHull(points) {
      var left, point;
      var stringBorders = '';
      for (var i = 0; i < points.length; i++) {
        point = points[i];
        if (!left || point[0] < left[0]) {
          left = point;
        }
      }
      var hull = [left], p, q;
      stringBorders = stringBorders+left[0]+','+left[1]+' ';

      for (var i = 0; i < hull.length; i++) {
        p = hull[i];
        q = this.nextHullPoints(points, p);
        if (q[0] != hull[0][0] || q[1] != hull[0][1]) {
          hull.push(q);
          stringBorders = stringBorders+q[0]+','+q[1]+' ';
        }
      }
      stringBorders = stringBorders+left[0]+','+left[1]+' ';
      hull.push(left);
      return stringBorders; //return hull;
    }

    getSumMedoids(){
      var clusterData_TF = this.state.clusterData_TF;
      this.denominator_medoidsCluster = [];
      this.labels_medoidsCluster =[];
      this.normalizedData_medoidsCluster =[];
      //let listCluster = [];
      // Normalizing columns to [0, 1]
      let normalizedData = [];
      let mins = [];
      let maxs = [];

      var dimNames = this.state.dimNames;
      var nDims= dimNames.length;
      var label_cluster = [];
      var medoids_clusterData_TF = [];
      for(let k=0; k<Object.keys(clusterData_TF).length; k++){
        var clusterName = Object.keys(clusterData_TF)[k];
        var data = clusterData_TF[clusterName];
        label_cluster.push(clusterName);
        let aux = [];
        for (let i = 0; i < nDims; ++i){
            let val_medoid_sum =0;//sum
            var arrayMedian = []; // computing median
            for (let j = 0; j < data.length; ++j){
                val_medoid_sum = val_medoid_sum + data[j][i]; //sum
                arrayMedian.push(data[j][i]); // computing median
            }
            var median = arrayMedian;
            //val_medoid_sum = val_medoid_sum/data.length;
            aux.push(val_medoid_sum);
        }
        medoids_clusterData_TF.push(aux);
      }

      for (let j = 0; j < nDims; ++j){
          mins.push(medoids_clusterData_TF[0][j]);
          maxs.push(medoids_clusterData_TF[0][j]);
      }
      for (let i = 1; i < medoids_clusterData_TF.length; ++i){
          for (let j = 0; j < nDims; ++j){
              if (medoids_clusterData_TF[i][j] < mins[j]){
                  mins[j] = medoids_clusterData_TF[i][j];
              }
              if (medoids_clusterData_TF[i][j] > maxs[j]){
                  maxs[j] = medoids_clusterData_TF[i][j];
              }
          }
      }

      // computing the denominator of radviz (sums of entries). Also initializing selected array (dots that are selected)
      let denominators = [];
      let selected = [];
      //let listCluster = [];
      for (let i = 0; i < medoids_clusterData_TF.length; ++i){

          let aux = [];
          denominators.push(0);
          // normalizing data by columns => equal weights to all dimensions (words)
          let max_entry_by_row = -1;
          for (let j = 0; j < nDims; ++j){
              let val = (medoids_clusterData_TF[i][j] - mins[j])/(maxs[j] - mins[j]);
              aux.push(val);
              if (val > max_entry_by_row){
                  max_entry_by_row = val;
              }
          }
          // normalizing data by rows => sigmoid computation (max entry in row must be equal to 1)
          if (max_entry_by_row > 0){
              for (let j = 0; j < nDims; ++j){
                  aux[j] /= max_entry_by_row;
                  denominators[i] += aux[j] * this.sigmoid(aux[j], this.state.sigmoid_scale, this.state.sigmoid_translate);
              }
          }
          normalizedData.push(aux);
      }
      this.denominator_medoidsCluster = denominators;
      this.labels_medoidsCluster =label_cluster;
      this.normalizedData_medoidsCluster =normalizedData;
    }

    minmax_XY(x_y) {
        var mn_X = 10000000, mx_X = 0, mn_Y = 10000000, mx_Y = 0;
        for (let i = 0; i < x_y.length; ++i){
            mn_X = Math.min(x_y[i][0], mn_X);
            if (x_y[i][0] > mx_X) mx_X = x_y[i][0];
            if (x_y[i][1] < mn_Y) mn_Y = x_y[i][1];
            if (x_y[i][1] > mx_Y) mx_Y = x_y[i][1];
        };
        return [mn_X, mx_X, mn_Y, mx_Y];
    };

    vecDotProduct(vecA, vecB) {
    	var product = 0;
    	for (var i = 0; i < vecA.length; i++) {
    		product += vecA[i] * vecB[i];
    	}
    	return product;
    }

    vecMagnitude(vec) {
    	var sum = 0;
    	for (var i = 0; i < vec.length; i++) {
    		sum += vec[i] * vec[i];
    	}
    	return Math.sqrt(sum);
    }

    cosineSimilarity(vecA, vecB) {
    	return this.vecDotProduct(vecA, vecB) / (this.vecMagnitude(vecA) * this.vecMagnitude(vecB));
    }

    getSimilarityMatrix(normalizedData, data_clusters){
      var normalizedData_medoidsCluster =normalizedData;
      var cosineSimilarityMatrix = {};
      var maxSimilarities = {};
      for(let k=0; k<Object.keys(data_clusters).length; k++){
        var clusterName = Object.keys(data_clusters)[k];
        var vecA = normalizedData_medoidsCluster[this.labels_medoidsCluster.indexOf(clusterName)]; //var index_labelCluster = this.labels_medoidsCluster.indexOf(clusterName);
        var max =0; var indexMax = ""; var indexMaxName={};
        var similarityArray=[];
        for(let l=0; l<Object.keys(data_clusters).length; l++){
          var pairSimilar ={};

          let clusterNameB = Object.keys(data_clusters)[l];
          var vecB = normalizedData_medoidsCluster[this.labels_medoidsCluster.indexOf(clusterNameB)];
          var distance = this.cosineSimilarity(vecA, vecB);
          if(l>k){
            pairSimilar[clusterNameB]=distance;
            similarityArray.push(pairSimilar);
          }
          if(l!=k){
            if(max<distance){
              max =distance;
              indexMax = clusterNameB;
            }
          }
        }
        if(similarityArray.length>0){ cosineSimilarityMatrix[clusterName]=similarityArray;}
        indexMaxName[indexMax] = max;
        maxSimilarities[clusterName]= indexMaxName;
      }
      this.maxSimilarities = maxSimilarities;
      return cosineSimilarityMatrix;
    }

    getPointsClusterRadViz(x_y,mn_X, mx_X, mn_Y, mx_Y,p_medoid){
      let p = [0,0];
      //for (let j = 0; j < 2;++j){
        //let s = this.sigmoid(data[i][j], this.state.sigmoid_scale, this.state.sigmoid_translate);
        p[0] = x_y[0];
        p[1] = x_y[1];
      //}
      if(isNaN(p[0])) p[0]=0;//when all dimension values were zero.
      if(isNaN(p[1])) p[1]=0;//When all dimension values were zero

      var a = -this.state.sizeMdproj; var b = this.state.sizeMdproj;
      var r =1;
      p[0] = (b-a)*((p[0] - mn_X) / (mx_X - mn_X)) + (a); //Normalizing points from 'a' to 'b'
      p[1] = (b-a)*((p[1] - mn_Y) / (mx_Y - mn_Y))+ (a); //Normalizing points from 'a' to 'b'
      var x_p = p_medoid[0];
      var y_p = p_medoid[1];

      var inside_circle = Math.sqrt((p[0]+x_p)**2 + (p[1]+y_p)**2); //determination if the medoids p(x,y) is inside the circunfence
      if(inside_circle>(r-b)){
        x_p = ((p[0]+x_p)>0)?x_p-b:x_p+b;
        y_p = ((p[1]+y_p)>0)?y_p-b:y_p+b;}

      p[0] = p[0]+x_p;
      p[1] = p[1]+y_p;

      return p;
    }

    projectionPCA(data_clusters, anchors){
      this.currentMapping = new Array(this.props.data.length);
      let ret = [];
      var medoidsPoints = {};
      var arrayBorders = [];
      for(let k=0; k<Object.keys(data_clusters).length; k++){
        var clusterName = Object.keys(data_clusters)[k];
        var data = data_clusters[clusterName];
        let x_y = this.computePCA(data, clusterName);

        var mn_X = 0, mx_X = 0, mn_Y = 0, mx_Y = 0;
        [mn_X, mx_X, mn_Y, mx_Y] = this.minmax_XY(x_y);

        var index_labelCluster = this.labels_medoidsCluster.indexOf(clusterName);
        let p_medoid = [0,0];
        for (let j = 0; j < anchors.length;++j){
          let s = this.sigmoid(this.normalizedData_medoidsCluster[index_labelCluster][j], this.state.sigmoid_scale, this.state.sigmoid_translate);
          p_medoid[0] += anchors[j][0]*this.normalizedData_medoidsCluster[index_labelCluster][j]/this.denominator_medoidsCluster [index_labelCluster] * s;
          p_medoid[1] += anchors[j][1]*this.normalizedData_medoidsCluster[index_labelCluster][j]/this.denominator_medoidsCluster [index_labelCluster] * s;
        }
        if(isNaN(p_medoid[0])) p_medoid[0]=0;//when all dimension values were zero.
        if(isNaN(p_medoid[1])) p_medoid[1]=0;//When all dimension values were zero

        medoidsPoints[clusterName]=p_medoid;
        var borderPointsCluster = [];
        for (let i = 0; i < x_y.length; ++i){

          var idInCluster = this.state.idsDataIntoClusters[clusterName][i];
          var p = [0,0];
          if((this.state.selected[idInCluster] && this.state.buttonExpand) || this.state.expandedData[idInCluster]){
            this.expandedDataLocal.push(idInCluster);
            p = this.getPointsOriginalRadViz(idInCluster,anchors,this.state.normalizedData );
          }
          else{
            p =this.getPointsClusterRadViz(x_y[i],mn_X, mx_X, mn_Y, mx_Y,p_medoid);
          }

          if(isNaN(p[0])) p[0]=0;//when all dimension values were zero.
          if(isNaN(p[1])) p[1]=0;//When all dimension values were zero

          this.currentMapping[idInCluster]= p; //When we apply clustering, the order of the data could change. So it better keep the original order.
          if(this.props.projection == 'Model Result'){
            if(this.props.modelResult[idInCluster]!=='trainData'){
              ret = this.setColorPoints(idInCluster, ret, p[0], p[1]);
            }
          }
          else{
            ret = this.setColorPoints(idInCluster, ret, p[0], p[1]);
          }
          var border = []; border[0] = this.scaleX(p[0]); border[1]=this.scaleY(p[1]);
          borderPointsCluster.push(border);
        }
        var pointsBordes = this.convexHull(borderPointsCluster);

        arrayBorders.push(pointsBordes);
      }
      this.borderStringClusters = arrayBorders;

      var pairwise_medoidsPoints = [];
      var maxSimilarities = this.getSimilarityMatrix(this.normalizedData_medoidsCluster, data_clusters);
      //console.log("SIMILARITIES");
      //console.log(maxSimilarities);
      var cont =0;
      for(let k=0; k<Object.keys(maxSimilarities).length; k++){
        var clusterName = Object.keys(maxSimilarities)[k];
        //console.log(maxSimilarities[clusterName]);
        for(let l=0; l<maxSimilarities[clusterName].length; l++){
          var oneObjSimilarity = maxSimilarities[clusterName][l];
          var arrayPoints = medoidsPoints[clusterName].concat(medoidsPoints[Object.keys(oneObjSimilarity)[0]]);
          var arrayPoints_valueSimilarity =arrayPoints.concat(oneObjSimilarity[Object.keys(oneObjSimilarity)[0]]);
          pairwise_medoidsPoints[cont]=arrayPoints_valueSimilarity;
          cont++;
        }
      }
      var maxSimilarities_medoidsPoints = [];
      var maxSimilarities = this.maxSimilarities;
      for(let k=0; k<Object.keys(maxSimilarities).length; k++){
        var clusterName = Object.keys(maxSimilarities)[k];
        var arrayPoints = medoidsPoints[clusterName].concat(medoidsPoints[ Object.keys(maxSimilarities[clusterName])[0] ]);
        var arrayPoints_valueSimilarity =arrayPoints.concat(maxSimilarities[clusterName][Object.keys(maxSimilarities[clusterName])[0]]);
        maxSimilarities_medoidsPoints[k]=arrayPoints_valueSimilarity;
      }
      this.maxSimilarities_medoidsPoints = maxSimilarities_medoidsPoints;

      this.pairwise_medoidsPoints = pairwise_medoidsPoints;

      return ret;
    }

    euclideanDistance(p1, p2){
      return Math.sqrt( Math.pow((p2[0]-p1[0]), 2) + Math.pow((p2[1]-p1[1]), 2) );
    }

    intraClusterDist(points_in_cluster, centroid){
      var total_dist = 0
      //for every item in cluster j, compute the distance the the center of cluster j, take average
      for(var i=0; i<points_in_cluster.length; i++){
        var p = points_in_cluster[i];
        var dist = this.euclideanDistance(centroid, p);
        total_dist = dist + total_dist;
      }
      return total_dist/points_in_cluster.length;
    }

    //var clusters = [ [[1,2],[3,4],[2,4]], [[2,3],[1,1]], [[1,2],[4,5],[2,7],[9,3]]; // [points_in_cluster1, points_in_cluster2, points_in_cluster3 ]
    //var centroids = [[1,2],[1,1], [2,7]]; // [centroid_cluster1, centroid_cluster2, centroid_cluster3]
    daviesBouldinIndex(clusters, centroids){
      var intra_cluster_dists = []; //[intra_cluster1_dist, intra_cluster2_dist, intra_cluster3_dist]
      for(var i=0; i<clusters.length; i++){
        intra_cluster_dists.push(this.intraClusterDist(clusters[i], centroids[i]));
      }
      var DBindex = 0;
      var DB_sum = 0;
      for(var i=0; i<clusters.length; i++){
        var max_num = -9999;
        for(var j=0; j<clusters.length; j++){
          if(i!=j){
            var inter_cluster_dist = this.euclideanDistance(centroids[j], centroids[i]);
            var DBi = (intra_cluster_dists[i] + intra_cluster_dists[j])/inter_cluster_dist;
            if(DBi > max_num){
                max_num = DBi
            }
          }
        }
        DB_sum = DB_sum+max_num;
      }
      return DB_sum/clusters.length;
    }

    computeCentroid(points){
      var centroidX = 0;
      var centroidY = 0;

        for(var i=0; i<points.length ; i++) {
            centroidX += points[i][0];
            centroidY += points[i][1];
        }
    return [centroidX / points.length, centroidY / points.length];
    }

    evaluateClustering(data_clusters, anchors){
      var currentMapping = new Array(this.props.data.length);
      let ret = [];
      var medoidsPoints = {};
      var arrayBorders = [];

      this.clusters_points = [];
      this.centroids =[];
      var temporalEvaluation = {};
      for(var a=0; a<this.props.colors.length; a++){
        temporalEvaluation[this.props.colors[a]]=[];
      }
      for(let k=0; k<Object.keys(data_clusters).length; k++){
        var evaluate_cluster_points = [];

        var clusterName = Object.keys(data_clusters)[k];
        var data = data_clusters[clusterName];
        let x_y = this.computePCA(data, clusterName);

        var mn_X = 0, mx_X = 0, mn_Y = 0, mx_Y = 0;
        [mn_X, mx_X, mn_Y, mx_Y] = this.minmax_XY(x_y);

        var index_labelCluster = this.labels_medoidsCluster.indexOf(clusterName);
        let p_medoid = [0,0];
        for (let j = 0; j < anchors.length;++j){
          let s = this.sigmoid(this.normalizedData_medoidsCluster[index_labelCluster][j], this.state.sigmoid_scale, this.state.sigmoid_translate);
          p_medoid[0] += anchors[j][0]*this.normalizedData_medoidsCluster[index_labelCluster][j]/this.denominator_medoidsCluster [index_labelCluster] * s;
          p_medoid[1] += anchors[j][1]*this.normalizedData_medoidsCluster[index_labelCluster][j]/this.denominator_medoidsCluster [index_labelCluster] * s;
        }
        if(isNaN(p_medoid[0])) p_medoid[0]=0;//when all dimension values were zero.
        if(isNaN(p_medoid[1])) p_medoid[1]=0;//When all dimension values were zero

        medoidsPoints[clusterName]=p_medoid;
        for (let i = 0; i < x_y.length; ++i){

          var idInCluster = this.state.idsDataIntoClusters[clusterName][i];
          var p = [0,0];
          if(this.state.radvizTypeProjection<=3){
          //if((this.state.selected[idInCluster] && this.state.buttonExpand) || this.state.expandedData[idInCluster]){
            p = this.getPointsOriginalRadViz(idInCluster,anchors,this.state.normalizedData );
            evaluate_cluster_points.push(p);
          }
          else{
            p =this.getPointsClusterRadViz(x_y[i],mn_X, mx_X, mn_Y, mx_Y,p_medoid);
          }


          if(isNaN(p[0])) p[0]=0;//when all dimension values were zero.
          if(isNaN(p[1])) p[1]=0;//When all dimension values were zero
          var scale_xy = []; scale_xy[0] = this.scaleX(p[0]); scale_xy[1]=this.scaleY(p[1]);
          temporalEvaluation[this.props.colors[idInCluster]].push(scale_xy);
          currentMapping[idInCluster]= p; //When we apply clustering, the order of the data could change. So it better keep the original order.
          if(this.props.projection == 'Model Result'){
            if(this.props.modelResult[idInCluster]!=='trainData'){
              ret = this.setColorPoints(idInCluster, ret, p[0], p[1]);
            }
          }
          else{
            ret = this.setColorPoints(idInCluster, ret, p[0], p[1]);
          }
          //var border = []; border[0] = this.scaleX(p[0]); border[1]=this.scaleY(p[1]);
        }


        this.clusters_points.push(evaluate_cluster_points);
        this.centroids.push(p_medoid);
      }
      var temp_clusters_points=[];
      var temp_centroids=[];
      for(let k=0; k<Object.keys(temporalEvaluation).length; k++){
        var clusterName = Object.keys(temporalEvaluation)[k];
        var data = temporalEvaluation[clusterName];
        temp_clusters_points.push(data);
        temp_centroids.push(this.computeCentroid(data));
      }
      /*console.log(temp_clusters_points);
      console.log(temp_centroids);
      console.log("**********************************************************************");
      console.log(this.clusters_points);
      console.log(this.centroids);*/
      //evaluate Davies Blanid Index
      var DBindex = this.daviesBouldinIndex(temp_clusters_points, temp_centroids);
      console.log('----------------------------------------DBindex----------------------------------------');
      console.log(DBindex);
    }


    setLines(i, ret, p0, p1,p2,p3, color){
      if(i>3){
        i=i-0.5;
        ret.push(<line x1={this.scaleX(p0)} y1={this.scaleY(p1)} x2={this.scaleY(p2)} y2={this.scaleY(p3)} style={{stroke:color, strokeWidth:i, borderTop: 'dashed', strokeDasharray:"8, 0", dropShadow:"0 2px 1px black"}} />);
      }
      else{
        ret.push(<line x1={this.scaleX(p0)} y1={this.scaleY(p1)} x2={this.scaleY(p2)} y2={this.scaleY(p3)} style={{stroke:color, strokeWidth:i, borderTop: 'dashed', strokeDasharray:"5, 3", dropShadow:"0 2px 1px black"}} />);
      }
      return ret;
    }
    getAngle(p0, p1,p2, p3){
      // angle in degrees
      let center=[p0, p1];
      let destine=[p2, p3];
      let vec=[destine[0] - center[0], destine[1]-center[1]];
      let normVec=numeric.norm2(vec);
      vec[0] /= normVec;
      vec[1] /= normVec;
      // Computing the angle by making a dot product with the [1,0] vector
      let cosAngle = vec[0];
      let angle = Math.acos(cosAngle);
      if (destine[1] < center[1])
          {angle *= -1;}
      return angle;
    }
    reduceLineLength(points, d){
      var newPoints = [];
      var p0 = points[0]; var p1 = points[1]; var p2 = points[2]; var p3 = points[3];
      var angleDegXc = this.getAngle(p0, p1,p2, p3); //Math.atan2(p1 - p3, p0 - p2) * 180 / Math.PI;
      newPoints[0] = p0 + d * Math.cos(angleDegXc);
      newPoints[1] = p1 + d * Math.sin(angleDegXc);
      var angleDegXp = this.getAngle(p2, p3, p0, p1);//Math.atan2(p3 - p1, p2 - p0) * 180 / Math.PI;
      newPoints[2] = p2 + d * Math.cos(angleDegXp);
      newPoints[3] = p3 + d * Math.sin(angleDegXp);
      return newPoints;
    }
    drawLinesSimilarity(pairwise_medoidsPoints, highSimilarities){
      let ret = [];
      for(var i=0; i<pairwise_medoidsPoints.length; i++){
        var p0 = pairwise_medoidsPoints[i][0]; var p1 = pairwise_medoidsPoints[i][1]; var p2 = pairwise_medoidsPoints[i][2]; var p3 = pairwise_medoidsPoints[i][3];
        var newPoints = this.reduceLineLength(pairwise_medoidsPoints[i], this.state.sizeMdproj);
        var similarityThreshold = pairwise_medoidsPoints[i][4];
        if(highSimilarities){
          ret = this.setLines((similarityThreshold*10)+2, ret, newPoints[0], newPoints[1],newPoints[2],newPoints[3], '#ADFF2F');
        }
        else if(similarityThreshold>this.state.clusterSimilarityThreshold){
          ret = this.setLines((similarityThreshold*10)+2, ret, newPoints[0], newPoints[1],newPoints[2],newPoints[3], '#8c8b8b');
        }
      }
      return ret;
    }
    drawBordersCluster(borderStringClusters){
      let ret = [];
      for(var i=0; i<borderStringClusters.length; i++){
        ret.push(<polygon points={borderStringClusters[i]} style={{fill:'silver',  opacity:'0.2'}} />);
      }
      return ret;
    }

    getPointsOriginalRadViz(i,anchors, data){
      let p = [0,0];
      for (let j = 0; j < anchors.length;++j){
        let s = this.sigmoid(data[i][j], this.state.sigmoid_scale, this.state.sigmoid_translate);
        p[0] += anchors[j][0]*data[i][j]/this.state.denominators[i] * s;
        p[1] += anchors[j][1]*data[i][j]/this.state.denominators[i] * s;
      }
      if(isNaN(p[0])) p[0]=0;//when all dimension values were zero.
      if(isNaN(p[1])) p[1]=0;//When all dimension values were zero
      return p;
    }

    radvizMapping(data, anchors){
      this.currentMapping = [];
      let ret = [];
      for (let i = 0; i < data.length; ++i){
        var p = this.getPointsOriginalRadViz(i,anchors, data);
        this.currentMapping.push(p);
        if(this.props.projection == 'Model Result'){
          if(this.props.modelResult[i]!=='trainData'){
            ret = this.setColorPoints(i, ret, p[0], p[1], data);
          }
        }
        else{
          ret = this.setColorPoints(i, ret, p[0], p[1]);
        }

      }
      return ret;
    }

    setSelectedAnchors(data){
          let selectedAnchors = [];
          for (let j = 0; j < this.state.dimNames.length;++j){
            for (let i = 0; i < data.length; ++i){
                if(data[i][j]>0 && this.state.selected[i] ){
                  selectedAnchors[this.state.dimNames[j]]=true; break;
                }
                else selectedAnchors[this.state.dimNames[j]]=false;
            }
          }
          //console.log(selectedAnchors);
          this.selectedAnchors=selectedAnchors;
          return selectedAnchors;
    }
    setSelectedAnchorsAux(data, selected){
          let selectedAnchors = [];
          for (let j = 0; j < this.state.dimNames.length;++j){
            for (let i = 0; i < data.length; ++i){
                if(data[i][j]>0 && selected[i] ){
                  selectedAnchors[this.state.dimNames[j]]=true; break;
                }
                else selectedAnchors[this.state.dimNames[j]]=false;
            }
          }
          //console.log(selectedAnchors);
          this.selectedAnchors=selectedAnchors;
          return selectedAnchors;
    }

    stopDrag(e){

    	if (this.state.draggingSelection){
            if (this.selectionPoly.length > 0){
        		let selected = [];
        		for (let i = 0; i < this.props.data.length; ++i){
              var tempSelected = this.pointInPolygon(this.currentMapping[i], this.selectionPoly);
              if(this.props.projection == 'Model Result'){
                if(this.props.modelResult[i]!=='trainData'){
                  if(tempSelected && (this.props.showedData===2 && !(this.state.selected[i]))) tempSelected = !tempSelected;
                }
                else tempSelected = false;
              }
              else{
                if(tempSelected && (this.props.showedData===2 && !(this.state.selected[i]))) tempSelected = !tempSelected;
              }
              selected.push(tempSelected);
        		}
        		this.selectionPoly= [];
            var termFrequencies =  this.setSelectedTermFrequency(this.props.data,selected,this.state.dimNames);
        		this.setState({'draggingSelection':false, 'selected':selected, 'termFrequencies':termFrequencies});
        		this.props.callbackSelection(selected);
            this.props.setSelectedPoints(selected);
            var selectedAnchors = this.setSelectedAnchorsAux(this.state.normalizedData, selected);
            this.props.setSelectedAnchorsRadViz(selectedAnchors);
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
        this.sortDimensions();

    	}
      if(this.state.selected.includes(true)  && this.state.buttonExpand){
        var temp = this.state.expandedData;
        for(var i=0; i<this.expandedDataLocal.length; i++){
          temp[this.expandedDataLocal[i]] =true;
        }
        this.props.resetButtonExpand(temp);
      }
    }


    startDragAnchor(i){
        return function(e){
            this.setState({'draggingAnchor':true, 'draggingAnchor_anchor_id':i});
            e.stopPropagation();
        }.bind(this);
    }

    highlightData_(selectedDims){
      var nameFeatures = [];
      for(let t=0; t<selectedDims.length; t++){
        nameFeatures.push(this.state.dimNames[selectedDims[t]]);
      }
      var selected = [];
      //var nameFeature= this.state.dimNames[i];
      for (let i = 0; i < this.props.data.length; ++i){
        var booleanDim = false;
        for(let j=0; j<nameFeatures.length; j++ ){
          var nameFeature= nameFeatures[j];
          if(nameFeature != 'labels' && nameFeature != 'urls' && nameFeature != 'pred_labels' ){
              var frequencyTerm = this.props.data[i][nameFeature];
              if(frequencyTerm>0){
                booleanDim = true;
                break; //boolean Or operator - Less stricted filter
              }
              else{
                booleanDim = false;
                //break; //Boolean And operator. More stricted filter
              }
          }
        }
        selected.push(booleanDim);
      }
      var termFrequencies =  this.setSelectedTermFrequency(this.props.data,selected,this.state.dimNames);
      this.setState({ 'selected':selected, 'termFrequencies':termFrequencies, 'draggingSelection':false});
      this.props.callbackSelection(selected);
      this.props.setSelectedPoints(selected);
      var selectedAnchors = this.setSelectedAnchorsAux(this.state.normalizedData, selected);
      this.props.setSelectedAnchorsRadViz(selectedAnchors);
      this.forceUpdate();
    }

    highlightData(selectedDims){
      return function(e){
        //console.log(selectedDims);
          this.highlightData_(selectedDims);
          e.stopPropagation();
      }.bind(this);
    }

    pointInPolygon(point, polygon){
        polygon.push(polygon[0]);
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
        let container = $('#svg_radviz').get(0).getBoundingClientRect();
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
                {angle *= -1;}
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
  	            {angle *= -1;}
  	        let angleDifference = angle - this.state.startAnchorGroupAngle;
  	        this.setState({'offsetAnchors':angleDifference});
        }
    }

    sigmoid(x, scale, translate){
        return (1/(1+Math.exp(-(scale*(x + translate)))));
    }

    svgPoly(points){
        if (points && points.length > 0){
            let pointsStr = '';
            for (let i = 0; i < points.length; ++i){
                pointsStr = pointsStr + points[i][0] + ',' + points[i][1] + ' ';
            }
            return (<polygon points={pointsStr} style={{fill:'rgba(0,75,100,0.4)',stroke:'none',strokeWidth:1}}/> );
        }else{
            return ;
        }
    }

    startDragSelect(e){
        this.setState({'draggingSelection':true});
            this.selectionPoly = [];
    }

    unselectAllData(e){
      let selected = [];
      for (let i = 0; i < this.props.data.length; ++i){
        selected.push(false);
      }
      var termFrequencies =  this.setSelectedTermFrequency(this.props.data,selected,this.state.dimNames);
      this.setState({'draggingSelection':false, 'selected':selected, 'termFrequencies':termFrequencies});
      this.props.setSelectedPoints(selected);
      //this.props.setSelectedAnchorsRadViz([]);
    }
    handleKeyDown(e){
      if (e.keyCode === 27){
        this.unselectAllData(e);
      }
    }

    startDragAnchorGroup(e){
      let container = $('#svg_radviz').get(0).getBoundingClientRect();
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
      {angle *= -1;}
      e.stopPropagation();
      this.setState({'draggingAnchorGroup':true, 'startAnchorGroupAngle':angle});
    }

    normalizeAngle(angle) {
      return Math.atan2(Math.sin(angle), Math.cos(angle));
    }


    sortDimensions(){
      var anchorAngles_Obj =  Object.assign({}, this.state.anchorAngles.slice());
      Object.keys(anchorAngles_Obj).forEach(key => {
        if(anchorAngles_Obj[key]<0) { anchorAngles_Obj[key]=(anchorAngles_Obj[key]+3.141592653589793)+3.141592653589793;}
      });

      var keysSorted = Object.keys(anchorAngles_Obj).sort(function(a,b){return anchorAngles_Obj[a]-anchorAngles_Obj[b];});

      var temp = this.state.anchorAngles.slice();
      for (let i = 0; i < this.state.nDims; ++i){
            temp[keysSorted[i]]=i * 2*Math.PI / this.state.nDims;
      }
      this.setState({'anchorAngles':temp});
    }

    setSelectedTermFrequency(data, selected,dimNames){
      var frequency_list = [];
      var hashmapTerms = [];
      let selectedAnchors = [];
      var frequencies ={};
      for (let j = 0; j < dimNames.length;++j){
        var nameFeature= dimNames[j];
        if(nameFeature != 'labels' && nameFeature != 'urls' && nameFeature != 'pred_labels' ){
          hashmapTerms[nameFeature]=0;
          for (let i = 0; i < data.length; ++i){
              var frequencyTerm = data[i][nameFeature];
              if(selected.includes(true)){
                if(selected[i]){ //create wordcloud based just on the selected data.
                  hashmapTerms[nameFeature]=hashmapTerms[nameFeature] + frequencyTerm;
                }
              }
              else{
                hashmapTerms[nameFeature]=hashmapTerms[nameFeature] + frequencyTerm;
              }
          }
          if(hashmapTerms[nameFeature] > 0)  {
            frequency_list.push({'text': nameFeature, 'value': hashmapTerms[nameFeature] });

          }
        }
      }
      var maxValue = Math.max.apply(Math,frequency_list.map(function(o){return o.value;}));
      var minRange=1, maxRange=25;
      if(maxValue<12000){ minRange= 1; maxRange=50;} else {maxValue =13000;}
      for(var i in frequency_list){
        var scaleX = scaleLinear().domain([0,maxValue]).range([minRange,maxRange]);
        frequencies[frequency_list[i]['text']]=scaleX(frequency_list[i].value);
        frequency_list[i].value = scaleX(  frequency_list[i].value);
      }
      //this.setState({selectedPoints: this.state.selected});
      return frequencies;
    }

    // Adding selected keywords list.
    addDelKeywords(i){
      //console.log(i);
      var nameFeature= this.state.dimNames[i];
      var tempDelKeywords = this.listRemovedKeywords;
      var indexFound = tempDelKeywords.indexOf(nameFeature);
      if(indexFound> -1){
        tempDelKeywords.splice(indexFound, 1);
      }
      else {
        tempDelKeywords.push(nameFeature);
      }
      this.props.updateListRemoveKeywords(tempDelKeywords); //Sending list of selected keywords for removing of RadViz
    }

    highlightDataBySelectedDims(selectedDims){
      this.highlightData_(selectedDims);
    }

    render() {
      //console.log("Render RADVIZ");
      let sampleDots = [];
      let anchorDots = [];
      let anchorText = [];
      let sampleTSNE = [];
      let selectedAnchors = [];
      let lineSimilarities = [];
      let highSimilarities = [];
      let borderClusters = [];
      let listBarChart = <div></div>;

      if (this.props.data){
        let anchorXY = [];
        for (let i = 0; i < this.state.nDims; ++i){
          anchorXY.push(this.anglesToXY(this.state.anchorAngles[i], 1));
        }
        selectedAnchors = this.setSelectedAnchors(this.state.normalizedData);
        var termFrequencies =  this.state.TermFrequencies;
        for (let i = 0; i < this.state.nDims; ++i){
          var selectedDim = []; selectedDim.push(i);
          anchorDots.push(<circle cx={this.scaleX(anchorXY[i][0])} cy={this.scaleX(anchorXY[i][1])} r={5} onClick={this.highlightData(selectedDim)}

          key={i} style={{cursor:'hand', stroke:(selectedAnchors[this.state.dimNames[i]]?'black':'none'), fill:((selectedAnchors[this.state.dimNames[i]]||(!(this.state.selected.includes(true))))?'black':'#9c9c9c'), strokeWidth:(selectedAnchors[this.state.dimNames[i]]?1:'none'),
          opacity:((selectedAnchors[this.state.dimNames[i]]||(!(this.state.selected.includes(true))))?1:0.3),}}/>);

          let normalizedAngle = this.normalizeAngle(this.state.anchorAngles[i] + this.state.offsetAnchors);
          let sizeText = (selectedAnchors[this.state.dimNames[i]]||(!(this.state.selected.includes(true))))?'12':'11';
          var colorText = (this.state.dimNames[i].toLowerCase() === this.state.searchText_FindAnchor.toLowerCase())?'#FFFF00':'#000000'; //(selectedAnchors[this.state.dimNames[i]]?'black':'black')
          var strokeText = (this.state.dimNames[i].toLowerCase() === this.state.searchText_FindAnchor.toLowerCase())?'#0000ff':'None';
          var x_checkbox =10;
          var x_rect = x_checkbox-1;
          var x_checkbox_else = (-1)*x_checkbox;
          var checkBoxList1 = (this.state.showCheckBoxRemoveKeywords)? <foreignObject  x={-4} y={-14}  transform={`rotate(${(normalizedAngle)*180/Math.PI})`}> <label onClick={this.addDelKeywords.bind(this, i) }  ><input id="checkBox" type="checkbox" value={i}/></label></foreignObject> : <div/>;
          var checkBoxList2 =  (this.state.showCheckBoxRemoveKeywords)? <foreignObject  x={-8} y={-7}  transform={`rotate(${(normalizedAngle)*180/Math.PI}) rotate(180)` }><label onClick={this.addDelKeywords.bind(this,i) }  > <input id="checkBox" type="checkbox" value={i}/></label></foreignObject> : <div/>;
          if (Math.abs(normalizedAngle) < Math.PI/2){
            anchorText.push(
              <g transform={`translate(${this.scaleX(anchorXY[i][0]*1.06)}, ${this.scaleX(anchorXY[i][1]*1.06)})`} key={i}>
              {checkBoxList1}
              <rect x={x_rect} y={-8} width={this.state.termFrequencies[this.state.dimNames[i]]} height="11" transform={`rotate(${(normalizedAngle)*180/Math.PI})`} fill={"#FFFF00"} stroke={"#CCCC00"}/>
              <text textAnchor='start' x={x_checkbox} y={0} onMouseDown={this.startDragAnchor(i)}   fontSize={sizeText} fill={colorText} stroke={strokeText} transform={`rotate(${(normalizedAngle)*180/Math.PI})`} style={{fill:{colorText}, opacity:((selectedAnchors[this.state.dimNames[i]]||(!(this.state.selected.includes(true))))?1:0.3),}}>{this.state.dimNames[i]}</text>
              </g>);
          }else{
            anchorText.push(
              <g transform={`translate(${this.scaleX(anchorXY[i][0]*1.06)}, ${this.scaleX(anchorXY[i][1]*1.06)})`} key={i}>
              {checkBoxList2}
              <rect x={x_rect} y={-9} width={this.state.termFrequencies[this.state.dimNames[i]]} height="11" transform={`rotate(${(normalizedAngle)*180/Math.PI})`} fill={"#FFFF00"} stroke={"#CCCC00"}/>
              <text textAnchor='end' x={x_checkbox_else} y={7} onMouseDown={this.startDragAnchor(i)} fontSize={sizeText} fill={colorText} stroke={strokeText} transform={`rotate(${(normalizedAngle)*180/Math.PI}) rotate(180)`} style={{fill:{colorText}, opacity:((selectedAnchors[this.state.dimNames[i]]||(!(this.state.selected.includes(true))))?1:0.3),}}>{this.state.dimNames[i]}</text>
              </g>);
            }
        }
        sampleDots = (this.state.radvizTypeProjection<=3 )?this.radvizMapping(this.state.normalizedData, anchorXY) : this.projectionPCA(this.state.normalizedClusterData, anchorXY);
        //sampleDots = this.radvizMapping(this.state.normalizedData, anchorXY);
        //sampleTSNE = this.projectionTSNE(this.state.normalizedData, anchorXY);
        lineSimilarities = this.drawLinesSimilarity(this.pairwise_medoidsPoints, false);
        highSimilarities = (this.state.toggledShowLineSimilarity)?this.drawLinesSimilarity(this.maxSimilarities_medoidsPoints, true):'';
        borderClusters = this.drawBordersCluster(this.borderStringClusters);

        if(!this.props.subradviz){
          this.evaluateClustering(this.state.normalizedClusterData, anchorXY);
          listBarChart = <StackedBarChart  termFrequencies={this.state.termFrequencies} dimNames={this.state.dimNames} selectedAnchors={selectedAnchors} highlightDataBySelectedDims={this.highlightDataBySelectedDims.bind(this)}/>;
        }
      }
      return (<div>
          <div>
          {listBarChart}
          </div >
          <div>
            <svg  id={'svg_radviz'}  style={{cursor:((this.state.draggingAnchor || this.state.draggingAnchorGroup)?'hand':'default'), width:this.props.width, height:this.props.height, MozUserSelect:'none', WebkitUserSelect:'none', msUserSelect:'none', float:'right'}}
            onMouseMove={this.dragSVG} onMouseUp={this.stopDrag} onMouseDown={this.startDragSelect} onDoubleClick = {this.unselectAllData} onClick={this.unselectAllData}  onKeyDown={this.handleKeyDown}>
            <ellipse cx={this.props.width/2} cy={this.props.height/2} rx={(this.props.width-this.props.marginX)/2} ry={(this.props.height - this.props.marginY)/2}
            style={{stroke:'#ececec',fill:'none', strokeWidth:5, cursor:'hand'}} onMouseDown={this.startDragAnchorGroup}/>
            {borderClusters}
            {lineSimilarities}
            {highSimilarities}

            {sampleDots}
            {this.svgPoly(this.selectionPoly)}
            {anchorText}

            {anchorDots}
            </svg>
            </div>
        </div>
      );
        }
}

RadViz.defaultProps = {
	width:700,
	height:700,
	marginX:190,
	marginY:190,
  sigmoid_translate:0,
  sigmoid_scale:1,
	colors:['red','green','blue'],
	callbackSelection:function(selected){}
};

export default RadViz;
//{sampleDots}
//{this.svgPoly(this.selectionPoly)}
//{anchorText}
