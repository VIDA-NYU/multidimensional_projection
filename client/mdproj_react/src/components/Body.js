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
import Numeric from 'numeric';

import {Radviz} from './RadViz';
const styles = {
  block: {
    maxWidth: 250,
  },
  radioButton: {
    fontSize: 'small',
    fontFamily: 'Times New Roman',
    marginBottom: 16,
  },
};

class Body extends Component {

 constructor(props){
   super(props);
   this.state={
     flat:0,
     dimensionsElement:[],
     radvizpoints:undefined,
     value: 0,
   };
 };

handleChange = (event, index, value) => this.setState({value});

componentWillMount(){
  console.log('componentWillMount Body');

  $.post(
      '/getRadvizPoints',
      { },
      function(es) {
        var info = JSON.parse(es);
        this.setState({radvizpoints: info, flat:1});
      }.bind(this)
    );
}

  render(){
    if(this.state.flat===1)//Object.keys(this.state.radvizpoints).length >0)
    {
      if (!this.state.radvizpoints){
          return;
      }
      var radviz = new Radviz(this.state.radvizpoints);
      var dimensions=[];
      radviz.getDimensionNames().forEach(function (attribute,idx) {
          var dim = {id: idx,name: attribute,attribute: attribute,available: true,group: false,pos: 0,weight: 1};
          //addDimension( id : number, name_circle: small name, name_attribute: complete name)
          dimensions.push(dim);
      });
      return(
        <Grid>
        <Col md={2} style={{marginLeft: '-500px', width:400,  borderRight: '2px solid', borderColor:'lightgray'}}>
             <List>
               <Subheader>Sigmoid</Subheader>
               <ListItem>
                 <p>Translate:</p>
                 <Slider min={0} max={20} defaultValue={3} />
               </ListItem>
               <ListItem>
                 <p>Scale:</p>
                 <Slider min={0} max={20} defaultValue={3} />
               </ListItem>
               <Divider />
               <Subheader>Interaction</Subheader>
               <ListItem>
                 <RadioButtonGroup name="shipSpeed" defaultSelected="not_light">
                  <RadioButton
                    value="light"
                    label="Show all"
                    style={styles.radioButton}
                  />
                  <RadioButton
                    value="not_light"
                    label="Hide selected"
                    style={styles.radioButton}
                  />
                  <RadioButton
                    value="ludicrous"
                    label="Hide unselected"
                    checkedIcon={<ActionFavorite />}
                    uncheckedIcon={<ActionFavoriteBorder />}
                    style={styles.radioButton}
                  />
                </RadioButtonGroup>
               </ListItem>
               <Divider />
               <Subheader>Tooltip</Subheader>
               <ListItem>
                 <DropDownMenu value={this.state.value} onChange={this.handleChange}>
                 <MenuItem value={0} primaryText="None" />
                 {Object.keys(dimensions).map((k, index)=>{
                   console.log(k + "," + dimensions[k].attribute);
                      var attibute = dimensions[k].attribute;
                      var id = index+1;
                      return <MenuItem value={id} primaryText={attibute} />
                    })}
                </DropDownMenu>
               </ListItem>
               <Divider />
               <Subheader>Color</Subheader>
               <ListItem>
                 <DropDownMenu value={this.state.value} onChange={this.handleChange}>
                 <MenuItem value={0} primaryText="None" />
                 {Object.keys(dimensions).map((k, index)=>{
                   console.log(k + "," + dimensions[k].attribute);
                      var attibute = dimensions[k].attribute;
                      var id = index+1;
                      return <MenuItem value={id} primaryText={attibute} />
                    })}
                </DropDownMenu>
               </ListItem>
             </List>
        </Col>
        <Col  md={8} style={{width:'60%', background:"white"}}>
          <Row className="Menus-child">

          </Row>
        </Col>
        <Col  md={2} style={{background:"white"}}>
          <Row className="Menus-child">
          hello
          </Row>
        </Col>
        </Grid>

      )
    }
    return(
      <div>hi</div>
    );

  }

}

export default Body;
