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

import RadViz from './RadViz';
import SigmoidGraph from './SigmoidGraph';
import WordCloud from './WordCloud';
import Snippets from './Snippets';

const styles = {
  block: {
    maxWidth: 250,
  },
  radioButton: {
    fontSize: '13px',
    fontWeight:'normal',
    marginBottom: 16,
  },
};

class Body extends Component {

 constructor(props){
   super(props);
   this.state={
     flat:0,
     value: 202,
     data:undefined,
     colors:undefined,
     originalData:undefined,
     showedData:0,
     selectedPoints:[false],
     urls:undefined,
     searchText:'',
     selectedSearchText:[],
     dimNames:[],
     'sigmoidScale':1,
     'sigmoidTranslate':0,
       accuracy: "0",
       sessionBody: this.createSession(this.props.currentDomain),
   };

   this.updateOnSelection = this.updateOnSelection.bind(this);
   this.updateSigmoidScale = this.updateSigmoidScale.bind(this);
   this.updateSigmoidTranslate = this.updateSigmoidTranslate.bind(this);
   this.showingData = this.showingData.bind(this);
   this.showingUrls = this.showingUrls.bind(this);
   this.colorDefault= [ "#0D47A1", "#C62828", "#9E9E9E", "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
   this.colorTags= [ "#9E9E9E", "#0D47A1", "#C62828", "#FFFFFF"];
     this.fontSize="13px";


 };

 showingData(event, value){
  this.setState({showedData:value,});
 }

 setSelectedPoints(selected){
    if(this.state.searchText.replace(/\s/g,"") === ""){var selectedSearchText = []; this.setState({selectedPoints:selected, selectedSearchText: selectedSearchText,})}
    else this.setState({selectedPoints:selected, selectedSearchText: selected,});
 }
 showingUrls(){
   let urls = [];
   for (let i = 0; i < this.state.originalData['urls'].length; ++i){
       if(this.state.selectedPoints[i]){
         urls.push(<p>{this.state.originalData['urls'][i] }</p>)
       }
     }
  return urls;
 }

 //Update colors based on tag or modelResult.
 updateColorsTags(value){
   let dimNames = Object.keys(this.state.originalData);
   let colors = [];
   for (let i = 0; i < this.state.originalData[dimNames[0]].length; ++i){
      var typeTag = this.state.originalData[dimNames[value]][i];
       var colorTag=(typeTag.toLowerCase()=="neutral")? this.colorTags[0]: (typeTag.toLowerCase()=="relevant")? this.colorTags[1]: (typeTag.toLowerCase()=="irrelevant")? this.colorTags[2]: "";
       colors.push(colorTag);
   }
   this.setState({value: value, colors:colors});
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
       var colorTag=(typeTag.toLowerCase()=="neutral")? this.colorTags[0]: (typeTag.toLowerCase()=="relevant")? this.colorTags[1]: (typeTag.toLowerCase()=="irrelevant")? this.colorTags[2]: "";
       colors.push(colorTag);
   }
   this.setState({value:value, colors:colors})
 }

 //Handling change of dimensions into DropDown.
    updateOnSelection(event, index, value){
	if(this.state.dimNames[value]=="modelResult"){
	    this.predictUnlabeled(this.state.sessionBody);
	}
	if(this.state.dimNames[value]=="labels" || this.state.dimNames[value]=="modelResult") this.updateColorsTags(value);
	else this.updateColors(value);
    }

  updateSigmoidScale(s){
      this.setState({'sigmoidScale':s})
  }

  updateSigmoidTranslate(s){
      this.setState({'sigmoidTranslate':s})
  }

    handleNewRequest = (searchText) => {
	var selected = [];

	if(searchText.replace(/\s/g,"") !== ""){
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
	this.setState({originalData: this.props.originalData, data:this.props.data, colors:this.props.colors, flat:this.props.flat, dimNames: this.props.dimNames});
	this.runModel();
    }

    componentWillReceiveProps(props){
	if(props.originalData !== this.state.originalData){
	    this.setState({originalData: props.originalData, data:props.data, colors:props.colors, flat:props.flat, dimNames: props.dimNames, });
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
	    }.bind(this)
	);
    }

