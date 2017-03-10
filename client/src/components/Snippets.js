import React, {Component} from 'react';
import Divider from 'material-ui/Divider';
import $ from 'jquery';


class Snippets extends Component{

  constructor(props){
    super(props);
    this.state={
      selectedPoints : this.props.selectedPoints,
      snippets:undefined,
    };
    this.showingSnippets = this.showingSnippets.bind(this);
    this.requests=[];
  }
  componentWillReceiveProps(props, nextState){
    if (props.selectedPoints === this.state.selectedPoints ) {
      return false;
    }
    if(this.requests.length>0){
      for(var i = 0; i < this.requests.length; i++) this.requests[i].abort();
    }
    this.showingSnippets(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
       return true;
  }

  setCurrentRequests(currentRequests){
    this.requests= currentRequests;
  }

  showingSnippets(props){
    let snippets = [];
    let getRequests = [];
    this.setState({snippets:undefined});
    for (let i = 0; i < props.originalData['urls'].length; ++i){
      if(props.selectedPoints[i]){
        var title="", description="";
        try {
		          var title= props.originalData["title"][i];
              var description= props.originalData["snippet"][i];
              var image= props.originalData["image_url"][i];

              //console.log(image);
              if(image!==""){
                snippets.push(<div style={{  width:'440px', minHeight: '60px',  borderColor:"silver", marginLeft: '8px', marginTop: '5px',}}><div><p style={{float:'left'}}><img src={image} alt="HTML5 Icon" style={{width:'60px',height:'60px', marginRight:'3px'}}/></p> <p style={{ color:'blue'}} >{title} <br/><a target="_blank" href={props.originalData['urls'][i]} style={{fontSize:'10px'}}>{props.originalData['urls'][i]}</a></p></div><br/><div style={{marginTop:'-3px'}}><p>{description}</p></div><Divider /></div>);
              }
              else{
                snippets.push(<div style={{ width:'440px',  borderColor:"silver", marginLeft: '8px',marginTop: '5px',}}><p style={{color:'blue'}}>{title}</p><p><a target="_blank" href={props.originalData['urls'][i]} style={{fontSize:'10px'}}>{props.originalData['urls'][i]}</a></p><p>{description}</p><Divider /></div>);
              }
              this.setState({snippets:snippets, selectedPoints:this.props.selectedPoints});

        }
        catch(err) {
          console.log(err);
        }
      }
    }
    this.setCurrentRequests(getRequests);
  }

  render(){
    return(
      <div style={{marginLeft:'-2px', width:'450px', overflowY: 'scroll', height:'418px', borderLeft: '2px solid',borderRight: '2px solid', borderBottom: '2px solid', borderColor:'lightgray'}}>
        {this.state.snippets}
      </div>
    );
  }

}

export default Snippets;
