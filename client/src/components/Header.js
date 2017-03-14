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
import Domain from 'material-ui/svg-icons/maps/transfer-within-a-station';
var ReactRouter = require('react-router');
var Link = ReactRouter.Link;
import { FormControl} from 'react-bootstrap';
import Search from 'material-ui/svg-icons/action/search';
import AutoComplete from 'material-ui/AutoComplete';


import IconLocationOn from 'material-ui/svg-icons/communication/location-on';
import Body from './Body';
import TextField from 'material-ui/TextField';


const styles = {
  backgound: {
    background: "#50137A"
  },
  titleText: {
    color: 'white'
  },
  toolBarHeader: {
    width:'70%',
    height:45,
    marginTop:8,
    marginRight:'-15px',
    background:'#B39DDB',
    borderRadius: '5px 5px 5px 5px',
    borderStyle: 'solid',
    borderColor: '#7E57C2#B39DDB',
    borderWidth: '1px 0px 1px 0px'
  },
  toolBarCurrentDomain:{
    marginLeft: '0px',
    marginRight: '0px'
  },
  tittleCurrentDomain:{
    fontSize: 15,
    textTransform: 'uppercase',
    color: 'black', fontWeight:'bold',
    paddingLeft: '3px',
    paddingRight: '0px',
    marginTop: '-5px',
  },
  toolBarGroupChangeDomain:{
    marginLeft: '0px',
    marginRight: '2px'
  },
  buttons:{
    margin: '-10px',
    marginTop:5,
    width:35,
    border:0,
  },

};
const colors = [
  'Red',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Purple',
  'Black',
  'White',
];

class Header extends Component {

  constructor(props) {
    super(props);
    this.state = {
      idDomain:'',
      searchText:'',
      selectedSearchText:[],
  };
};

componentWillMount(){
    console.log("header componentWillMount");
    this.setState({idDomain: this.props.currentIdDomain, });
};

componentWillReceiveProps  = (newProps, nextState) => {
  console.log("header componentWillReceiveProps");
  let newState = {};
  if(newProps.currentIdDomain ===this.state.idDomain){
    if(newProps.filterTerm=="" && this.state.searchText!==""){
      newState["searchText"] = newProps.filterTerm;
    }
    else return;
  }
  newState["idDomain"] = newProps.currentIdDomain;
  this.setState(newState);

};


handleUpdateInput = (searchText) => {
  this.setState({
    searchText: searchText,
  });
};

handleNewRequest = (searchText) => {
  this.setState({
    searchText: searchText,
  });
  this.props.filterKeyword(searchText);
};

render() {
  console.log("header");
  return (
      <AppBar showMenuIconButton={true}
        style={styles.backgound}
        title={  <span style={styles.titleText}> Document Explorer </span>}
        //iconElementLeft={<IconButton><NavigationClose /></IconButton>}
        iconElementLeft={<img src={logoNYU}  height='45' width='40'  />}
        //onLeftIconButtonTouchTap={this.removeRecord.bind(this)}
      >
      <Toolbar style={styles.toolBarHeader}>
        <ToolbarTitle text={this.props.currentNameDomain} style={styles.tittleCurrentDomain}/>
        <ToolbarSeparator  />
        <Link to='/'>
          <IconButton tooltip="Change Domain" style={{marginLeft:'-15px'}} > <Domain />
          </IconButton>
        </Link>
        <ToolbarSeparator  />

          <AutoComplete
             style={{width:'35%',marginRight:'0px', marginTop:5, height: 35, borderColor: 'gray', borderWidth: 1, background:"white", borderRadius:"5px"}}
             hintText="Search ..."
             hintStyle={{marginBottom:"0px", marginLeft:10}}
             inputStyle={{marginBottom:10, marginLeft:10}}
             underlineShow={false}
             searchText={this.state.searchText}
             onUpdateInput={this.handleUpdateInput}
             onNewRequest={this.handleNewRequest}
             dataSource={[""]}
             filter={(searchText, key) => (key.indexOf(searchText) !== -1)}
             openOnFocus={true}
         />
      </Toolbar>
      </AppBar>
  );
}
}

export default Header;
//AutoComplete
//dataSource={this.props.dimNames}
