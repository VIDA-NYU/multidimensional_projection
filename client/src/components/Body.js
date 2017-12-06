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
     value: 200, // the 'labels' field as the default projection
     data:undefined,
     colors:undefined,
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
     accuracy: '0',
     sessionBody: this.props.session,
     checkSigmoid:false,
     checkProjection:false,
     searchPage:'',
     open:false,
     pagesCap:100,
     showFindKeyword:true,
   };

   this.updateOnSelection = this.updateOnSelection.bind(this);
   this.updateOnSelection_FindAnchor = this.updateOnSelection_FindAnchor.bind(this);
   this.updateSigmoidScale = this.updateSigmoidScale.bind(this);
   this.updateSigmoidTranslate = this.updateSigmoidTranslate.bind(this);
   this.handleUpdateInput = this.handleUpdateInput.bind(this);
   this.handleUpdateInput_FindAnchor = this.handleUpdateInput_FindAnchor.bind(this);
   this.showingData = this.showingData.bind(this);
   this.showingUrls = this.showingUrls.bind(this);
   this.colorDefault= [ '#ff7f0e', '#2ca02c', '#17becf', '#b27eac', '#9467bd', '#8c564b', '#e377c2', '#98bd22', '#bcbd22' ];
   this.colorTags= [ '#9E9E9E', '#0D47A1', '#C62828', '#FFFFFF'];
   this.tagsNames ={};
     this.fontSize='13px';
   this.indexColor = -1;
   this.valueDropDown=100;
   this.highestvalue=0;
   this.drop=1;




 };

 showingData(event, value){
  this.setState({showedData:value,});
  console.log(this.state.showedData)
 }

 setSelectedPoints(selected){
    if(this.state.searchText.replace(/\s/g,'') === ''){var selectedSearchText = []; this.setState({selectedPoints:selected, selectedSearchText: selectedSearchText,});
  }
    else this.setState({selectedPoints:selected, selectedSearchText: selected,});
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
   console.log(event);
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
	     this.setState({originalData: this.props.originalData, data:this.props.data, colors:this.props.colors, flat:this.props.flat, dimNames: this.props.dimNames});
       //this.updateColorsTags(this.state.value);
       this.runModel();

  }

