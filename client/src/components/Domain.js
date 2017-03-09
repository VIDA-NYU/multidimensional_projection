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

class Domain extends Component {

  constructor(props) {
    super(props);
    this.state = {
	idDomain:'',
      searchText:'',
      flat:0,
      data:undefined,
      colors:undefined,
      originalData:undefined,
      dimNames:[],
    };
    this.colorTags= [ "#9E9E9E", "#0D47A1", "#C62828"];
};

    componentWillMount(){
    $.post(
        '/getRadvizPoints',
        {index: this.props.location.query.index},
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
              this.setState({originalData: data, data:numericalDataTSP, colors:colors, flat:1, dimNames: dimNames});
              //this.props.setDimNames(dimNames);
            }.bind(this)
          );
        }.bind(this)
    );
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
filterKeyword(searchText){
  this.setState({
    searchText: searchText,
  });
}

render() {
  return (
    <div>
      <Header currentIdDomain={this.props.location.query.idDomain} currentNameDomain={this.props.location.query.nameDomain} dimNames={this.state.dimNames} filterKeyword={this.filterKeyword.bind(this)} />
	  <Body currentDomain={this.state.idDomain} searchText={this.state.searchText} originalData={this.state.originalData} data={this.state.data} colors={this.state.colors} flat={this.state.flat} dimNames={this.state.dimNames}/>
    </div>
  );
}
}

export default Domain;
