// Filename:		Body.js
// Purpose:		Main page. It shows the RadViz projection and components which allow some interactions.
//Dependencies: Body.js
// Author: Sonia Castelo (scastelo2@gmail.com)
import React, {Component} from 'react';
import { Grid, Row, Col} from 'react-bootstrap';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import CommunicationChatBubble from 'material-ui/svg-icons/communication/chat-bubble';
require('rc-slider/assets/index.css');
import Slider from 'rc-slider';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import ActionFavorite from 'material-ui/svg-icons/action/favorite';
import ActionFavoriteBorder from 'material-ui/svg-icons/action/favorite-border';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import $ from 'jquery';
import {scaleOrdinal, schemeCategory10} from 'd3-scale';
import AutoComplete from 'material-ui/AutoComplete';
import FlatButton from 'material-ui/FlatButton';
import RelevantIcon from 'material-ui/svg-icons/action/thumb-up';
import IrrelevantIcon from 'material-ui/svg-icons/action/thumb-down';
import NeutralIcon from 'material-ui/svg-icons/action/thumbs-up-down';
import ComeBackOriginalData from 'material-ui/svg-icons/action/cached';
import RelevantFace from 'material-ui/svg-icons/action/thumb-up';
import IrrelevantFace from 'material-ui/svg-icons/action/thumb-down';
import NeutralFace from 'material-ui/svg-icons/action/thumbs-up-down';
import IconButton from 'material-ui/IconButton';
import { ButtonGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import SigmoidGraph from './SigmoidGraph';
import WordCloud from './WordCloud';
import SnippetView from './SnippetView';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import RadViz from './RadViz';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import Snackbar from 'material-ui/Snackbar';
import Dialog from 'material-ui/Dialog';
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

class Body extends Component {

 constructor(props){
   super(props);
   this.state={
     flat:0,
     value: 173, // the 'labels' field as the default projection 173
     data:undefined,
     colors:undefined,
     colors_subRadviz:undefined,
     originalData:this.props.originalData,
     showedData:0,
     selectedPoints:[false],
     urls:undefined,
     searchText:'',
     selectedSearchText:[],
     searchText_FindAnchor:'',
     selectedSearchText_FindAnchor:[],
     dimNames:[],
     'sigmoidScale':1,
     'sigmoidTranslate':0,
     'clusterSeparation':0.2,
     'clusterSimilarityThreshold':1,
     accuracy: '0',
     sessionBody: this.props.session,
     checkSigmoid:false,
     checkProjection:false,
     searchText: '',
     subdata:undefined,
     selectedAnchors:[false],
     radvizTypeProjection: 4, //multiscalel radviz
     radvizNroCluster:7,
     toggledShowLineSimilarity: false,
     buttonExpand:false,
     expandedData:[],
     toggledShowCheckBoxRemoveKeywords:false,
     updatingRadViz: this.props.updatingRadViz,
     openDialogSelectedData: false
   };

   this.updateOnSelection = this.updateOnSelection.bind(this);
   this.updateOnSelection_FindAnchor = this.updateOnSelection_FindAnchor.bind(this);
   this.updateSigmoidScale = this.updateSigmoidScale.bind(this);
   this.updateSigmoidTranslate = this.updateSigmoidTranslate.bind(this);
   this.updateClusterSeparation = this.updateClusterSeparation.bind(this);
   this.updateClusterSimilarityThreshold = this.updateClusterSimilarityThreshold.bind(this);
   this.handleUpdateInput = this.handleUpdateInput.bind(this);
   this.handleUpdateInput_FindAnchor = this.handleUpdateInput_FindAnchor.bind(this);
   this.showingData = this.showingData.bind(this);
   this.showingUrls = this.showingUrls.bind(this);
   this.handleCloseDialogSelectedData = this.handleCloseDialogSelectedData.bind(this)
   //#ff7f0e:orange, #2ca02c:green, #17becf:light blue, #b27eac:purple
   this.colorDefault= [ '#17becf', '#2ca02c','#b27eac', '#bcbd22', '#ff7f0e', '#8c564b',  '#e377c2', '#f198f1', '#bcbd22' ];
   this.colorTags= [ '#9E9E9E', '#0D47A1', '#C62828', '#FFFFFF'];
   this.tagsNames ={};
     this.fontSize='13px';
   this.indexColor = -1;
   this.listRemovedKeywords=[];


 };

 showingData(event, value){
  this.setState({showedData:value,});
 }

 setSelectedPoints(selected){
   //var counts = {};
   //selected.forEach(function(x) { counts[x] = (counts[x] || 0)+1; });
   var  newColors = [];
   for(var i = 0 ; i<selected.length; i++){
     if(selected[i]){
       newColors.push(this.state.colors[i]);
     }
   }


    if(this.state.searchText.replace(/\s/g,'') === ''){var selectedSearchText = []; this.setState({selectedPoints:selected, selectedSearchText: selectedSearchText, colors_subRadviz:newColors});
    }
    else this.setState({selectedPoints:selected, selectedSearchText: selected, colors_subRadviz:newColors});

 }

 setSelectedAnchorsRadViz(selected){
   this.setState({selectedAnchors:selected});
 }

 showingUrls(){
   let urls = [];
   for (let i = 0; i < this.state.originalData['urls'].length; ++i){
       if(this.state.selectedPoints[i]){
         urls.push(<p>{this.state.originalData['urls'][i] }</p>);
       }
     }
  return urls;
 }

 setColorPoints(value, dimNames, temp_originalData){
   var originalData =JSON.parse(JSON.stringify(temp_originalData));
   var colorToCustomTags = scaleOrdinal(this.colorDefault);
   let colors = [];
   for (let i = 0; i < originalData[dimNames[0]].length; ++i){
      var colorTag='';
      if(dimNames[value]==='labels' || dimNames[value]==='Model Result' ){
        var array_tags = originalData[dimNames[value]][i];
        this.indexColor=-1;
        array_tags = array_tags.map(function(x){ return x.toString().toLowerCase(); });
        array_tags.map(function(x){
          if(x!=='neutral' && x!=='relevant' && x!=='irrelevant'){
            this.indexColor=array_tags.indexOf(x);
            if(!this.tagsNames.hasOwnProperty(x)){ this.tagsNames[x] = colorToCustomTags(array_tags[this.indexColor]);};
          }
          else {
            if(!this.tagsNames.hasOwnProperty(x)){
              this.tagsNames[x] = (x==='relevant')? this.colorTags[1]: (x==='irrelevant')? this.colorTags[2]:this.colorTags[0];
            }
          }
         }.bind(this));
        colorTag = (this.indexColor!=-1)? colorToCustomTags(array_tags[this.indexColor]):(array_tags.includes('relevant'))? this.colorTags[1]: (array_tags.includes('irrelevant'))? this.colorTags[2]:(array_tags.includes('neutral'))? this.colorTags[0]:'';
        this.indexColor=-1;
      }
      else {
        var typeTag = originalData[dimNames[value]][i];
        colorTag = (this.indexColor!=-1)? colorToCustomTags(typeTag):'';
      }
      colors.push(colorTag);
   }
   return colors;
 }

 //Update colors based on tag or modelResult.
 updateColorsTags(value){
   let dimNames = Object.keys(this.state.originalData);
   let colors = this.setColorPoints(value, dimNames, this.state.originalData);
   this.setState({value: value, colors:colors});
   this.forceUpdate();
 }

 //Update colors based on the dimension selected.
 updateColors(value){
   let dimNames = Object.keys(this.state.originalData);
   var scaleColorType = this.colorTags;
   let scaleColor = scaleOrdinal(scaleColorType);
   let colors = [];
   for (let i = 0; i < this.state.originalData[dimNames[0]].length; ++i){
       //colors.push(scaleColor(this.state.originalData[dimNames[value]][i]));
       var typeTag = this.state.originalData[dimNames[value]][i];
       var colorTag=(typeTag.toString().toLowerCase()=='neutral')? this.colorTags[0]: (typeTag.toString().toLowerCase()=='relevant')? this.colorTags[1]: (typeTag.toString().toLowerCase()=='irrelevant')? this.colorTags[2]: '';
       colors.push(colorTag);
   }
   this.setState({value:value, colors:colors});
 }

 //Handling change of dimensions into DropDown.
 updateOnSelection(event, index, value){
    	if(event=='Model Result'){
    	    this.predictUnlabeled(this.state.sessionBody);
    	}
    	this.updateColorsTags(this.state.dimNames.indexOf(event));
  }

  //Handling change of dimensions into 'Find Keyword' DropDown.
  updateOnSelection_FindAnchor(event, index, value){
     this.setState({
       searchText_FindAnchor: this.state.dimNames[index],
     });
     this.forceUpdate();
  }

  updateSigmoidScale(s){
      this.setState({'sigmoidScale':s});
  }

  updateSigmoidTranslate(s){
      this.setState({'sigmoidTranslate':s});
  }
  updateClusterSeparation(s){
      this.setState({'clusterSeparation':s});
  }
  updateClusterSimilarityThreshold(s){
    this.setState({'clusterSimilarityThreshold':s});
  }

    handleNewRequest(searchText){
	var selected = [];

	if(searchText.replace(/\s/g,'') !== ''){
	    for (let i = 0; i < this.state.data.length; ++i){
		for(var j in this.state.dimNames){
		    if( this.state.dimNames[j] === searchText && this.state.data[i][this.state.dimNames[j]]>0)  { selected[i]=true; break;}
		    else selected[i]=false;
		}
	    }
	}
	this.setState({ selectedSearchText: selected, searchText: searchText, selectedPoints:selected,});
    };


  componentWillMount(){
    this.tagsNames ={};
	     this.setState({originalData: this.props.originalData, data:this.props.data, subdata:this.props.data, colors:this.props.colors, flat:this.props.flat, dimNames: this.props.dimNames, value: this.props.dimNames.length});
       //this.updateColorsTags(this.state.value);
       this.runModel();
  }

componentWillReceiveProps(props){
    if(props.updatingRadViz) this.setState({updatingRadViz:props.updatingRadViz,toggledShowCheckBoxRemoveKeywords:false });
  	if(props.originalData !== this.state.originalData){
        let colors = [];
        this.tagsNames ={};
        let dimNames = Object.keys(props.originalData);
        //colors = this.setColorPoints(this.state.value, dimNames, props.originalData);
        //this.setState({value: this.state.value, colors:colors, originalData: props.originalData, data:props.data, subdata:props.data, flat:props.flat, dimNames: props.dimNames, });
        //props.dimNames.length-7 : -7 because we are excluding url, label,title,snippet,image_url,pred_labels, modelResult. we are just using dimensions
        colors = this.setColorPoints(props.dimNames.length-7, dimNames, props.originalData);
        this.setState({value: props.dimNames.length-7, colors:colors, originalData: props.originalData, data:props.data, subdata:props.data, flat:props.flat, dimNames: props.dimNames, updatingRadViz:props.updatingRadViz});

    }
  	if(this.state.dimNames.indexOf(props.searchText) !==-1){
  	    this.handleNewRequest(props.searchText);
  	}
  }

  //Run model if there is an enought positiveTrainData and negativeTrainData.
  runModel(){
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
  }

  getPredictedLabels(){
  	var session = this.state.sessionBody;
  	session['pageRetrievalCriteria'] = 'Model Tags';
  	session['selected_model_tags'] = 'Unsure';
    let updateData = this.state.originalData;
    for (let i = 0; i < updateData['Model Result'].length; i++){
        updateData['Model Result'][i]='trainData';
    }

  	$.post(
  	    '/getPages',
  	    {'session':  JSON.stringify(session)},
  	    function(predicted) {
      		var unsure = predicted['data'];
      		Object.keys(unsure).map((k, i)=>{
      		    var index = updateData['urls'].indexOf(k);
      		    if( index > 0){
      			       updateData['Model Result'][index]='Neutral';
      		    }
      		});
      		this.setState({originalData: updateData });
      		if(this.state.dimNames[this.state.value]=='Model Result') this.updateColorsTags(this.state.value);
    	    }.bind(this)
    );
  	session['selected_model_tags'] = 'Maybe relevant';
  	$.post(
  	    '/getPages',
  	    {'session':  JSON.stringify(session)},
  	    function(predicted) {
      		var relevant = predicted['data'];
      		Object.keys(relevant).map((k, i)=>{
      		    var index = updateData['urls'].indexOf(k);
      		    if( index > 0){
      			       updateData['Model Result'][index]='Relevant';
      		    }
      		});
      		this.setState({originalData: updateData});
      		if(this.state.dimNames[this.state.value]=='Model Result') this.updateColorsTags(this.state.value);

  	    }.bind(this)
  	 );
  	session['selected_model_tags'] = 'Maybe irrelevant';
  	$.post(
  	    '/getPages',
  	    {'session':  JSON.stringify(session)},
  	    function(predicted) {
      		var irrelevant = predicted['data'];
      		Object.keys(irrelevant).map((k, i)=>{
      		    var index = updateData['urls'].indexOf(k);
      		    if( index > 0){
      			       updateData['Model Result'][index]='Irrelevant';
      		    }
      		});
      		this.setState({originalData: updateData});
      		if(this.state.dimNames[this.state.value]=='Model Result') this.updateColorsTags(this.state.value);

  	    }.bind(this)
  	);

  }

  predictUnlabeled(){
    	$.post(
    	    '/predictUnlabeled',
    	    {'session':  JSON.stringify(this.state.sessionBody)},
    	    function(){
    		this.getPredictedLabels();
    	    }.bind(this)
    	);
  }

    /*consultaQueries: {'search_engine':'GOOG','activeProjectionAlg':'Group by Correlation'
      ,'domainId':'AVWjx7ciIf40cqEj1ACn','pagesCap':'100','fromDate':null,'toDate':null,
      'filter':null,'pageRetrievalCriteria':'Most Recent','selected_morelike':'',
      'model':{'positive':'Relevant','nagative':'Irrelevant'}}*/
  createSession(domainId){
    var session = {};
      session['domainId'] = domainId;
      session['pagesCap'] = 100;
    return session;
  }

  setPagesTag(urls, tag, applyTagFlag){
  	$.post(
  	    '/setPagesTag',
  	    {'pages': urls.join('|'), 'tag': tag, 'applyTagFlag': applyTagFlag, 'session': JSON.stringify(this.state.sessionBody)},
  	    function() {
  		      this.runModel();
  	    }.bind(this)
  	);
  }

  updateTags(data, selectedPages, tag, selectedPointsTags){
  	var urls = [];
  	for(let i = 0;i < selectedPages.length;++i){
  	    var index = selectedPages[i];
        var temp_urls = [];
        temp_urls.push(data['urls'][index]);
  	    if (selectedPointsTags[i].toLowerCase() != 'neutral' && selectedPointsTags[i].toLowerCase() != tag.toLowerCase())
  		    {this.setPagesTag(temp_urls, selectedPointsTags[i], false);}
        else {
          this.setPagesTag(temp_urls, selectedPointsTags[i], false);
  	      urls.push(data['urls'][index]);
  	    }
  	}
  	this.setPagesTag(urls, tag, true);
  }

  //Tagging selected data in radviz.
  tagsSelectedData(tag){
      let updateData = {};
      updateData = this.state.originalData;
      var selectedPoints = [];
      var selectedPointsTags = [];
      for (let i = 0; i < this.state.selectedPoints.length; ++i){
          if(this.state.selectedPoints[i]){
            selectedPointsTags.push(updateData['labels'][i].join());
            //updateData['labels'][i] = tag;
            updateData['labels'][i].push(tag);
	          selectedPoints.push(i);
	        }
      }
      this.updateTags(this.state.originalData, selectedPoints, tag, selectedPointsTags);
      this.updateColorsTags(this.state.value);
      this.setState({originalData: updateData});
  }

  //Labeling pages as a relevant.
  tagsRelevant(){
    this.tagsSelectedData('Relevant');//1
  };
  //Labeling pages as a Irrelevant.
  tagsIrrelevant(){
    this.tagsSelectedData('Irrelevant');//2
  };
  //Labeling pages as a Neutral.
  tagsNeutral(){
    this.tagsSelectedData('Neutral');//0
  }

  getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }

  //Labeling pages in RadViz from snippets.
  tagFromSnippets(tag, arrayInputURL, reload){
    for (var i = 0; i < arrayInputURL.length; i++) {
      this.tagSnippets(tag, arrayInputURL[i], reload);
    }
  }

  //Labeling a page from a snippet.
  tagSnippets(tag, index_url, reload){
    var index = index_url;
    let updateData = this.state.originalData;
    var aux_updateData =JSON.parse(JSON.stringify(updateData));
    var selectedPoints = [];
    var index_int = updateData['urls'].indexOf(index);

    var array_tags = aux_updateData['labels'][index_int];
    array_tags = array_tags.map(function(x){ return x.toString().toLowerCase(); });
    if(reload){
      if(tag.toLowerCase() === 'neutral'){
        updateData['labels'][index_int]=['Neutral'];
      }
      else{
        if(array_tags.includes(tag.toString().toLowerCase())){
          var lowCase = array_tags.indexOf(tag.toString().toLowerCase());
          updateData['labels'][index_int].splice(lowCase, 1);
        }
        else{
          if(tag.toLowerCase() === 'relevant' || tag.toLowerCase() === 'irrelevant'){
            if(array_tags.indexOf('relevant')!==-1){
              updateData['labels'][index_int].splice(array_tags.indexOf('relevant'), 1);
            }
            if(array_tags.indexOf('irrelevant')!==-1){
              updateData['labels'][index_int].splice(array_tags.indexOf('irrelevant'), 1);
            }
          }
          updateData['labels'][index_int].push(tag);
        }
      }
    }
    this.setState({originalData: updateData});
    this.updateColorsTags(this.state.value);
  }

  //Labeling pages as a Neutral.
  countTotalLabeledPages(){
    let cont =0;
    for (let i = 0; i < this.state.originalData['labels'].length; ++i){
        if(this.state.originalData['labels'][i].toLowerCase()=='relevant' || this.state.originalData['labels'][i].toLowerCase()=='irrelevant')
            {cont++;}
    }
    return cont;
  }

  comeBack(){
    let keyword ='';
    this.props.filterKeyword(keyword);
  }
  handleSigmoid(){
    (this.state.checkSigmoid)?this.setState({checkSigmoid: false}):this.setState({checkSigmoid: true});
    this.forceUpdate();
  }
  handleProjection(){
    (this.state.checkProjection)?this.setState({checkProjection: false}):this.setState({checkProjection: true});
    this.forceUpdate();
  }
  handleUpdateInput(searchText){
      this.setState({
        searchText: searchText,
      });
    };
  handleUpdateInput_FindAnchor(searchText_FindAnchor){
    this.setState({
      searchText_FindAnchor: searchText_FindAnchor,
    });
  };

    handleNewRequest(){
      this.setState({
        searchText: '',
      });
    };


  //Set pages to object format. It is necessary because SnippetView component, which shows pages as snippets, was already working with this format in DDT. SnippetView component are being re-used with some little changes.
  setPagesToObjectFormat(selectedPoints, originalData){
    var pages = [];
    //var pages = {};
    if(selectedPoints.length>0){
      for (let i = 0; i < originalData['urls'].length; ++i){
        if(selectedPoints[i]){
          /*pages[originalData['urls'][i]] = {'idRadViz':i, 'image_url':originalData['image_url'][i], 'order':0, 'snippet':originalData['snippet'][i], 'timestamp':'', 'title':originalData['title'][i],
          'tags': originalData['labels'][i]};*/
          pages.push({'idRadViz':i, 'url':originalData['urls'][i], 'image_url':originalData['image_url'][i], 'order':0, 'snippet':originalData['snippet'][i], 'timestamp':'', 'title':originalData['title'][i],
          'tags': originalData['labels'][i]});
        }
      }
    }
    return pages;
  }
  reloadFilters(){
    this.props.reloadFilters();
  };
  updateOnlineAccuracy(accuracy){
    this.props.updateOnlineAccuracy(accuracy);
  };

  multiScaleRadViz(){
    if(this.checkSelectedData()){
    let numericalSubDataTSP = [];
    //console.log(this.state.data);
    //console.log(this.state.selectedPoints);
    //console.log(this.state.selectedAnchors);
    for (let i = 0; i < this.state.data.length; ++i){
        let aux = {};
        Object.keys(this.state.data[i]).forEach(function(key) {
          if(this.state.selectedPoints[i]){
            if(this.state.selectedAnchors[key]){
              //console.log("entro");
              aux[key] = this.state.data[i][key];
            }
          }
        }.bind(this));
        if(Object.keys(aux).length>0)
          numericalSubDataTSP.push(aux);
    }
    //console.log(numericalSubDataTSP);
    this.setState({subdata:numericalSubDataTSP});
    this.forceUpdate();
  }
  }

  handleChangeProjection(event, indexProjection, radvizTypeProjection){
    this.setState({radvizTypeProjection:radvizTypeProjection})
    this.props.changeTypeRadViz(radvizTypeProjection);
  };
  handleChangeNroCluster(event, indexProjection, radvizNroCluster){
    this.setState({radvizNroCluster:radvizNroCluster})
    this.props.changeNroCluster(radvizNroCluster);
  };
  onToggleShowSimilatiryLines(){
    this.setState({toggledShowLineSimilarity:!this.state.toggledShowLineSimilarity});
  }
  resetButtonExpand(updatedExpandedData){
    this.setState({buttonExpand:false, expandedData:updatedExpandedData});
  }
  checkSelectedData(){
    var selectedPoints = true;
    if(!this.state.selectedPoints.includes(true)){
      //Handling open/close Dialog
      this.setState({openDialogSelectedData: true});
      selectedPoints = false;
    }
    return selectedPoints;
  }
  handleCloseDialogSelectedData(){
    this.setState({openDialogSelectedData: false});
  }
  handleExpandButton(){
    if(this.checkSelectedData()){
      this.setState({buttonExpand:true});
      this.forceUpdate();
    }
  }
  handleCollapseButton(){
    this.setState({buttonExpand:false, expandedData:[]});
  }
  updateCollapseData(updatedExpandedData){
    this.setState({expandedData:updatedExpandedData});
  }

  onToggleShowCheckBoxRemoveKeywords(){
    this.setState({toggledShowCheckBoxRemoveKeywords:!this.state.toggledShowCheckBoxRemoveKeywords});
  }
  //Delete selected domains
deleteKeywords(){
  var tempDelKeywords=this.listRemovedKeywords;
  var delKeywords= tempDelKeywords.join('|') ;
  //console.log(delKeywords);
  this.props.removeKeywordsRadViz(delKeywords);
  //delKeywords:tempDelKeywords,
  this.setState({ toggledDeleteKeywords:false, expandCardDeleteKeywords:false});
  this.listRemovedKeywords = []; //Reseting list of selected keywords
  /* $.post(
    '/delDomain',
    {'domains': JSON.stringify(delDomains)},
    function(domains) {
      this.setState({openDeleteDomain: false, delDomains: {}});
      this.getAvailableDomains();
      this.forceUpdate();
    }.bind(this)
  );*/
};
// Get all the domains selected for deletion
updateListRemoveKeywords(tempDelKeywords){
  console.log(tempDelKeywords);
  this.listRemovedKeywords = tempDelKeywords;
}


  render(){
    if(this.state.flat===1)//Object.keys(this.state.radvizpoints).length >0)
    {
      var dimensions=[];
      var values=[];
      var values_FindAnchor=[];
      this.state.dimNames.forEach(function (attribute,idx) {
          var dim = {id: idx,name: attribute,attribute: attribute,available: true,group: false,pos: 0,weight: 1}; //addDimension( id : number, name_circle: small name, name_attribute: complete name)
          dimensions.push(dim);
          values.push(attribute);
          values_FindAnchor.push(attribute);
      });
      let selectedUrls = []; selectedUrls.push(<p></p>);
      let nroSelectedUrls = 0;
      //if(this.state.selectedPoints.includes(true)) {selectedUrls = this.showingUrls(); nroSelectedUrls =selectedUrls.length; }
    //  let linkBackOriginalData = (this.props.filterTerm !=='') ? <a title='Original data' onclick={this.comeBack.bind(this)}>Original data</a>:<a>-<a>;
      let linkBackOriginalData = <div></div>;
      if(this.props.filterTerm !==''){
        linkBackOriginalData = <FlatButton label='Original data' labelPosition='before' primary={true} onTouchTap={this.comeBack.bind(this)} icon={<ComeBackOriginalData />} style={{marginTop:'8px'}} />;
      }
      let sigmoid = <div style={{display:'flex',marginLeft:'-100px', width:'100px'}}><ListItem style={{marginTop:5}} innerDivStyle={{marginTop:5}}>
      Translation<Slider style={{marginLeft:'10px'}} min={-1} max={1} step={0.01} defaultValue={0} onChange={this.updateSigmoidTranslate}/>
      </ListItem></div>;
      let clusterSeparation = <div style={{display:'flex',marginLeft:'-70px'}}><ListItem style={{marginTop:5}} innerDivStyle={{marginTop:5}}>
      Cluster separation<Slider style={{marginLeft:'10px'}} min={0.15} max={0.35} step={0.01} defaultValue={0.2} onChange={this.updateClusterSeparation}/>
      </ListItem></div>;
      let clusterSimilarityThreshold = <div style={{display:'flex',marginLeft:'-10px'}}><ListItem style={{marginTop:5}} innerDivStyle={{marginTop:5}}>
      Similarity threshold<Slider style={{marginLeft:'10px'}} min={0} max={1} step={0.01} defaultValue={1} onChange={this.updateClusterSimilarityThreshold}/>
      </ListItem></div>;

      let interaction = <div style={{width:'300px'}}><RadioButtonGroup name='shipSpeed' defaultSelected={0} onChange={this.showingData} style={{display:'flex'}}>
       <RadioButton value={0} label='Show all' labelStyle={styles.radioButton} style={{width:'110px', marginRight:'-30px'}}/>
       <RadioButton value={1} label='Hide selected' labelStyle={styles.radioButton} style={{width:'130px', marginRight:'-30px' }} />
       <RadioButton value={2} label='Hide unselected' labelStyle={styles.radioButton} style={{width:'140px', marginRight:'-30px'}} />
     </RadioButtonGroup></div>;
     /*let projection_labels =
          <AutoComplete
          floatingLabelText='Projection'
          textFieldStyle={{width:'70%'}}
          searchText={this.state.searchText}
          onUpdateInput={this.handleUpdateInput}
          onNewRequest={this.updateOnSelection}
          dataSource={values}
          filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
          openOnFocus={true}
          />;*/
      let find_anchor =
            <AutoComplete
            floatingLabelText='Find Keyword'
            textFieldStyle={{width:'120'}}
            searchText={this.state.searchText_FindAnchor}
            onUpdateInput={this.handleUpdateInput_FindAnchor}
            onNewRequest={this.updateOnSelection_FindAnchor}
            dataSource={values_FindAnchor}
            filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
            openOnFocus={true}
            />;

      //Setting pages to object format:
      var selectedPoints_aux = this.state.selectedPoints;
      var originalData_aux = this.state.originalData;
      var pagesObjectFormat = this.setPagesToObjectFormat(selectedPoints_aux, originalData_aux);
      //nroSelectedUrls =Object.keys(pagesObjectFormat).length;
      nroSelectedUrls =pagesObjectFormat.length;

      var legend = Object.keys(this.tagsNames).map((k, index)=>{
        return <li style={{color:this.tagsNames[k], textTransform: 'capitalize', fontWeight: 'bold', float: 'left', margin:15}}> {k} </li>;
      });
      let buttonScaleData = <Button onClick={this.multiScaleRadViz.bind(this)} style={{textTransform: "capitalize", width: '59px', height: '37px', fontSize: '10px', padding:0}}>
      Sub-RadViz
      </Button>
      let buttonRemoveKeywords = <Button onClick={this.deleteKeywords.bind(this)} disabled={!this.state.toggledShowCheckBoxRemoveKeywords} style={{textTransform: "capitalize", width: '98px', height: '37px', fontSize: '10px', padding:2}}>
      Remove <br/> Selected Keywords
      </Button>
      let buttonExpandCluster = <Button onClick={this.handleExpandButton.bind(this)} style={{textTransform: "capitalize", width: '59px', height: '37px', fontSize: '10px', padding:0}}>
      Expand<br/>Cluster
      </Button>
      let buttonCollapseClusters = <Button onClick={this.handleCollapseButton.bind(this)} style={{textTransform: "capitalize", width: '59px', height: '37px', fontSize: '10px', padding:0}}>
      Collapse<br/>clusters
      </Button>

      /*let buttonScaleData = <RaisedButton
                label="Multi "
                labelStyle={{textTransform: "capitalize", fontSize:14, fontWeight:"normal", marginLeft:2, marginRight:2}}
                backgroundColor={this.props.backgroundColor}
                //icon={<Search />}
                style={{width:110, height:35, marginTop: 0, marginRight: 2, marginLeft:"-20px"}}
                onClick={this.multiScaleRadViz.bind(this)}
              />
      let buttonExpandCluster= <RaisedButton
                label="Expand Cluster"
                labelStyle={{textTransform: "capitalize", fontSize:10, fontWeight:"normal", marginLeft:0, marginRight:0}}
                backgroundColor={this.props.backgroundColor}
                //icon={<Search />}
                style={{width:110, height:35, marginTop: 0, marginRight: 0, marginLeft:"-20px"}}
                onClick={this.handleExpandButton.bind(this)}
              />
      let buttonCollapseClusters= <RaisedButton
                label="Collapse clusters"
                labelStyle={{textTransform: "capitalize", fontSize:10, fontWeight:"normal", marginLeft:0, marginRight:0}}
                backgroundColor={this.props.backgroundColor}
                //icon={<Search />}
                style={{width:115, height:35, marginTop: 0, marginRight: 0, marginLeft:"-20px"}}
                onClick={this.handleCollapseButton.bind(this)}
              />
      */
      const actionsDialogSelectedData = [
        <FlatButton
        label='Ok'
        primary={true}
        onClick={this.handleCloseDialogSelectedData}
        />,
      ];
      return(
        <div>
        <Grid>
          <Col  ls={7} md={7} style={{ background:'white', marginLeft:80}}>
            <Row className='Menus-child'>
            <div style={{ marginLeft:'-230px' ,marginRight:'-60px', marginBottom:'-15px',}}>
            <Toolbar style={{width:'100%',height:'70%'}}>
                <ToolbarGroup firstChild={true}>
                  {interaction}
                </ToolbarGroup>
                <ToolbarGroup >
                  {sigmoid}
                <ToolbarSeparator />
                </ToolbarGroup>

                <ToolbarGroup style={{marginLeft:'-100px',marginTop:'-25px', width:130}}>
                  {/*{projection_labels}*/}
                  {find_anchor}
                </ToolbarGroup>
                <ToolbarGroup style={{marginLeft:'-100px',marginTop:'0px', width:150}}>
                <Toggle
                  label="Select keyword" //Clusters similarity
                  toggled={this.state.toggledShowCheckBoxRemoveKeywords}
                  style={{width:150}}
                  onClick={this.onToggleShowCheckBoxRemoveKeywords.bind(this)}
                />
                {buttonRemoveKeywords}
                </ToolbarGroup>
                <ToolbarGroup firstChild={true} style={{marginLeft:'10px',}}>
                <ToolbarSeparator style={{marginRight:'6px'}} />
                {buttonScaleData}
              </ToolbarGroup>
            </Toolbar>
            </div>
            </Row>
            <Divider style={{marginLeft:'-120px',marginTop:5}}/>
            <Row className='Menus-child'>
            <div style={{ marginTop:'5px', marginLeft:'-230px' ,marginRight:'-60px', marginBottom:'-5px'}}>
            <Toolbar style={{width:'100%',height:'70%'}}>
              <ToolbarGroup firstChild={true} style={{marginLeft:'-45px', marginRight:'-65px', marginTop:'-10px'}}>
              <DropDownMenu value={this.state.radvizTypeProjection} onChange={this.handleChangeProjection.bind(this)}>
                 <MenuItem value={1} primaryText="Original_RadViz" />
                 <MenuItem value={2} primaryText="N_TopKeywords" />
                 <MenuItem value={3} primaryText="Remove_C_Keywords" />
                 <MenuItem value={4} primaryText="MultiScale_RadViz" />
                 <MenuItem value={5} primaryText="UnlabeledData_based_Class" />
              </DropDownMenu>
              </ToolbarGroup >
              <ToolbarGroup >
              Number of Clusters
              <DropDownMenu value={this.state.radvizNroCluster} onChange={this.handleChangeNroCluster.bind(this)} style={{marginLeft:'-17px', marginTop:'-10px' }}>
                 <MenuItem value={1} primaryText="1" />
                 <MenuItem value={2} primaryText="2" />
                 <MenuItem value={3} primaryText="3" />
                 <MenuItem value={4} primaryText="4" />
                 <MenuItem value={5} primaryText="5" />
                 <MenuItem value={6} primaryText="6" />
                 <MenuItem value={7} primaryText="7" />
                 <MenuItem value={8} primaryText="8" />
                 <MenuItem value={9} primaryText="9" />
                 <MenuItem value={10} primaryText="10" />
              </DropDownMenu>
              </ToolbarGroup >

              <ToolbarGroup >
              {clusterSeparation}
              </ToolbarGroup>
              <ToolbarGroup style={{marginLeft:'-10px', width:130}} >
              {buttonExpandCluster}
              {buttonCollapseClusters}
              </ToolbarGroup>
              <ToolbarGroup style={{marginLeft:'0px', width:310}}>
              {clusterSimilarityThreshold}
              <Toggle
                label="High similarity by cluster" //Clusters similarity
                toggled={this.state.toggledShowLineSimilarity}
                style={{width:143}}
                onClick={this.onToggleShowSimilatiryLines.bind(this)}
              />
              </ToolbarGroup >
            </Toolbar>
            </div>
            </Row>
            <Row>
            <RadViz data={this.state.data} colors={this.state.colors} sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}
            showedData={this.state.showedData} setSelectedPoints={this.setSelectedPoints.bind(this)} selectedSearchText={this.state.selectedSearchText}
            projection={this.state.dimNames[this.state.value]} modelResult={this.state.originalData[this.state.dimNames[this.state.value]]}
            setSelectedAnchorsRadViz={this.setSelectedAnchorsRadViz.bind(this)} searchText_FindAnchor={this.state.searchText_FindAnchor}
            radvizTypeProjection={this.state.radvizTypeProjection} originalData={this.state.originalData} toggledShowLineSimilarity={this.state.toggledShowLineSimilarity}
            clusterSeparation={this.state.clusterSeparation} clusterSimilarityThreshold={this.state.clusterSimilarityThreshold} resetButtonExpand = {this.resetButtonExpand.bind(this)}
            expandedData={this.state.expandedData} buttonExpand={this.state.buttonExpand} updateCollapseData={this.updateCollapseData.bind(this)}
            updateListRemoveKeywords={this.updateListRemoveKeywords.bind(this)} showCheckBoxRemoveKeywords={this.state.toggledShowCheckBoxRemoveKeywords}
            subradviz={false} />
            <ul style={{listStyleType: 'inside'}}>{legend} </ul>
            </Row>
            <Row>
            <h2 style={{marginLeft:260, marginTop:50, marginBottom:15, fontSize: 20}}>Sub-RadViz</h2>
            <RadViz data={this.state.subdata} colors={this.state.colors_subRadviz} sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}
            showedData={this.state.showedData} setSelectedPoints={this.setSelectedPoints.bind(this)} selectedSearchText={this.state.selectedSearchText}
            projection={this.state.dimNames[this.state.value]} modelResult={this.state.originalData[this.state.dimNames[this.state.value]]}
            searchText_FindAnchor={this.state.searchText_FindAnchor} subradviz={true}
            radvizTypeProjection={3} originalData={this.state.originalData} toggledShowLineSimilarity={false} expandedData={this.state.expandedData} buttonExpand={this.state.buttonExpand} />
            </Row>

          </Col>

          <Col  ls={4} md={4} style={{background:'white', marginLeft:'60px', marginRight:'-180px',  borderLeft: '2px solid', borderColor:'lightgray'}}>
            <Row className='Menus-child' >
            <div style={{width:'448px', borderTop:'solid', paddingTop:10, paddingLeft:20, borderRight: '2px solid', borderColor:'lightgray'}}>
            <WordCloud dimNames={this.state.dimNames} selectedPoints={this.state.selectedPoints} originalData={this.state.originalData}/>
            </div>
            </Row>
            <Row className='Menus-child'>

              <SnippetView pages={pagesObjectFormat} session={this.state.sessionBody}  internalUpdating={false} tagFromSnippets={this.tagFromSnippets.bind(this)} reloadFilters={this.reloadFilters.bind(this)} updateOnlineAccuracy={this.updateOnlineAccuracy.bind(this)} lengthTotalPages={nroSelectedUrls}/>
            </Row>
          </Col>
          </Grid>
            <Snackbar
            open={this.state.updatingRadViz}
            message="Updating Visualization"
          />

          <Dialog
          title='Selected Data'
          actions={actionsDialogSelectedData}
          onClose={this.handleCloseDialogSelectedData}
          open={this.state.openDialogSelectedData}
          >
        There is no selected data. Please, select some data in the visualization.
          </Dialog>
        </div>

      );
    }
    return(
      <div style={{marginTop:10}}>Please, wait a minute. Loading data ...</div>
    );
  }
}
// width:320,
//  <Snippets selectedPoints={this.state.selectedPoints} originalData={this.state.originalData} tagFromSnippets={this.tagFromSnippets.bind(this)}/>

export default Body;
