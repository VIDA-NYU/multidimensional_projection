import React, {Component} from 'react';
import $ from 'jquery';


class Snippets extends Component{

  constructor(props){
    super(props);
    this.state={
      selectedPoints : undefined,
      urls:undefined,
    };
    this.showingUrls = this.showingUrls.bind(this);
  }
  componentWillReceiveProps(props){
      this.showingUrls(props);
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

  showingUrls(props){
    let urls = [];
    for (let i = 0; i < props.originalData['urls'].length; ++i){
        if(props.selectedPoints[i]){
          var title="", description="";
          var query = 'select * from html where url="'+props.originalData['urls'][i]+'" and xpath="*"';
          var url = 'https://query.yahooapis.com/v1/public/yql?q=' + query;
          $.get(url, function(response) {
            var html = $(response).find('html');
            title= html.find('meta[property|="og:title"]').attr('content') ;
            if(title===undefined || title==="") title= html.find('meta[name=title]').attr('content');
            description=html.find('meta[property|="og:description"]').attr('content');
            if(description===undefined || description==="") description= html.find('meta[name=description]').attr('content');
            //console.log('title: ' + title);
            //console.log('description: ' + description);
            //console.log(response);
            //urls.push(<p>{props.originalData['urls'][i]}</p>);
            urls.push(<div style={{width:'350px', border:'solid', borderColor:"silver"}}><p style={{color:'blue'}}>{title}</p><p><a target="_blank" href={props.originalData['urls'][i]}>{props.originalData['urls'][i]}</a></p><p>{description}</p></div>);
            this.setState({urls:urls});
          }.bind(this));
        }
      }
  }

  render(){
    return(
      <div>
        {this.state.urls}
      </div>
    );
  }

}

export default Snippets;
