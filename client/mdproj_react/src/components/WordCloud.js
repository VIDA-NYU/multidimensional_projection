import React, {Component} from 'react';
import WordCloudD3 from 'react-d3-cloud';
import {scaleLinear} from 'd3-scale';



class WordCloud extends Component {

  constructor(props){
    super(props);
    this.state={
      selectedPoints : this.props.selectedPoints,
    };
    this.setSelectedWordCloud = this.setSelectedWordCloud.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
       if (nextProps.selectedPoints === this.state.selectedPoints) {
         return false;
       }
       return true;
  }

  //Create a WordCloud based on data.
  setSelectedWordCloud(){
    var frequency_list = [];
    var hashmapTerms = [];
    for(var a in this.props.dimNames){
      var nameFeature= this.props.dimNames[a];
      if(nameFeature != "labels" && nameFeature != "urls"){
        hashmapTerms[nameFeature]=0;
        for (let i = 0; i < this.props.originalData[nameFeature].length; ++i){
          var frequencyTerm = this.props.originalData[nameFeature][i];
          if(this.props.selectedPoints.includes(true)){
            if(this.props.selectedPoints[i]){ //create wordcloud based just on the selected data.
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
    var minRange=1, maxRange=5;
    if(maxValue<12000){ minRange= 1; maxRange=10;} else {maxValue =13000;}
    for(var i in frequency_list){
      var scaleX = scaleLinear().domain([0,maxValue]).range([minRange,maxRange]);
      frequency_list[i].value = scaleX(  frequency_list[i].value);
    }
    this.setState({selectedPoints: this.props.selectedPoints});
    return frequency_list;
  }

  render(){
    const data = this.setSelectedWordCloud();
    const fontSizeMapper = word => Math.log2(word.value) * 10;
    return(
        <WordCloudD3 data={data} fontSizeMapper={fontSizeMapper}  width={400} height={300} padding={2}/>
    );
  }

}

export default WordCloud;
