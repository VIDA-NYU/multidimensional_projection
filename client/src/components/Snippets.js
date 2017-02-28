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
        var query = 'select * from html where url="'+props.originalData['urls'][i]+'" and xpath="*"';
        var url = 'https://query.yahooapis.com/v1/public/yql?q=' + query;
        try {
            getRequests.push($.get(url, function(response, status, xhr) {
              var html = $(response).find('html');
              var title= (html.find('meta[property|="og:title"]').attr('content')) ? html.find('meta[property|="og:title"]').attr('content') :
                          ( html.find('meta[name=title]').attr('content') ) ? html.find('meta[name=title]').attr('content') :
                            ( html.find('title').text()) ? html.find('title').text() : "";

              var description= (html.find('meta[property|="og:description"]').attr('content')) ? html.find('meta[property|="og:description"]').attr('content') :
                                (html.find('meta[property|="og:Description"]').attr('content')) ? html.find('meta[property|="og:Description"]').attr('content') :
                                  ( html.find('meta[name=description]').attr('content') ) ? html.find('meta[name=description]').attr('content') :
                                    ( html.find('meta[name=Description]').attr('content') ) ? html.find('meta[name=Description]').attr('content') : "";


              var image= (html.find('meta[property|="og:image"]').attr('content')) ? html.find('meta[property|="og:image"]').attr('content') :
                                (html.find('meta[property|="og:Image"]').attr('content')) ? html.find('meta[property|="og:Image"]').attr('content') :
                                  ( html.find('meta[name=image]').attr('content') ) ? html.find('meta[name=image]').attr('content') :
                                    ( html.find('meta[name=Image]').attr('content') ) ? html.find('meta[name=Image]').attr('content') :
                                     ( html.find('img').attr('src') ) ?  html.find('img').attr('src') :  "";

              //console.log(image);
              if(image!==""){
                if(image.indexOf("//") === -1)  image = props.originalData['urls'][i].substring(0, props.originalData['urls'][i].indexOf("/", (props.originalData['urls'][i].indexOf("//")+2)))+image;
                snippets.push(<div style={{  width:'440px', minHeight: '60px',  borderColor:"silver", marginLeft: '8px', marginTop: '5px',}}><div><p style={{float:'left'}}><img src={image} alt="HTML5 Icon" style={{width:'60px',height:'60px', marginRight:'3px'}}/></p> <p style={{ color:'blue'}} >{title} <br/><a target="_blank" href={props.originalData['urls'][i]} style={{fontSize:'10px'}}>{props.originalData['urls'][i]}</a></p></div><br/><div style={{marginTop:'-3px'}}><p>{description}</p></div><Divider /></div>);
              }
              else{
                snippets.push(<div style={{ width:'440px',  borderColor:"silver", marginLeft: '8px',marginTop: '5px',}}><p style={{color:'blue'}}>{title}</p><p><a target="_blank" href={props.originalData['urls'][i]} style={{fontSize:'10px'}}>{props.originalData['urls'][i]}</a></p><p>{description}</p><Divider /></div>);
              }
              this.setState({snippets:snippets, selectedPoints:this.props.selectedPoints});
            }.bind(this)).fail(function() {
              snippets.push(<div style={{ width:'440px',  borderColor:"silver", marginLeft: '8px',marginTop: '5px',}}><p><a target="_blank" href={props.originalData['urls'][i]}>{props.originalData['urls'][i]}</a></p><Divider /></div>);
              this.setState({snippets:snippets, selectedPoints:this.props.selectedPoints});
            }.bind(this))
          );
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
