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

import RadViz from './RadViz';
import SigmoidGraph from './SigmoidGraph';
import WordCloud from './WordCloud';
import Snippets from './Snippets';

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
     value: 0,
     data:undefined,
     colors:undefined,
     originalData:undefined,
     showedData:0,
     selectedPoints:[false],
     urls:undefined,
     'sigmoidScale':1,
     'sigmoidTranslate':0,

   };
   this.updateLabelColors = this.updateLabelColors.bind(this);
   this.updateSigmoidScale = this.updateSigmoidScale.bind(this);
   this.updateSigmoidTranslate = this.updateSigmoidTranslate.bind(this);
   this.showingData = this.showingData.bind(this);
   this.showingUrls = this.showingUrls.bind(this);
 };

 showingData(event, value){
  this.setState({showedData:value,});
 }

 setSelectedPoints(selected){
   console.log(selected);
     this.setState({selectedPoints:selected})
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

 updateLabelColors(event, index, value, ){
   let dimNames = Object.keys(this.state.originalData);
   let scaleColor = scaleOrdinal(schemeCategory10);
   let colors = [];
   for (let i = 0; i < this.state.originalData[dimNames[0]].length; ++i){
       colors.push(scaleColor(this.state.originalData[dimNames[value-1]][i]));
   }
   this.setState({value:value, colors:colors})
 }

  updateSigmoidScale(s){
      this.setState({'sigmoidScale':s})
  }

  updateSigmoidTranslate(s){
      this.setState({'sigmoidTranslate':s})
  }


  componentWillMount(){
    $.post(
        '/getRadvizPoints',
        { },
        function(es) {
          var data = JSON.parse(es);
          console.log(Object.keys(data));
          let numericalData = [];
          let dimNames = Object.keys(data);
          let scaleColor = scaleOrdinal(schemeCategory10);
          let colors = [];

          for (let i = 0; i < data['labels'].length; ++i){
              colors.push(scaleColor(data['labels'][0]));
              let aux = {};
              for (let j = 0; j < dimNames.length-2; ++j){//except urls and labels
                  aux[dimNames[j]] = parseFloat(data[dimNames[j]][i]);
              }
              numericalData.push(aux);
          }
          this.setState({originalData: data, data:numericalData, colors:colors, flat:1, dimNames: dimNames});
        }.bind(this)
      );
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

      return(
        <Grid>

          <Col ls={3} md={3} style={{marginLeft: '-50px', borderRight: '2px solid', borderColor:'lightgray'}}>
               <List>
                 <Subheader>Sigmoid</Subheader>
                 <ListItem>
                   <p>Translation:</p> <Slider min={-1} max={1} step={0.01} defaultValue={0} onChange={this.updateSigmoidTranslate}/>
                 </ListItem>
                 <ListItem>
                   <p>Scale:</p> <Slider min={0} max={100} step={1} defaultValue={1} onChange={this.updateSigmoidScale}/>
                 </ListItem>
                 <ListItem >
                  <SigmoidGraph sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale}/>
                 </ListItem>
                 <Divider />
                 <Subheader>Interaction</Subheader>
                 <ListItem>
                   <RadioButtonGroup name="shipSpeed" defaultSelected={0} onChange={this.showingData}>
                    <RadioButton value={0} label="Show all" style={styles.radioButton}/>
                    <RadioButton value={1} label="Hide selected" style={styles.radioButton}/>
                    <RadioButton value={2} label="Hide unselected" checkedIcon={<ActionFavorite />} uncheckedIcon={<ActionFavoriteBorder />} style={styles.radioButton}/>
                  </RadioButtonGroup>
                 </ListItem>
                 <Divider />
                 <Subheader>Color</Subheader>
                 <ListItem>
                   <DropDownMenu value={this.state.value} onChange={this.updateLabelColors}>
                   <MenuItem value={0} primaryText="None" />
                   {Object.keys(dimensions).map((k, index)=>{
                        var attibute = dimensions[k].attribute;
                        var id = index+1;
                        return <MenuItem value={id} primaryText={attibute} />
                      })}
                  </DropDownMenu>
                 </ListItem>
                 <Divider />
                 <Subheader>Tooltip</Subheader>
                 <ListItem>
                   <DropDownMenu value={this.state.value} onChange={this.updateLabelColors}>
                   <MenuItem value={0} primaryText="None" />
                   {Object.keys(dimensions).map((k, index)=>{
                        var attibute = dimensions[k].attribute;
                        var id = index+1;
                        return <MenuItem value={id} primaryText={attibute} />
                      })}
                  </DropDownMenu>
                 </ListItem>
               </List>
          </Col>

          <Col  ls={7} md={7} style={{ background:"white"}}>
            <Row className="Menus-child">
            <RadViz data={this.state.data} colors={this.state.colors} sigmoid_translate={this.state.sigmoidTranslate} sigmoid_scale={this.state.sigmoidScale} showedData={this.state.showedData} setSelectedPoints={this.setSelectedPoints.bind(this)} />
            </Row>
          </Col>

          <Col  ls={2} md={2} style={{background:"white"}}>
            <Row className="Menus-child">
            <WordCloud dimNames={this.state.dimNames} selectedPoints={this.state.selectedPoints} originalData={this.state.originalData}/>
            <p style={{color:"silver", marginLeft:'30px'}}>Total pages: {nroSelectedUrls}</p>
              <Snippets selectedPoints={this.state.selectedPoints} originalData={this.state.originalData}/>
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
// width:320,
export default Body;