    getPredictedLabels(){
	var session = this.state.sessionBody;
	session['pageRetrievalCriteria'] = 'Model Tags';
	session["selected_model_tags"] = 'Unsure';
	$.post(
	    '/getPages',
	    {'session':  JSON.stringify(session)},
	    function(predicted) {
        console.log(predicted);
		//var unsure = JSON.parse(predicted);
		var unsure = predicted["data"];
		let updateData = this.state.originalData;
		Object.keys(unsure).map((k, i)=>{
		    var index = updateData['urls'].indexOf(k);
		    if( index > 0){
			updateData['modelResult'][index]="Neutral";
		    }
		});
		this.setState({originalData: updateData});
		if(this.state.dimNames[this.state.value]=="modelResult") this.updateColorsTags(this.state.value);

	    }.bind(this)
	);
	session["selected_model_tags"] = 'Maybe relevant';
	$.post(
	    '/getPages',
	    {'session':  JSON.stringify(session)},
	    function(predicted) {
		//var relevant = JSON.parse(predicted);
		var relevant = predicted["data"];
		let updateData = this.state.originalData;
		Object.keys(relevant).map((k, i)=>{
		    var index = updateData['urls'].indexOf(k);
		    if( index > 0){
			updateData['modelResult'][index]="Relevant";
		    }
		});
		this.setState({originalData: updateData});
		if(this.state.dimNames[this.state.value]=="modelResult") this.updateColorsTags(this.state.value);

	    }.bind(this)
	);
	session["selected_model_tags"] = 'Maybe irrelevant';
	$.post(
	    '/getPages',
	    {'session':  JSON.stringify(session)},
	    function(predicted) {
		//var irrelevant = JSON.parse(predicted);
		var irrelevant = predicted["data"];
		let updateData = this.state.originalData;
		Object.keys(irrelevant).map((k, i)=>{
		    var index = updateData['urls'].indexOf(k);
		    if( index > 0){
			updateData['modelResult'][index]="Irrelevant";
		    }
		});
		this.setState({originalData: updateData});
		if(this.state.dimNames[this.state.value]=="modelResult") this.updateColorsTags(this.state.value);

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

    /*consultaQueries: {"search_engine":"GOOG","activeProjectionAlg":"Group by Correlation"
      ,"domainId":"AVWjx7ciIf40cqEj1ACn","pagesCap":"100","fromDate":null,"toDate":null,
      "filter":null,"pageRetrievalCriteria":"Most Recent","selected_morelike":"",
      "model":{"positive":"Relevant","nagative":"Irrelevant"}}*/
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

    updateTags(selectedPages, tag){
	var urls = [];
	for(let i = 0;i < selectedPages.length;++i){
	    var index = selectedPages[i];
	    if (this.state.originalData["labels"][index] != "Neutral" && this.state.originalData["labels"][index] != tag)
		this.setPagesTag([this.state.originalData["urls"][index]], this.state.originalData["labels"][index], false);
	    urls.push(this.state.originalData["urls"][index]);
	}
	this.setPagesTag(urls, tag, true);
    }

  //Tagging selected data in radviz.
  tagsSelectedData(tag){
      let updateData = {};
      updateData = this.state.originalData;
      var selectedPoints = [];
      for (let i = 0; i < this.state.selectedPoints.length; ++i){
          if(this.state.selectedPoints[i]){
              updateData["labels"][i] = tag;
	      selectedPoints.push(i);
	  }
      }
      this.updateTags(selectedPoints, tag);
      this.setState({originalData: updateData});
      this.updateColorsTags(this.state.value);

  }

  //Labeling pages as a relevant.
  tagsRelevant(){
    this.tagsSelectedData("Relevant");//1
  };
  //Labeling pages as a Irrelevant.
  tagsIrrelevant(){
    this.tagsSelectedData("Irrelevant");//2
  };
  //Labeling pages as a Neutral.
  tagsNeutral(){
    this.tagsSelectedData("Neutral");//0
  }

  //Labeling pages as a Neutral.
  countTotalLabeledPages(){
    let cont =0;
    for (let i = 0; i < this.state.originalData["labels"].length; ++i){
        if(this.state.originalData["labels"][i].toLowerCase()=="relevant" || this.state.originalData["labels"][i].toLowerCase()=="irrelevant")
            cont++;
    }
    return cont;
  }
  comeBack(){
    console.log("comeback");
    let keyword ='';
    this.props.filterKeyword(keyword);
  }

  render(){
    if(this.state.flat===1)//Object.keys(this.state.radvizpoints).length >0)
    {
      var dimensions=[];
      this.state.dimNames.forEach(function (attribute,idx) {
          var dim = {id: idx,name: attribute,attribute: attribute,available: true,group: false,pos: 0,weight: 1}; //addDimension( id : number, name_circle: small name, name_attribute: complete name)
          dimensions.push(dim);
      });
      let selectedUrls = []; selectedUrls.push(<p></p>);
      let nroSelectedUrls = 0;
      if(this.state.selectedPoints.includes(true)) {selectedUrls = this.showingUrls(); nroSelectedUrls =selectedUrls.length; }
    //  let linkBackOriginalData = (this.props.filterTerm !=="") ? <a title="Original data" onclick={this.comeBack.bind(this)}>Original data</a>:<a>-<a>;
      let linkBackOriginalData = <div></div>;
      if(this.props.filterTerm !==""){
        linkBackOriginalData = <FlatButton label="Original data" labelPosition="before" primary={true} onTouchTap={this.comeBack.bind(this)} icon={<ComeBackOriginalData />} style={{marginTop:"8px"}} />;
      }
      return(
        <Grid>

          <Col ls={3} md={3} style={{marginLeft: '-50px', marginTop:'10px', border: '2px solid', borderColor:'lightgray', paddingBottom:"70px"}}>
               <List>
                 <Subheader style={{fontSize:"16px", fontWeight:"bold", color:"black"}}>Sigmoid</Subheader>
                 <ListItem>
                   <p style={{fontSize:this.fontSize,}} >Translation:</p> <Slider min={-1} max={1} step={0.01} defaultValue={0} onChange={this.updateSigmoidTranslate}/>
                 </ListItem>
                 <ListItem>
                   <p style={{fontSize:this.fontSize,}}>Scale:</p> <Slider min={0} max={100} step={1} defaultValue={1} onChange={this.updateSigmoidScale}/>
                 </ListItem>
                 <ListItem >
                  <SigmoidGraph sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}/>
                 </ListItem>
                 <Divider />
                 <Subheader style={{fontSize:"16px", fontWeight:"bold", color:"black"}}>Interaction</Subheader>
                 <ListItem>
                   <RadioButtonGroup name="shipSpeed" defaultSelected={0} onChange={this.showingData}>
                    <RadioButton value={0} label="Show all" labelStyle={styles.radioButton}/>
                    <RadioButton value={1} label="Hide selected" labelStyle={styles.radioButton}/>
                    <RadioButton value={2} label="Hide unselected" labelStyle={styles.radioButton}/>
                  </RadioButtonGroup>
                 </ListItem>
                 <Divider />
                 <Subheader style={{fontSize:"16px", fontWeight:"bold", color:"black"}}>Projection</Subheader>
                   <DropDownMenu style={{marginTop:"-20px", fontSize:this.fontSize, }} value={this.state.value} onChange={this.updateOnSelection}>
                   {Object.keys(dimensions).map((k, index)=>{
                        var attibute = dimensions[k].attribute;
                        return <MenuItem value={index} primaryText={attibute} style={{fontSize:this.fontSize,}} />
                   })}
                  </DropDownMenu>
                 <Divider />
                 <Subheader style={{fontSize:"16px", fontWeight:"bold", color:"black"}}>OnlineClassifier</Subheader>
                 <div style={{marginLeft:"25px", fontSize:this.fontSize,}}>
                   <p>Total pages: {this.state.originalData['urls'].length}.</p>
                   <p>Labeled pages: {this.countTotalLabeledPages()}.</p>
                   <p>Accuracy: {this.state.accuracy} %</p>
                 </div>
               </List>
          </Col>

          <Col  ls={7} md={7} style={{ background:"white", borderRight: '2px solid', borderColor:'lightgray'}}>
            <Row className="Menus-child">
            {linkBackOriginalData}
            <RadViz data={this.state.data} colors={this.state.colors} sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}
            showedData={this.state.showedData} setSelectedPoints={this.setSelectedPoints.bind(this)} selectedSearchText={this.state.selectedSearchText}
            projection={this.state.dimNames[this.state.value]} modelResult={this.state.originalData[this.state.dimNames[this.state.value]]}/>
            <div style={{position: "absolute", left: "23%"  }}>
            <FlatButton label="Relevant" primary={true} backgroundColor="#0D47A1" hoverColor="#1A237E" icon={<RelevantIcon color="#ffffff"/>} onTouchTap={this.tagsRelevant.bind(this)} style={{marginRight:"8px"}} labelStyle={{color:"#ffffff", textTransform: "capitalize"}}/>
            <FlatButton label="Irrelevant" primary={true} backgroundColor="#B71C1C" hoverColor="#B71C1C" icon={<IrrelevantIcon color="#ffffff"/>} onTouchTap={this.tagsIrrelevant.bind(this)} style={{marginRight:"8px"}} labelStyle={{color:"#ffffff", textTransform: "capitalize"}} />
            <FlatButton label="Neutral" primary={true} backgroundColor="#BDBDBD" hoverColor="#616161" icon={<NeutralIcon color="#ffffff"/>} onTouchTap={this.tagsNeutral.bind(this)} labelStyle={{color:"#ffffff", textTransform: "capitalize"}}/>
            </div>
            </Row>
          </Col>

          <Col  ls={2} md={2} style={{background:"white"}}>
            <Row className="Menus-child" >
            <div style={{width:'448px', borderTop:'solid', borderRight: '2px solid', borderColor:'lightgray'}}>
            <WordCloud dimNames={this.state.dimNames} selectedPoints={this.state.selectedPoints} originalData={this.state.originalData}/>
            </div>
            </Row>
            <Row className="Menus-child">
              <div style={{width:'448px', borderTop:'solid', borderRight: 'solid', borderColor:'lightgray'}}>
                <p style={{color:"silver", marginLeft:'30px'}}>Selected pages: {nroSelectedUrls}</p>
              </div>
              <Snippets selectedPoints={this.state.selectedPoints} originalData={this.state.originalData}/>
            </Row>
          </Col>
        </Grid>

      )
    }
    return(
      <div>Loading data</div>
    );
  }
}
// width:320,
export default Body;
