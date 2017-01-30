import React, {Component} from 'react';
import $ from 'jquery';


class Snippets extends Component{

  constructor(props){
    super(props);
    this.state={
      selectedPoints : undefined,
      snippets:undefined,
    };
    this.showingSnippets = this.showingSnippets.bind(this);
  }
  componentWillReceiveProps(props){
      this.showingSnippets(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
       if (nextProps.selectedPoints === this.state.selectedPoints ) {
         if(this.state.urls !== nextState.urls){
           return true;
         }
         return false;
       }
       return true;
  }

  showingSnippets(props){
    let snippets = [];
    for (let i = 0; i < props.originalData['urls'].length; ++i){
      if(props.selectedPoints[i]){
        var title="", description="";
        var query = 'select * from html where url="'+props.originalData['urls'][i]+'" and xpath="*"';
        var url = 'https://query.yahooapis.com/v1/public/yql?q=' + query;
        try {
            var title="";
            var description="";
            $.get(url, function(response, status, xhr) {
              var html = $(response).find('html');
              var title= html.find('meta[property|="og:title"]').attr('content') ;
              if(title===undefined || title==="") title= html.find('meta[name=title]').attr('content');
              var description=html.find('meta[property|="og:description"]').attr('content');
              if(description===undefined || description==="") description= html.find('meta[name=description]').attr('content');
              snippets.push(<div style={{width:'350px', border:'solid', borderColor:"silver", paddingLeft: '8px',}}><p style={{color:'blue'}}>{title}</p><p><a target="_blank" href={props.originalData['urls'][i]}>{props.originalData['urls'][i]}</a></p><p>{description}</p></div>);
              this.setState({snippets:snippets});
            }.bind(this)).fail(function() {
              snippets.push(<div style={{width:'350px', border:'solid', borderColor:"silver", paddingLeft: '8px',}}><p><a target="_blank" href={props.originalData['urls'][i]}>{props.originalData['urls'][i]}</a></p></div>);
              this.setState({snippets:snippets});
            }.bind(this));
        }
        catch(err) {
          console.log(err);
        }
      }
    }
  }

  render(){
    return(
      <div>
        {this.state.snippets}
      </div>
    );
  }

}

export default Snippets;