componentWillReceiveProps(props){
  	if(props.originalData !== this.state.originalData){
        let colors = [];
        let dimNames = Object.keys(props.originalData);
        colors = this.setColorPoints(this.state.value, dimNames, props.originalData);
        this.setState({value: this.state.value, colors:colors, originalData: props.originalData, data:props.data, flat:props.flat, dimNames: props.dimNames, });

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
    handlepageInput(event,key,pagevalue){
      if(this.highestvalue<pagevalue){
      this.props.pagesCap(pagevalue);
      this.highestvalue = pagevalue;
    }
    this.valueDropDown = pagevalue;
    this.forceUpdate();
    }
  handleUpdateInput_FindAnchor(searchText_FindAnchor){
      this.setState({
        searchText_FindAnchor: searchText_FindAnchor,
      });
    };
  handleselectInput(event,key,value){
    this.drop = value;
    this.setState({showFindKeyword:false})
  }




  //Set pages to object format. It is necessary because SnippetView component, which shows pages as snippets, was already working with this format in DDT. SnippetView component are being re-used with some little changes.
  setPagesToObjectFormat(selectedPoints, originalData){
    var pages = {};
    if(selectedPoints.length>0){
      for (let i = 0; i < originalData['urls'].length; ++i){
        if(selectedPoints[i]){
          pages[originalData['urls'][i]] = {'idRadViz':i, 'image_url':originalData['image_url'][i], 'order':0, 'snippet':originalData['snippet'][i], 'timestamp':'', 'title':originalData['title'][i],
          'tags': originalData['labels'][i]};
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
      var length = this.props.lengthTotalPages;
      var pages=[];
      var select_feild=[];
  /*  if(length<100){
        pages.push(length)
      }
      else{
        for(var i=1;i<length/100;i++){
          pages.push((i*100).toString())

        }
      }*/
      for(var i=1;i<length/100;i++){
          pages.push(<MenuItem value={i*100} key={i*100} primaryText={`${(i*100)}`} />)
        }
        pages.push(<MenuItem value={length} key={length} primaryText={`${length}`} />)

      select_feild.push(<MenuItem value={1} key={"Labels"} primaryText={"Labels"}/>);
      select_feild.push(<MenuItem value={2} key={"Model_result"} primaryText={"Model_result"}/>);
  //    pages.push("50");
  //    pages.push("100");
  //    pages.push("200");
  //    pages.push("500");

      let selectedUrls = []; selectedUrls.push(<p></p>);
      let nroSelectedUrls = 0;
      if(this.state.selectedPoints.includes(true)) {selectedUrls = this.showingUrls(); nroSelectedUrls =selectedUrls.length; }
    //  let linkBackOriginalData = (this.props.filterTerm !=='') ? <a title='Original data' onclick={this.comeBack.bind(this)}>Original data</a>:<a>-<a>;
      let linkBackOriginalData = <div></div>;
      if(this.props.filterTerm !==''){
        linkBackOriginalData = <FlatButton label='Original data' labelPosition='before' primary={true} onTouchTap={this.comeBack.bind(this)} icon={<ComeBackOriginalData />} style={{marginTop:'8px'}} />;
      }
      let sigmoid = <div style={{display:'flex',marginLeft:'170px'}}><ListItem style={{marginTop:-25}} innerDivStyle={{marginTop:10}}>
      Translation: <Slider style={{marginLeft:'10px',marginTop:'15px'}} min={-1} max={1} step={0.01} defaultValue={0} onChange={this.updateSigmoidTranslate}/>
      </ListItem></div>;
      let interaction = <div style={{width:'140px'}}><RadioButtonGroup name='shipSpeed' defaultSelected={0} onChange={this.showingData} style={{display:'flex'}}>
       <RadioButton value={0} label='Show all' labelStyle={styles.radioButton} />
       <RadioButton value={1} label='Hide selected' labelStyle={styles.radioButton} style={{marginLeft:'-50px'}} />
       <RadioButton value={2} label='Hide unselected' labelStyle={styles.radioButton} style={{marginLeft:'-30px'}} />
     </RadioButtonGroup></div>;
     // let projection_labels =
     //      <AutoComplete
     //      floatingLabelText='Projection'
     //      textFieldStyle={{width:'70%'}}
     //      searchText={this.state.searchText}
     //      onUpdateInput={this.handleUpdateInput}
     //      onNewRequest={this.updateOnSelection}
     //      dataSource={values}
     //      filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
     //      openOnFocus={true}
     //      />;
    // let drop="select";
     let pageLabel = <div style={{marginLeft:'20px',marginTop:'-40px'}}> Pages: </div>
     let pagesFeild=
      <DropDownMenu style={{marginLeft:'-60px',marginTop:'10px'}}  maxHeight={300} value={this.valueDropDown} onChange={this.handlepageInput.bind(this)}>
        {pages}
      </DropDownMenu>

      let selectFeild=
       <DropDownMenu style={{width:'150px'}}  maxHeight={300} value={this.drop} onChange={this.handleselectInput.bind(this)} >
         {select_feild}
       </DropDownMenu>
    /*      <AutoComplete
          floatingLabelText='Pages'
          searchText={this.state.searchText}
          textFieldStyle={{width:'20%'}}
          onNewRequest={this.handlepageInput.bind(this)}
          filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
          dataSource={pages}
          openOnFocus={true}
          />;*/
      let find_anchor =
           <AutoComplete
           floatingLabelText='Find Keyword'
           textFieldStyle={{width:'45%'}}
           listStyle={{width:'100%'}}
           maxSearchResults={10}
           disableFocusRipple={this.state.showFindKeyword}
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
      var legend = Object.keys(this.tagsNames).map((k, index)=>{
        return <li style={{color:this.tagsNames[k], textTransform: 'capitalize', fontWeight: 'bold', float: 'left', margin:15}}> {k} </li>;
      });

      return(
        <div>
        <Grid>
          <Col  ls={7} md={7} style={{ background:'white',}}>
            <Row className='Menus-child'>
            <div style={{ marginLeft:'-70px' ,marginRight:'-60px'}}>
            <Toolbar style={{width:'100%',height:'70%'}}>
            <ToolbarGroup firstChild={true}>
              {interaction}
            </ToolbarGroup>
            <ToolbarGroup >
              {sigmoid}
            </ToolbarGroup>
            <ToolbarGroup style={{marginLeft:'10px',marginTop:'-25px'}}>
              {/*{projection_labels}*/}
              {find_anchor}
            </ToolbarGroup>
            <ToolbarGroup style={{marginLeft:'-90px'}}>
             {selectFeild}
           </ToolbarGroup>
           <ToolbarGroup style={{marginLeft:'-70px'}}>
            {pageLabel}
            {pagesFeild}
          </ToolbarGroup>
          </Toolbar>
            </div>
            {/*}<div style={{position: 'absolute', left: '-5%', marginTop:'10px' ,marginRight:'-20px' }}>
            <ButtonGroup>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Relevant</Tooltip>}>
                <Button >
                   <IconButton onTouchTap={this.tagsRelevant.bind(this)} iconStyle={{width:25,height: 25,marginBottom:'-9px', color:'#0000FF' }} style={{height: 8, margin: '-10px', padding:0,}}><RelevantFace /></IconButton>
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Irrelevant</Tooltip>}>
                <Button>
                  <IconButton onTouchTap={this.tagsIrrelevant.bind(this)} iconStyle={{width:25,height: 25,marginBottom:'-9px',color:'#FF0000'  }} style={{height: 8, margin: '-10px', padding:0}}><IrrelevantFace /></IconButton>
                </Button>
              </OverlayTrigger>
              <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Neutral</Tooltip>}>
                <Button >
                  <IconButton onTouchTap={this.tagsNeutral.bind(this)} iconStyle={{width:25,height: 25,marginBottom:'-9px', color:'#C0C0C0' }} style={{height: 8, margin: '-10px', padding:0,}}><NeutralFace /></IconButton>
                </Button>
              </OverlayTrigger>
            </ButtonGroup>
            </div>*/}
            {linkBackOriginalData}
            <RadViz data={this.state.data} colors={this.state.colors} pagesCap={this.valueDropDown} sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}
            showedData={this.state.showedData} setSelectedPoints={this.setSelectedPoints.bind(this)} selectedSearchText={this.state.selectedSearchText}
            projection={this.state.dimNames[this.state.value]} modelResult={this.state.originalData[this.state.dimNames[this.state.value]]} searchText_FindAnchor={this.state.searchText_FindAnchor}/>
            <ul style={{listStyleType: 'inside'}}>{legend}</ul>
            </Row>
          </Col>

          <Col  ls={2} md={2} style={{background:'white', marginLeft:'60px', borderLeft: '2px solid', borderColor:'lightgray'}}>
            <Row className='Menus-child' >
            <div style={{width:'448px', borderTop:'solid', paddingTop:10, paddingLeft:20, borderRight: '2px solid', borderColor:'lightgray'}}>
            <WordCloud dimNames={this.state.dimNames} selectedPoints={this.state.selectedPoints} originalData={this.state.originalData}/>
            </div>
            </Row>
            <Row className='Menus-child'>

              <SnippetView pages={pagesObjectFormat} session={this.state.sessionBody}  internalUpdating={false} tagFromSnippets={this.tagFromSnippets.bind(this)} reloadFilters={this.reloadFilters.bind(this)} updateOnlineAccuracy={this.updateOnlineAccuracy.bind(this)} nroSelectedUrls={nroSelectedUrls}/>
            </Row>
          </Col>
          </Grid>
        </div>

      );
    }
    return(
      <div>Loading data</div>
    );
  }
}
// width:320,
//  <Snippets selectedPoints={this.state.selectedPoints} originalData={this.state.originalData} tagFromSnippets={this.tagFromSnippets.bind(this)}/>

export default Body;
