// Filename:		Header.js
// Purpose:		Shows just information about the current domain. From here, the user can change of domain too.
//Dependencies: Body.js
// Author: Sonia Castelo (scastelo2@gmail.com)

import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import logoNYU from '../images/nyu_logo_purple.png';

import { } from 'material-ui/styles/colors';

import IconButton from 'material-ui/IconButton';
import {Toolbar, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import FontIcon from 'material-ui/FontIcon';
import Model from 'material-ui/svg-icons/image/blur-linear';
//import Domain from 'material-ui/svg-icons/maps/transfer-within-a-station';
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
import { FormControl} from 'react-bootstrap';
import Search from 'material-ui/svg-icons/action/search';
import AutoComplete from 'material-ui/AutoComplete';


import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import Body from './Body';
import Header from './Header';
import TextField from 'material-ui/TextField';
import $ from 'jquery';
import {scaleOrdinal, schemeCategory10} from 'd3-scale';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class Domain extends Component {

  constructor(props) {
    super(props);
    this.state = {
	    idDomain:'',
      flat:0,
      data:undefined,
      colors:undefined,
      originalData:undefined,
      dimNames:[],
      filterTerm:"",
      index:this.props.location.query.index,
      open:false,
    };
    this.colorTags= [ "#9E9E9E", "#0D47A1", "#C62828"];
  };

loadDataFromElasticSearch(index,  filterTerm){
  $.post(
      '/getRadvizPoints',
      {index: index, filterByTerm: filterTerm},
      function(es) {
        var data = JSON.parse(es);
        let numericalData = [];
        let dimNames = Object.keys(data);
        let scaleColor = scaleOrdinal(this.colorTags);
        let colors = [];
        data['modelResult'] = [];

        for (let i = 0; i < data['labels'].length; ++i){
            data['modelResult'][i] = "neutral";
            //colors.push(scaleColor(data['tags'][0]));
            let aux = {};
            for (let j = 0; j < dimNames.length-2; ++j){//except urls and labels
                aux[dimNames[j]] = parseFloat(data[dimNames[j]][i]);
            }
            numericalData.push(aux);
        }
        dimNames.push('modelResult');
        $.post(
          '/computeTSP',
          { },
          function(es) {
            let numericalDataTSP = [];
            var orderObj = JSON.parse(es);
            for (let i = 0; i < numericalData.length; ++i){
                let aux = {};
                for(var j in orderObj.cities){
                    aux[dimNames[orderObj.cities[j]]] = numericalData[i][dimNames[orderObj.cities[j]]];
                }
                numericalDataTSP.push(aux);
            }
            this.setState({originalData: data, data:numericalDataTSP, colors:colors, flat:1, dimNames: dimNames, filterTerm: filterTerm});
            //this.props.setDimNames(dimNames);
          }.bind(this)
        );
      }.bind(this)
  ).fail(function() {
            this.setState({open: true});
            }.bind(this));
}

componentWillMount(){
  this.loadDataFromElasticSearch(this.state.index, this.state.filterTerm);
  this.setState({idDomain: this.props.location.query.idDomain});
};

componentWillReceiveProps  = (newProps, nextState) => {
  if(newProps.location.query.idDomain ===this.state.idDomain){
    return;
  }
    this.setState({idDomain: this.props.location.query.idDomain});

};
/*
shouldComponentUpdate(nextProps, nextState) {
 console.log("header shouldComponentUpdate");
  if(nextProps.location.query.idDomain ===this.state.idDomain){
        return false;
   }
    return true;
};
*/

//Filter by terms (ex. ebola AND virus)
filterKeyword(filterTerm){
  this.loadDataFromElasticSearch(this.state.index, filterTerm);
}
handleOpen = () => {
  this.setState({open: true});
};

handleClose = () => {
  this.setState({open: false});
};
render() {
  const actions = [
      <FlatButton
        label="Ok"
        primary={true}
        onTouchTap={this.handleClose}
      />,
    ];
  return (
    <div>
      <Dialog
        actions={actions}
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose}
      >
      No pages found.
      </Dialog>;
      <Header currentIdDomain={this.props.location.query.idDomain} currentNameDomain={this.props.location.query.nameDomain} dimNames={this.state.dimNames} filterTerm={this.state.filterTerm} filterKeyword={this.filterKeyword.bind(this)} />
	  <Body currentDomain={this.state.idDomain} searchText={this.state.searchText} originalData={this.state.originalData} data={this.state.data} colors={this.state.colors} flat={this.state.flat} dimNames={this.state.dimNames} filterTerm={this.state.filterTerm}  filterKeyword={this.filterKeyword.bind(this)}/>
    </div>
  );
}
}

export default Domain;
