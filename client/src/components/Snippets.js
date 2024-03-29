import React, {Component} from 'react';
import Divider from 'material-ui/Divider';
import { ButtonGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import $ from 'jquery';


class Snippets extends Component{

  constructor(props){
    super(props);
    this.state={
      selectedPoints : this.props.selectedPoints,
      snippets:undefined,
    };
    this.showingSnippets = this.showingSnippets.bind(this);
  }
  componentWillReceiveProps(props, nextState){
    //if (props.selectedPoints === this.state.selectedPoints ) {
    //  return true; //false;
    //}
    this.showingSnippets(props);
  }

  shouldComponentUpdate(nextProps, nextState) {
       return true;
  }

  //Handling click event on the tag button. When it is clicked it should update tag of the page in elasticsearch.
  onTagActionClicked(ev){
    var idButton = (ev.target.id).split("-")
    var new_tag = idButton[0];
    var index_urls = idButton[1];
    var previus_tags = ev.target.value;
    var urls=[];
    this.props.tagFromSnippets(new_tag, previus_tags, index_urls );
  }

  showingSnippets(props){
    let snippets = [];
    this.setState({snippets:undefined});
    for (let i = 0; i < props.originalData['urls'].length; ++i){
      if(props.selectedPoints[i]){
        var title="", description="";
        try {
  	          var title= props.originalData["title"][i];
              var description= props.originalData["snippet"][i];
              var image= props.originalData["image_url"][i];
              var url = props.originalData['urls'][i];
              var uniqueTag = props.originalData['labels'][i];
              var snippet = <div></div>;
              let colorTagRelev = "";
              let colorTagIrrelev="";
              let colorTagNeutral="";
              //let uniqueTag="";
              //uniqueTag = (Object.keys(this.pages[k]["tags"]).length===1) ? (this.pages[k]["tags"]).toString():(this.pages[k]["tags"][Object.keys(this.pages[k]["tags"]).length-1]).toString();
              colorTagRelev=(uniqueTag==='Relevant')?"#4682B4":"silver";
              colorTagIrrelev=(uniqueTag==='Irrelevant')?"#CD5C5C":"silver";
              colorTagNeutral=(uniqueTag==='Neutral')?'silver':"silver";
              if(image!==""){
                 snippet = <div style={{  width:'440px', minHeight: '60px',  borderColor:"silver", marginLeft: '8px', marginTop: '5px',}}>
                                <div>
                                  <p style={{float:'left'}}><img src={image} alt="HTML5 Icon" style={{width:'60px',height:'60px', marginRight:'3px'}}/></p>
                                  <p style={{float:'right'}}>
                                  <ButtonGroup bsSize="small">
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Relevant</Tooltip>}>
                                      <Button id={"Relevant-"+i} value={uniqueTag} onClick={this.onTagActionClicked.bind(this)}  style={{backgroundColor:colorTagRelev}} >Rel</Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Irrelevant</Tooltip>}>
                                      <Button id={"Irrelevant-" +i} value={uniqueTag} onClick={this.onTagActionClicked.bind(this)} style={{backgroundColor:colorTagIrrelev}} >Irr</Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Neutral</Tooltip>}>
                                      <Button id={"Neutral-"+ i} value={uniqueTag} onClick={this.onTagActionClicked.bind(this)}  style={{backgroundColor:colorTagNeutral}} >Neu</Button>
                                    </OverlayTrigger>
                                  </ButtonGroup></p>
                                  <p><a target="_blank" href={url} style={{ color:'blue'}} >{title}</a> <br/><a target="_blank" href={url} style={{fontSize:'11px'}}>{url}</a></p>
                                </div>

                                <br/>
                                <div style={{marginTop:'-3px'}}> <p>{description}</p>
                                </div><Divider />
                              </div>;
              }
              else{
                 snippet = <div style={{ width:'440px',  borderColor:"silver", marginLeft: '8px',marginTop: '5px',}}>
                                <p style={{color:'blue'}}>{title}</p>
                                <p style={{float:'right'}}>
                                <ButtonGroup bsSize="small">
                                  <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Relevant</Tooltip>}>
                                    <Button id={"Relevant-"+i} value={uniqueTag} onClick={this.onTagActionClicked.bind(this)}  style={{backgroundColor:colorTagRelev}} >Rel</Button>
                                  </OverlayTrigger>
                                  <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Irrelevant</Tooltip>}>
                                    <Button id={"Irrelevant-" +i} value={uniqueTag} onClick={this.onTagActionClicked.bind(this)}  style={{backgroundColor:colorTagIrrelev}} >Irr</Button>
                                  </OverlayTrigger>
                                  <OverlayTrigger placement="bottom" overlay={<Tooltip id="tooltip">Neutral</Tooltip>}>
                                    <Button id={"Neutral-"+ i} value={uniqueTag} onClick={this.onTagActionClicked.bind(this)}  style={{backgroundColor:colorTagNeutral}} >Neu</Button>
                                  </OverlayTrigger>
                                </ButtonGroup></p>
                                  <p>
                                    <a target="_blank" href={props.originalData['urls'][i]} style={{fontSize:'10px'}}>{props.originalData['urls'][i]}</a>
                                  </p>
                                <p>{description}</p>
                                <Divider />
                              </div>;
              }
              snippets.push(snippet);
              this.setState({snippets:snippets, selectedPoints:this.props.selectedPoints});

        }
        catch(err) {
          console.log(err);
        }
      }
    }
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
