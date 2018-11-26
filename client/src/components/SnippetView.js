import React from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import Checkbox from 'material-ui/Checkbox';

import {csv} from 'd3-request';

import Highlighter from 'react-highlight-words';

import {List, ListItem} from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import ActionAssignment from 'material-ui/svg-icons/action/assignment';
import CircularProgress from 'material-ui/CircularProgress';
import Chip from 'material-ui/Chip';
import NoFoundImg from '../images/images_not_available.png';
import RelevantFace from 'material-ui/svg-icons/action/thumb-up';
import IrrelevantFace from 'material-ui/svg-icons/action/thumb-down';
import NeutralFace from 'material-ui/svg-icons/action/thumbs-up-down';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import ReactPaginate from 'react-paginate';
import RaisedButton from 'material-ui/RaisedButton';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
//import RadViz from './RadViz.js';
//import './Views.css';

//const recentsIcon = <RelevantFace />;
//const favoritesIcon = <IrrelevantFace />;
//const nearbyIcon = <NeutralFace />;

import { ButtonGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import Dialog from 'material-ui/Dialog';
const recentsIcon = <RelevantFace />;
const favoritesIcon = <IrrelevantFace />;
const nearbyIcon = <NeutralFace />;

import { stopWordFilter } from '../utils/stopword-filter.js';


import $ from 'jquery';

const styles = {
  headline: {
    fontSize: 12,
    paddingTop: 16,
    marginBottom: 12,
    height: '940px',
  },
  slide: {
    height: '100px',
  },
  tab:{
    fontSize: '12px',
  },
  button:{
    marginTop:'10px',
    marginLeft:'10px',
    marginRight: 20,
  },

};


class ViewTabSnippets extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      pages:[],
      sessionString:'',
      session:{},
      accuracyOnlineLearning:0,
      offset:0,
      currentPagination:0,
      allRelevant:false,
      lengthTotalPages:0,
      lengthPages:0,
      custom_tag_val:'',
      flatKeyBoard:false,
      openMultipleSelection: false,
      click_flag: false,
      change_color_urls:[],
      checkedSelectAllPages: false,
      openDialogTagAllPages:false
      //nroSelectedUrls:0

    };
    this.state.allSearchQueries = this.buildQueryString(this.props.session);
    this.updatingCheckSelectAllPages = this.updatingCheckSelectAllPages.bind(this);
    this.handleCloseMultipleSelection = this.handleCloseMultipleSelection.bind(this);
    this.perPage=12; //default 12
    this.currentUrls=[];
    this.customTagValue='';
    this.disableCrawlerButton=true;
    this.customTagPages=[];
    this.multipleSelectionPages = [];
    this.check_click_down=false;
    this.availableTags = [];
    this.items= [];
    this.updatedUrls=false;
    this.temp_inputURL_TagAllPages = [];
    this.temp_value_TagAllPages = '';
    this.temp_inputTag_TagAllPages='';
  }

  getAvailableTags(){
    $.post(
  	  '/getAvailableTags',
  	  {'session': JSON.stringify(this.props.session), 'event': 'Tags'},
  	  function(tagsDomain) {
  	      var selected_tags = [];
  	      if(this.props.session['selected_tags'] !== undefined && this.props.session['selected_tags'] !== ''){
  		        selected_tags = this.props.session['selected_tags'].split(',');
  	      }
          this.availableTags = Object.keys(tagsDomain['tags'] || {})
                               .filter(tag => ['Neutral', 'Irrelevant', 'Relevant'].indexOf(tag) === -1)
                               .map(tag => { return {value: tag, label: tag}; });

  	  }.bind(this)
    );
  }

  //Set pages to object format. It is necessary because SnippetView component, which shows pages as snippets, was already working with this format in DDT. SnippetView component are being re-used with some little changes.
  setPagesToObjectFormat(data){
    var pages = {};
    for (let i = 0; i < data.length; ++i){
          pages[data[i]['url']] = data[i];
    }
    return pages;
  }

  componentWillMount(){
    var currentPages = this.props.pages.slice(0, this.perPage);
    var pagesOnPagination = this.setPagesToObjectFormat(currentPages);
    this.getAvailableTags();
    this.setState({
        session:this.props.session, sessionString: JSON.stringify(this.props.session), pages:pagesOnPagination, currentPagination:0, offset:0, lengthPages:Object.keys(pagesOnPagination).length, lengthTotalPages:this.props.lengthTotalPages, allPagesInArray:this.props.pages //, nroSelectedUrls:this.props.nroSelectedUrls
        //session:this.props.session, sessionString: JSON.stringify(this.props.session), pages:this.props.pages, currentPagination:0, offset:0, lengthPages:Object.keys(this.props.pages).length, lengthTotalPages:this.props.lengthTotalPages, nroSelectedUrls:this.props.nroSelectedUrls
        //session:this.props.session, sessionString: JSON.stringify(this.props.session), pages:this.props.pages, currentPagination:this.props.currentPagination, offset:this.props.offset, lengthPages:this.props.lengthPages, lengthTotalPages:this.props.lengthTotalPages,
    });
    this.updateOnlineClassifier(this.props.session);
    this.keyboardListener();
  }

  keyboardListener(){
    window.addEventListener('keydown', function(event) {
      if (event.keyCode === 91 || event.keyCode === 93 || event.keyCode ===17) {
        this.check_click_down=true;
      }
    }.bind(this), true);

    window.addEventListener('keyup', function(event) {
      if (event.keyCode === 91 || event.keyCode === 93 || event.keyCode ===17) {//91 and 93 are command keys.
        this.currentUrls = [];
        this.check_click_down=false;
        if(this.state.click_flag && this.multipleSelectionPages.length>0){
          this.handleOpenMultipleSelection();}
        this.forceUpdate();
        this.currentUrls = this.multipleSelectionPages;
        this.customTagPages = this.multipleSelectionPages;
        this.multipleSelectionPages=[];
      }
    }.bind(this), true);
  }

  componentWillReceiveProps(nextProps, nextState){
    //if (JSON.stringify(nextProps.session) !== this.state.sessionString || this.props.queryFromSearch) {
    //  if(this.props.internalUpdating){return ;}
      if(!this.props.queryFromSearch) $('div').scrollTop(0);
      var currentPages = nextProps.pages.slice(0, this.perPage);
      var pagesOnPagination = this.setPagesToObjectFormat(currentPages);
      this.setState({
        session: nextProps.session,
        sessionString: JSON.stringify(nextProps.session),
        pages: pagesOnPagination,
        lengthTotalPages: nextProps.lengthTotalPages,
        currentPagination: nextState.currentPagination,
        offset: nextProps.offset,
        allSearchQueries: this.buildQueryString(nextProps.session),
        //nroSelectedUrls:nextProps.nroSelectedUrls
        lengthTotalPages:nextProps.lengthTotalPages,
        allPagesInArray:nextProps.pages
      });
      this.updateOnlineClassifier(nextProps.session);
  //  }
    return;

  }

  shouldComponentUpdate(nextProps, nextState) {
    if ( nextState.currentPagination!== this.state.currentPagination || nextState.accuracyOnlineLearning !== this.state.accuracyOnlineLearning || JSON.stringify(nextProps.session) !== this.state.sessionString  || nextState.pages !== this.state.pages || this.props.queryFromSearch ) {
      if(this.props.internalUpdating){ return false;}
         return true;
    }
    return true;
  }

  removeString(currentTag){
    var currentString = '';
    var anyFilter = false;
    this.state.session['selected_tags'].split(',').forEach(function(tag) {
      if(tag !== currentTag && tag !== ''){
      currentString = currentString + tag + ',';}
    });
    if(currentString !== '') return currentString.substring(0, currentString.length-1);
    return currentString;
  }

  updateOnlineClassifier(tempSession){
    var sessionTemp = JSON.parse(JSON.stringify(tempSession));
    sessionTemp['from']=0;
    sessionTemp['pagesCap']='100';
    $.post(
    	'/updateOnlineClassifier',
    	{'session':  JSON.stringify(sessionTemp)},
    	function(accuracy) {
        if(accuracy>0 && this.disableCrawlerButton){
          this.disableCrawlerButton=false;
          //this.props.availableCrawlerButton(false); // disable
        }
        if(accuracy===0){
          this.disableCrawlerButton=true;
          //this.props.availableCrawlerButton(true); // disable
        }
        //Updates the showed accuracy on the interface only if the different between the new and the previous accuracy is enough significant.
        if(accuracy >=this.state.accuracyOnlineLearning+2 || accuracy <=this.state.accuracyOnlineLearning-2){
          //updateing filters modelTags
          this.setState({
              accuracyOnlineLearning:accuracy,
          });
          this.forceUpdate();
          this.props.reloadFilters();
	        this.updateOnlineAccuracy(accuracy);

        }

    	}.bind(this)
    );
  }

  //Returns dictionary from server in the format: {url1: {snippet, image_url, title, tags, retrieved}} (tags are a list, potentially empty)
  getPages(session){
    session['pagesCap'] = '12';
    $.post(
      '/getPages',
      {'session': JSON.stringify(session)},
      function(pages) {
        this.newPages=true;
        this.setState({ pages:pages['data']['results'], lengthPages:Object.keys(pages['data']['results']).length, });
        this.forceUpdate();
      }.bind(this)
    );
  }

    updateOnlineAccuracy(accuracy){
	this.props.updateOnlineAccuracy(accuracy);
    }

  handlePageClick(data){
    $('div').scrollTop(0);
    let selected = data.selected; //current page (number)
    let offset = Math.ceil(selected * this.perPage);

    //getting pages for the new pagination
    var currentPages = this.state.allPagesInArray.slice(offset, this.perPage+offset);
    var pagesOnPagination = this.setPagesToObjectFormat(currentPages);
    this.setState({offset: offset, currentPagination:data.selected, pages:pagesOnPagination});//pages:[]});
    //this.props.handlePageClick(offset, data.selected);
    //Returns dictionary from server in the format: {url1: {snippet, image_url, title, tags, retrieved}} (tags are a list, potentially empty)
    var tempSession = JSON.parse(JSON.stringify(this.props.session));
    tempSession['from'] = offset;
    //this.getPages(tempSession);
  }

  //Updating the urls into the current page (pagination) when there is not more urls in that page.
  updateUrlsIntoPage(currentPage){
    this.updatedUrls=true;
  }

  //Remove or Add tags from elasticSearch
  removeAddTagElasticSearch(urls, current_tag, applyTagFlag ){
    $.post(
      '/setPagesTag',
      {'pages': urls.join('|'), 'tag': current_tag, 'applyTagFlag': applyTagFlag, 'session':  JSON.stringify(this.props.session)},
      function(message) {
        //updateing filters Tags
        this.props.reloadFilters();
        this.updateOnlineClassifier(this.props.session);
        this.forceUpdate();
        if(this.updatedUrls){
          let selected = this.state.currentPagination; //current page (number)
          let offset = Math.ceil(selected * this.perPage);
          //Returns dictionary from server in the format: {url1: {snippet, image_url, title, tags, retrieved}} (tags are a list, potentially empty)
          var tempSession = JSON.parse(JSON.stringify(this.props.session));
          tempSession['from'] = offset;
          this.getPages(tempSession);
        }
        this.updatedUrls=false;

      }.bind(this)
    );
  }

  //If the tag already exits then it is removed from elasticsearch, in other case it is applied. If it is a Neutral tag then Relevant and Irrelevant tags are removed.
  removeTags(arrayInputURL,  tag){
    var updatedPages = JSON.parse(JSON.stringify(this.state.pages));
    var totalTagRemoved = 0;
    //Removing Relevant, Irrelevant tag
    for (var i in arrayInputURL) {
        var url = arrayInputURL[i];
        var urls =[];
        urls.push(url);
        var auxKey = '0';
        if(updatedPages[url]['tags']){
            var temp = Object.keys(updatedPages[url]['tags']).map(key => {
                      if(updatedPages[url]['tags'][key] !== null){
                        var itemTag = updatedPages[url]['tags'][key].toString();
                        if(itemTag==='Relevant' || itemTag==='Irrelevant'){
                          delete updatedPages[url]['tags'][key];
                          this.removeAddTagElasticSearch(urls, itemTag, false ); //Remove tag
                        }
                        if(tag==='Neutral'){
                          if(itemTag!=='Neutral'){
                        //      updatedPages[url]['tags'].splice(updatedPages[url]['tags'].indexOf(key),1);
                            delete updatedPages[url]['tags'][key];
                            this.removeAddTagElasticSearch(urls, itemTag, false ); //Remove tag

                          }
                        }

                      }

                      });

          //  delete updatedPages[url]['tags']; //Removing tag on the interface
        }

    //    if(tag!=='Neutral'){ //Applying tag on the interface it is different to a Neutral tag
          updatedPages[url]['tags'] = (updatedPages[url]['tags'] || []).filter(tag => ['Irrelevant', 'Relevant','Neutral'].indexOf(tag) === -1);
          updatedPages[url]['tags'].push(tag);
     //}
        if(!this.props.session['selected_tags'].split(',').includes(tag) && this.props.session['selected_tags'] !== '' ){
          totalTagRemoved++;
          delete updatedPages[url];
          this.props.updateTotalUrlsPerPage(this.state.lengthTotalPages - totalTagRemoved);
          if(Object.keys(updatedPages).length===0){
            this.updateUrlsIntoPage(this.state.currentPagination);}
        }
    }
    this.setState({ pages:updatedPages, lengthTotalPages: this.state.lengthTotalPages - totalTagRemoved});
    this.forceUpdate();

    return updatedPages;
  }

  //Remove or Add tags from elasticSearch
  setAllPagesTag_ElasticSearch(urls, current_tag, applyTagFlag ){
    $.post(
      '/setAllPagesTag',
      {'pages': urls.join('|'), 'tag': current_tag, 'applyTagFlag': applyTagFlag, 'session':  JSON.stringify(this.props.session)},
      function(message) {
        //updateing filters Tags
        this.props.reloadFilters();
        this.updateOnlineClassifier(this.props.session);
        this.forceUpdate();
        console.log('process complete.');
      }.bind(this)
    );
  }

  //Handling click event on the tag button. When it is clicked it should update tag of the page in elasticsearch.
  onTagAllPages_permission(inputTag){
    var arrayInputURL =this.currentUrls;
    var tag = inputTag;
    if(tag==='Relevant'  || tag==='Irrelevant'){
      var updatedPages = this.removeTags(arrayInputURL, tag);
      this.removeAddTagElasticSearch(arrayInputURL, tag, true ); //Applying the new tag
    }
    else{
      var updatedPages = this.removeTags(arrayInputURL, tag);
    }
    if(this.state.checkedSelectAllPages){
      if(tag==='Neutral'){
      this.setAllPagesTag_ElasticSearch(arrayInputURL, tag, false );}
      else {
        this.setAllPagesTag_ElasticSearch(arrayInputURL, tag, true );
      }

    }
    this.props.tagFromSnippets(tag, arrayInputURL, true); //arrayInputURL is an array
  }

  //Handling click event on the tag button. When it is clicked it should update tag of the page in elasticsearch.
  onTagAllPages(inputTag){
      if(this.state.checkedSelectAllPages){
        this.temp_inputURL_TagAllPages=[];
        this.temp_value_TagAllPages = '';
        this.temp_inputTag_TagAllPages = inputTag;
        this.handleOpenDialogTagAllPages();
      }
      else {
        this.onTagAllPages_permission(inputTag);
      }
  }
  onTagSelectedPages(inputTag){
    this.onTagAllPages(inputTag);
    this.currentUrls = [];
    this.handleCloseMultipleSelection();
  }

  //Handling click event on the tag button. When it is clicked it should update tag of the page in elasticsearch.
  onTagActionClicked(inputURL, inputTag){
    var idButton = (inputTag).split('-'); // (ev.target.id).split('-')
    var tag = idButton[0];
    var url = inputURL; // ev.target.value;
    var action = 'Apply';
    var isTagPresent = false;
    var updatedPages = JSON.parse(JSON.stringify(this.state.pages));
    if(tag ==='Neutral'){
      let arrayInputURL = [];
      arrayInputURL.push(url);
      this.removeTags(arrayInputURL,  tag);
    }
    else{
      if(updatedPages[url]['tags']){
         isTagPresent = Object.keys(updatedPages[url]['tags']).map(key => updatedPages[url]['tags'][key]).some(function(itemTag) {
                                    return itemTag === tag;});
         if(isTagPresent) action = 'Remove';
      }
    if(updatedPages[url]['tags']){
       isTagPresent = Object.keys(updatedPages[url]['tags']).map(key => updatedPages[url]['tags'][key]).some(function(itemTag) {
                                  return itemTag === tag;});
       if(isTagPresent) action = 'Remove';
    }}
    // Apply or remove tag from urls.
    var applyTagFlag = action === 'Apply';
    var urls = [];
    urls.push(url);

    if (applyTagFlag && !isTagPresent) {
      // Removes tag when the tag is present for item, and applies only when tag is not present for item.
      var auxKey = '0';
      if(updatedPages[url]['tags']){
        var temp = Object.keys(updatedPages[url]['tags']).map(key => {
                      if(updatedPages[url]['tags'][key] !== null){
                      var itemTag = updatedPages[url]['tags'][key].toString();
                      if(itemTag==='Relevant' || itemTag==='Irrelevant'){
                          delete updatedPages[url]['tags'][key];
                          this.removeAddTagElasticSearch(urls, itemTag, false ); //Remove tag
                        }
                      if(tag==='Neutral'){
                        if(itemTag!=='Neutral'){
                      delete updatedPages[url]['tags'][key];
                      this.removeAddTagElasticSearch(urls, itemTag, false ); //Remove tag

                        }
                      }

}

                    });
        //  delete updatedPages[url]['tags']; //Removing tag on the interface
      }
      updatedPages[url]['tags'] = (updatedPages[url]['tags'] || []).filter(tag => ['Irrelevant', 'Relevant', 'Neutral'].indexOf(tag) === -1);
      updatedPages[url]['tags'].push(tag);
      //checking if the new tag belong to the filter
      if(!this.props.session['selected_tags'].split(',').includes(tag) && this.props.session['selected_tags'] !== '' ){
        this.setState({ pages:updatedPages, lengthTotalPages: this.state.lengthTotalPages - 1});
        delete updatedPages[url];
        this.props.updateTotalUrlsPerPage(this.state.lengthTotalPages - 1);
        if(Object.keys(updatedPages).length===0){
          this.updateUrlsIntoPage(this.state.currentPagination);}
      }

      //  setTimeout(function(){ $(nameIdButton).css('background-color','silver'); }, 500);
      this.setState({ pages:updatedPages});
      this.removeAddTagElasticSearch(urls, tag, applyTagFlag ); //Add tag

    }
    else{
      if(updatedPages[url]['tags'].indexOf(tag) !== -1){
        updatedPages[url]['tags'].splice(updatedPages[url]['tags'].indexOf(tag), 1);}
      this.setState({ pages:updatedPages});
      this.removeAddTagElasticSearch(urls, tag, applyTagFlag );//Remove tag

    }

    this.props.tagFromSnippets(tag, [inputURL],true );
  }

  getTag(k){
    if((this.state.pages[k]['tags'][Object.keys(this.state.pages[k]['tags']).length-1]) !== undefined){
    var uniqueTag = (Object.keys(this.state.pages[k]['tags']).length > 0) ? (this.state.pages[k]['tags']).toString():(this.state.pages[k]['tags'][Object.keys(this.state.pages[k]['tags']).length-1]).toString();}
    return uniqueTag;
}
 renderCustomTag(data){
    return ( <Chip style={{marginTop:4, marginRight:3}} labelStyle={{marginTop:'-3px', height:29}} deleteIconStyle={{width:22, height:22, marginTop:2}}
        key={data.key}
        onRequestDelete={() => this.handleRequestDelete(data.url,data.label)}
      >
        {data.label}
      </Chip>
    );
}


 handleRequestDelete(url,key){
  var current = [];
  current.push(url);
  var currentPages = this.state.pages;
  if(currentPages[url]['tags'] !== undefined){
    currentPages[url]['tags'].splice(currentPages[url]['tags'].indexOf(key),1);
    this.props.tagFromSnippets(key, [url],false);
  }
  this.setState({pages:currentPages});
	this.removeAddTagElasticSearch(current,key, false);
  this.forceUpdate();


    }

  clickEvent(urlLink){
    if(this.check_click_down){
        var tempArray = this.state.change_color_urls;
        tempArray.push(urlLink);
        this.setState({click_flag: true, change_color_urls:tempArray});
        this.multipleSelectionPages.push(urlLink);
        this.forceUpdate();
      }
  }

  handleClick(){
    this.setState({

    });
  }
  handleOpenMultipleSelection(){
    this.setState({openMultipleSelection: true});
  };

  handleCloseMultipleSelection(){
    this.setState({openMultipleSelection: false, change_color_urls:[], click_flag:false});
    this.check_click_down=false;
    this.forceUpdate();
  };

  //Handling open/close 'load url' Dialog
  handleOpenDialogTagAllPages(){
    this.setState({openDialogTagAllPages: true});
    this.forceUpdate();
  };
  //Handling open/close 'load url' Dialog
  handleConfirmTagAllPages(){
    if(this.temp_value_TagAllPages !==''){
      this.addCustomTag_permission(this.temp_inputURL_TagAllPages, this.temp_value_TagAllPages);}
    else {
      this.onTagAllPages_permission(this.temp_inputTag_TagAllPages);
    }
    this.setState({openDialogTagAllPages: false});
    this.forceUpdate();
  };
  handleCloseDialogTagAllPages(){
    this.temp_inputURL_TagAllPages=[];
    this.temp_value_TagAllPages = '';
    this.temp_inputTag_TagAllPages='';
    this.setState({openDialogTagAllPages: false});
    this.forceUpdate();
  };

  addCustomTag_permission(inputURL, val) {
    if(val.constructor !== Array){
      val = [val];}
    var check = false;
    if(((val || [])[0] || {}).value) {
      if(['Neutral', 'Irrelevant', 'Relevant'].indexOf(val[0].value) !== -1 ) {
        this.availableTags.splice(0, 1);
        return;
      }
      for(var i=0;i<inputURL.length;i++){
        if(this.state.pages[inputURL[i]]['tags']!== undefined)
        {
          if(this.state.pages[inputURL[i]]['tags'].map(k=>k.toLowerCase()).indexOf(val[0].value.toLowerCase())<0){
            this.state.pages[inputURL[i]]['tags'] = this.state.pages[inputURL[i]]['tags'] || [];
            this.state.pages[inputURL[i]]['tags'].push(val[0].value);
            this.removeAddTagElasticSearch(inputURL, val[0].value, true);
          }
        }
        else if(this.state.pages[inputURL[i]]['tags']===undefined){
                  this.state.pages[inputURL[i]]['tags'] = this.state.pages[inputURL[i]]['tags'] || [];
                  this.state.pages[inputURL[i]]['tags'].push(val[0].value);
                  this.removeAddTagElasticSearch(inputURL, val[0].value, true);
               }
        }

      this.setState({multi:false,pages:this.state.pages});
      this.handleCloseMultipleSelection();
    	this.forceUpdate();

      if(this.state.checkedSelectAllPages){
        this.setAllPagesTag_ElasticSearch(inputURL, val[0].value, true );
      }

      }
      this.temp_inputURL_TagAllPages=[];
      this.temp_value_TagAllPages = '';
    }

  addCustomTag(inputURL, val) {
    if(this.state.checkedSelectAllPages){
      this.temp_inputURL_TagAllPages=inputURL;
      this.temp_value_TagAllPages = val;
      this.handleOpenDialogTagAllPages();
    }
    else {
      this.addCustomTag_permission(inputURL, val);
    }

    //Sending tag and urls to radViz projection
    if(val.constructor !== Array) val = [val];
    if(((val || [])[0] || {}).value) {
      this.props.tagFromSnippets(val[0].value, inputURL, false); //inputURL is an array
    }
    }


  buildQueryString(session){
    return [
      stopWordFilter(session.filter || ''),
      (session.selected_queries || '')
      .split(',')
      .filter(string => string.indexOf('BackLink_') === -1 && string.indexOf('ForwardLink_') === -1)
      .map(string => stopWordFilter(string)).join(',')
    ].filter(string => string !== '').join(',');
  }

  augmentURL(url){
    return url +
    (
      this.state.allSearchQueries !== ''
      ?
      (url.indexOf('?') === -1 ? '?' : '&') + 'highlighter=' + this.state.allSearchQueries
      :
      ''
    );
      }

  crawlNextLevel(type, urls){
    $.post(
      '/get' + type + 'Links',
      {
        urls: (urls || this.currentUrls).join('|'),
        session: JSON.stringify(this.props.session)
      },
      (response) => {
        this.props.reloadFilters();
      }
    ).fail((error) => {
      console.log('POST FAILED for ' + type + ' crawl with ERROR ' + error);
    });

    if(this.state.click_flag){
      this.handleCloseMultipleSelection();}
  }


  //Select all pages in all paginations
  updatingCheckSelectAllPages(){
    this.setState({checkedSelectAllPages: !this.state.checkedSelectAllPages });
    this.forceUpdate();
  }


  render(){
    const actionsCancelMultipleSelection = [ <FlatButton label='Cancel' primary={true} onTouchTap={this.handleCloseMultipleSelection} />,];
    var id=0;
    var c=0;
    var value='';
    var currentPageCount = (this.state.lengthTotalPages/this.perPage);
    var messageNumberPages = (this.state.offset===0)?'About ' : 'Page ' + (this.state.currentPagination+1) +' of about ';
    this.currentUrls=[];
    var relev_total = 0; var irrelev_total = 0; var neut_total = 0;
    var sorted_urlsList =  Object.keys(this.state.pages).map((k, index)=>{
      return [k, this.state.pages[k]];
    });

    sorted_urlsList.sort(function(first, second) {
      return Number(first[1]['order']) - Number(second[1]['order']);
    });
    var urlsList = sorted_urlsList.map((url_info, index)=>{
      var chip=[];
      if(this.customTagPages.indexOf(url_info[0])>-1){
        value = this.state.custom_tag_val;
      }
      var bgColor = '';
      bgColor = (this.state.change_color_urls.indexOf(url_info[0])> -1)?'silver':'white';
      if(url_info[1]['tags']){
        let uniqueTag='';
        uniqueTag = this.getTag(url_info[0]);
        if(uniqueTag==='Relevant')relev_total++;
        if(uniqueTag==='Irrelevant')irrelev_total++;
        if(uniqueTag==='Neutral')neut_total++;
        var data = url_info[1]['tags'].filter(function(tag){
          return tag !== 'Relevant' && tag !== 'Irrelevant' && tag !== 'Neutral';
        }).map((tag, index)=>{
          return {'key':index, 'label':tag, 'url':url_info[0]};
        });
        chip =data.map(this.renderCustomTag.bind(this));
      } else {
        neut_total++;
      }
      let colorTagRelev = '';
      let colorTagIrrelev='';
      let colorTagNeutral='silver';
      let uniqueTag='';
      var checkTagRelev=false;
      var checkTagIrrelev=false;
      var checkTagNeutral=false;
      if(url_info[1]['tags']){
        uniqueTag = url_info[1]['tags'];
        for(var i=0;i<uniqueTag.length;i++){
          if(uniqueTag[i] === 'Relevant' ){
            checkTagRelev=true;
          }
          if(uniqueTag[i]==='Irrelevant'){
            checkTagIrrelev=true;
          }
          if(uniqueTag[i]==='Neutral'){
            checkTagNeutral=true;
          }
        }
        colorTagRelev=(checkTagRelev)?'#4682B4':'silver';
        colorTagIrrelev=(checkTagIrrelev)?'#CD5C5C':'silver';
        colorTagNeutral=(checkTagNeutral )?'silver':'silver';
      }
      else{
        colorTagRelev=colorTagIrrelev=colorTagNeutral='silver';
      }

      id++;
      let urlLink= (url_info[0].length<110)?url_info[0]:url_info[0].substring(0,109);
      let tittleUrl = (url_info[1]['title'] === '' || url_info[1]['title'] === undefined )?url_info[0].substring(url_info[0].indexOf('//')+2, url_info[0].indexOf('//')+15) + '...' : url_info[1]['title'] ;
      let imageUrl=(url_info[1]['image_url']==='')? NoFoundImg:url_info[1]['image_url'];
      let urlSnippet = url_info[1]['snippet'] || '';

      this.currentUrls.push(url_info[0]);

      return <ListItem key={index} onClick={this.clickEvent.bind(this, url_info[0])} hoverColor='#CD5C5C' style={{ backgroundColor:bgColor, zIndex: 'none' }} >
        <div style={{  minHeight: '60px',  borderColor:'silver', marginLeft: this.props.marginLeft_divSnippet, marginTop: '3px', fontFamily:'arial,sans-serif'}}>
          <div>
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <img src={imageUrl} onError={(ev) => { ev.target.src = NoFoundImg;}} style={{width:'45px',height:'45px', marginRight:'3px',}}/>
                </div>
                <div style={{width: this.props.width_divSnippet}}>
                  <a target='_blank' href={this.augmentURL(url_info[0])} style={{height: 20,
                  fontSize: 17,
                  color: '#1a0dab',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  display: 'block'}} >
                    <Highlighter searchWords={this.state.allSearchQueries.split(',')} textToHighlight={tittleUrl}/>
                  </a>
                  <a target='_blank' href={this.augmentURL(url_info[0])} style={{  fontSize: 13,
                    color: '#006621',
                    marginBottom: 4,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'block'}}>
                    {urlLink}
                  </a>
                  <p style={{fontSize:'13px', color:'#545454'}}>
                    <Highlighter highlightStyle={{fontWeight: 'bold'}} searchWords={this.state.allSearchQueries.split(',')} textToHighlight={urlSnippet} />
                  </p>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                  <div style={{display: 'flex', marginBottom: '10px' }}>
                    <div>
                      <ButtonGroup style={{height: this.props.height_TagButtonGroup}}>
                        <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Relevant</Tooltip>}>
                        <Button style={{height: this.props.height_TagButton}}>
                          <IconButton onClick={this.onTagActionClicked.bind(this,url_info[0],'Relevant-'+id)} iconStyle={{width:this.props.width_TagIconButton,height: this.props.height_TagIconButton,marginBottom:this.props.marginBottom_TagIconButton, color:colorTagRelev }} style={{height: 8, margin: '-10px', padding:0, width:this.props.width_TagButton}}><RelevantFace /></IconButton>
                        </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Irrelevant</Tooltip>}>
                        <Button style={{height: this.props.height_TagButton}}>
                          <IconButton onClick={this.onTagActionClicked.bind(this,url_info[0],'Irrelevant-'+id)} iconStyle={{width:this.props.width_TagIconButton,height: this.props.height_TagIconButton,marginBottom:this.props.marginBottom_TagIconButton, color:colorTagIrrelev }} style={{height: 8, margin: '-10px', padding:0, width:this.props.width_TagButton}}><IrrelevantFace /></IconButton>
                        </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Neutral</Tooltip>}>
                        <Button style={{height: this.props.height_TagButton}}>
                          <IconButton onClick={this.onTagActionClicked.bind(this,url_info[0],'Neutral-'+id)} iconStyle={{width:this.props.width_TagIconButton,height: this.props.height_TagIconButton,marginBottom:this.props.marginBottom_TagIconButton, color:colorTagNeutral }} style={{height: 8, margin: '-10px', padding:0, width:this.props.width_TagButton}}><NeutralFace /></IconButton>
                        </Button>
                        </OverlayTrigger>
                      </ButtonGroup>
                    </div>

                    </div>
                    <br/>
                    <div style={{fontSize: '12px', fontWeight: '500', width: '120px', marginTop:'-30px', marginBottom:7}}>
                      <Select.Creatable
                      placeholder='Add Tag'
                      multi={false}
                      options={this.availableTags}
                      onChange={this.addCustomTag.bind(this, [url_info[0]])}
                      ignoreCase={true}
                      style={{height:30}}/>
                    </div>

          <div>
            <Button onClick={this.crawlNextLevel.bind(this,'Backward', [url_info[0]])} style={{width: '60px', height: '37px', fontSize: '9px', padding:0}} >
            BACKWARD<br/>LINKS
            </Button>
            <Button onClick={this.crawlNextLevel.bind(this,'Forward', [url_info[0]])} style={{width: '59px', height: '37px', fontSize: '9px', padding:0}}>
            FORWARD<br/>LINKS
            </Button>
          </div>
          </div>
          </div>
          </div>
          <div style={{display: 'flex',flexWrap: 'wrap'}}>
          {chip}
          </div>
          </div>
          <br/>
          <Divider style={{marginTop:'-1px', marginBottom:'-15px'}}/>
        </div>
      </ListItem>;
    });

    const popUpButton = [
      <div style={{display: 'flex', justifyContent: 'space-between' }}>
      <div style={{width: '60%', display: 'flex', justifyContent: 'space-between'}}>
      <div style={{fontSize: '14px', fontWeight: '500',width: '150px', height:'88%', position: 'absolute'}}>
      <Select.Creatable
      placeholder='Add Tag'
      multi={false}
      options={this.availableTags}
      onChange={this.addCustomTag.bind(this, this.multipleSelectionPages)}
      ignoreCase={true}
      />
      </div>
      {
        // Below is a dummy DIV to compensate for the absolute positioning
        // of the Select component
      }
      <div style={{width: '150px', height: '80%'}}></div>
      <RaisedButton label='Tag' labelPosition='before'  backgroundColor={'#BDBDBD'} style={{ marginRight:4}}   labelStyle={{textTransform: 'capitalize'}} icon={<RelevantFace color={'#4682B4'} />} onClick={this.onTagSelectedPages.bind(this,'Relevant')}/>
      <RaisedButton label='Tag' labelPosition='before' backgroundColor={'#BDBDBD'} style={{marginRight:4}}  labelStyle={{textTransform: 'capitalize'}} icon={<IrrelevantFace color={'#CD5C5C'}/>} onClick={this.onTagSelectedPages.bind(this,'Irrelevant')}/>
      <RaisedButton label='Tag' labelPosition='before'  backgroundColor={'#BDBDBD'}  labelStyle={{textTransform: 'capitalize'}} icon={<NeutralFace  color={'#FAFAFA'}/>} onClick={this.onTagSelectedPages.bind(this,'Neutral')}/>
      </div>

      <div style={{width: '30%', display: 'flex', justifyContent: 'space-around'}}>
      <Button
      style={{width: '90px', height: '36px', fontSize: '10px', fontColor: '#FFFFFF', backgroundColor: '#BDBDBD', marginRight: '4px', paddingTop: '3px'}}
      onClick={this.crawlNextLevel.bind(this,'Backward', null)}
      >
      BACKWARD<br/>LINKS
      </Button>

      <Button
      style={{width: '90px', height: '36px', fontSize: '10px', fontColor: '#FFFFFF', backgroundColor: '#BDBDBD', paddingTop: '3px'}}
      onClick={this.crawlNextLevel.bind(this,'Forward', null)}
      >
      FORWARD<br/>LINKS
      </Button>
      </div>
      </div>
    ];
    var ceil_currentPageCount = Math.ceil(currentPageCount);
    var messageSelectAllPages = (this.state.checkedSelectAllPages)? <span> All <b> {this.state.lengthTotalPages} </b> results in {ceil_currentPageCount} paginations are selected.</span>:<span/>;

    const actionsDialogTagAllPages = [
      <FlatButton
      label='Cancel'
      primary={true}
      onClick={this.handleCloseDialogTagAllPages}
      />,
      <FlatButton
      label='Confirm'
      primary={true}
      onClick={this.handleConfirmTagAllPages}
      />,
    ];

    return (
      <div>
      <div style={{width:'448px', borderTop:'solid', borderRight: 'solid', borderColor:'lightgray',marginRight:'-50px', paddingTop: 5}}>
        <p style={{float:'left', color: '#757575', fontSize: '13px', fontWeight: '500', marginLeft:'10px',}}> Selected pages: <span style={{color:'black'}}>{this.state.lengthTotalPages}</span> </p>
        <p style={{float:'right', color: '#757575', fontSize: '13px', fontWeight: '500', marginRight: '11px',}}>  Domain Model Accuracy: {this.state.accuracyOnlineLearning} % </p>
      </div>
      <div  style={{width:this.props.width_areaSnippet}}>
      <div style={{  marginLeft:'23px'}} >
      <ReactPaginate
      previousLabel={'previous'}
      nextLabel={'next'}
      initialPage={0}
      forcePage={this.state.currentPagination}
      breakLabel={<a >...</a>}
      breakClassName={'break-me'}
      pageCount={currentPageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={1}
      onPageChange={this.handlePageClick.bind(this)}
      containerClassName={'pagination'}
      subContainerClassName={'pages pagination'}
      activeClassName={'active'} />

      <div style={{display: 'flex', alignItems: 'center', float:'right', fontSize: '12px', fontWeight: '500', paddingRight: '20px', marginTop: '-20px', marginRight:'-5px'}}>
      <div style={{display: 'inline', fontSize: '12px', marginRight: '30px', marginLeft: '-20px' }}>
      <div style={{textAlign: 'center', verticalAlign: 'middle', lineHeight: '30px', marginRight: 0, marginLeft:0,   display: 'inline-block',
        height: 30,
        position: 'relative',
        lineHeight: '2.5em',
        paddingLeft: 9,
        paddingRight: 3,
        background: '#f0efef',
        color: '#383636' }}>
        <div style={{content: '',
        borderLeft: '20px solid #f0efef',
        position: 'absolute',
        borderBottom: '15px solid transparent',
        borderTop: '15px solid transparent',
        height: 0,
        width: 0,
        marginRight: '-20px',
        right: 0}}></div>Tag All</div>
      </div>
      <div style={{float:'right',width:this.props.width_TagAllCustomTag, marginRight: '5px'}}>
      <Select.Creatable
      placeholder='Add Tag'
      multi={false}
      options={this.availableTags}
      onChange={this.addCustomTag.bind(this, this.currentUrls)}
      ignoreCase={true}
      />
      </div>
        <RaisedButton labelPosition='before'  backgroundColor={'#BDBDBD'} style={{marginRight:4,minWidth: this.props.minWidth_TagAllTagButton}}  labelStyle={{textTransform: 'capitalize'}} icon={<RelevantFace color={'#4682B4'} />} onClick={this.onTagAllPages.bind(this,'Relevant')}/>
        <RaisedButton labelPosition='before' backgroundColor={'#BDBDBD'} style={{marginRight:4,minWidth: this.props.minWidth_TagAllTagButton}}  labelStyle={{textTransform: 'capitalize'}} icon={<IrrelevantFace color={'#CD5C5C'}/>} onClick={this.onTagAllPages.bind(this,'Irrelevant')}/>
        <RaisedButton labelPosition='before'  backgroundColor={'#BDBDBD'} style={{marginRight:4,minWidth: this.props.minWidth_TagAllTagButton}} labelStyle={{textTransform: 'capitalize'}} icon={<NeutralFace  color={'#FAFAFA'}/>} onClick={this.onTagAllPages.bind(this,'Neutral')}/>

        <Button style={{width: this.props.width_TagAllBFLinkButton, height: '38px', fontSize: this.props.fontSize_TagAllBFLinkButton, fontColor: '#FFFFFF', backgroundColor: '#BDBDBD', marginRight: '4px'}}
        onClick={this.crawlNextLevel.bind(this,'Backward', this.state.currentUrls)}>
        BACKWARD<br/>LINKS
        </Button>
        <Button style={{width: this.props.width_TagAllBFLinkButton, height: '38px', fontSize: this.props.fontSize_TagAllBFLinkButton, fontColor: '#FFFFFF', backgroundColor: '#BDBDBD'}}
        onClick={this.crawlNextLevel.bind(this,'Forward', this.state.currentUrls)}>
        FORWARD<br/>LINKS
        </Button>
      </div>
      <div style={{marginLeft:'0px', marginTop:'-15px', width:300, height:20}} />
      {/*<Checkbox
      label={'Select ALL results in '+ceil_currentPageCount + ' paginations'}
      checked={this.state.checkedSelectAllPages}
      onCheck={this.updatingCheckSelectAllPages}
      style={{marginLeft:'0px', marginTop:'-25px', width:300}}
      />
       {messageSelectAllPages}*/}
      </div>

      <div >
      <Divider style={{marginTop:20, marginLeft:10, marginRight:10, marginBottom:0}}/>
      <List style={{overflowY: 'scroll', height:550}}>
      {urlsList}
      <Divider inset={true} />
      </List>
      <div style={{display: 'table', marginRight: 'auto', marginLeft: 'auto',}}>
      <ReactPaginate previousLabel={'previous'}
      nextLabel={'next'}
      initialPage={0}
      forcePage={this.state.currentPagination}
      breakLabel={<a >...</a>}
      breakClassName={'break-me'}
      pageCount={currentPageCount}
      marginPagesDisplayed={2}
      pageRangeDisplayed={1}
      onPageChange={this.handlePageClick.bind(this)}
      containerClassName={'pagination'}
      subContainerClassName={'pages pagination'}
      activeClassName={'active'} />
      </div>
      </div>
      <Dialog  title='Tag Selected?'  actions={actionsCancelMultipleSelection} modal={false} open={this.state.openMultipleSelection} onRequestClose={this.handleCloseMultipleSelection.bind(this)}>
      {popUpButton}
      </Dialog>

      <Dialog
      title='Tag confirmation'
      actions={actionsDialogTagAllPages}
      modal={true}
      open={this.state.openDialogTagAllPages}
      >
      Are you sure that you want to tag ALL {this.state.lengthTotalPages} results in {ceil_currentPageCount} paginations?.
      </Dialog>
      </div>
      </div>
    );
  }
}

ViewTabSnippets.defaultProps = {
  minWidth_TagAllButton:68,
  fontSize_TagAllButton:11,
  width_TagAllCustomTag:80,
  minWidth_TagAllTagButton:35,
  width_TagAllBFLinkButton:70,
  fontSize_TagAllBFLinkButton:9,

  height_TagButtonGroup: '90%',
  height_TagButton: '90%',
  width_TagIconButton:20, height_TagIconButton: 20, marginBottom_TagIconButton:'-1px',
  width_TagButton:35,
  width_divSnippet: '57%',
  marginLeft_divSnippet:'-8px',
  width_areaSnippet: '448px'

};

class CircularProgressSimple extends React.Component{
  render(){
    return(
    <div style={{borderColor:'green', marginLeft:'50%'}}>
      <CircularProgress size={60} thickness={7} />
    </div>
  );}
}


export default ViewTabSnippets;
