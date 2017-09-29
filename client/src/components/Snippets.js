import React, {Component} from 'react';
import Divider from 'material-ui/Divider';
import { ButtonGroup, Button, OverlayTrigger, Tooltip} from 'react-bootstrap';
import $ from 'jquery';
import RelevantFace from 'material-ui/svg-icons/action/thumb-up';
import IrrelevantFace from 'material-ui/svg-icons/action/thumb-down';
import NeutralFace from 'material-ui/svg-icons/action/thumbs-up-down';
import IconButton from 'material-ui/IconButton';


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
  onTagActionClicked(tag,url,previus_tag){
    //i.props.originalData['labels'][url];
    var previus_tags = previus_tag ;
  //  var idButton = (event.target.id).split('-')
    var new_tag = tag;
    var index_urls = url;
    var urls=[];
    this.props.tagFromSnippets(new_tag, previus_tags, index_urls );
  }

  showingSnippets(props){
    let snippets = [];
    this.setState({snippets:undefined});
    for (let i = 0; i < props.originalData['urls'].length; ++i){
      if(props.selectedPoints[i]){
        var title='', description='';
        try {
  	          var title= props.originalData['title'][i];
              var description= props.originalData['snippet'][i];
              var image= props.originalData['image_url'][i];
              var url = props.originalData['urls'][i];
              var uniqueTag = props.originalData['labels'][i];
              var snippet = <div></div>;
              let colorTagRelev = '';
              let colorTagIrrelev='';
              let colorTagNeutral='';
              //let uniqueTag='';
              //uniqueTag = (Object.keys(this.pages[k]['tags']).length===1) ? (this.pages[k]['tags']).toString():(this.pages[k]['tags'][Object.keys(this.pages[k]['tags']).length-1]).toString();
              colorTagRelev=(uniqueTag==='Relevant')?'#4682B4':'silver';
              colorTagIrrelev=(uniqueTag==='Irrelevant')?'#CD5C5C':'silver';
              colorTagNeutral=(uniqueTag==='Neutral')?'silver':'silver';
              if(image!==''){
                 snippet = <div style={{  width:'440px', minHeight: '60px',  borderColor:'silver', marginLeft: '8px', marginTop: '5px',}}>
                                <div>
                                  <p style={{float:'left'}}><img src={image} alt='HTML5 Icon' style={{width:'60px',height:'60px', marginRight:'3px'}}/></p>
                                  <p style={{float:'right'}}>
                                  <ButtonGroup bsSize='small'>
                                    <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Relevant</Tooltip>}>
                                      <Button id={'Relevant-'+i}>
                                         <IconButton onTouchTap={this.onTagActionClicked.bind(this,'Relevant',url,uniqueTag)} iconStyle={{width:25,height: 25,marginBottom:'-9px', color:colorTagRelev }} style={{height: 8, margin: '-10px', padding:0,}}><RelevantFace /></IconButton>
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Irrelevant</Tooltip>}>
                                      <Button id={'Irrelevant-'+i}>
                                        <IconButton onTouchTap={this.onTagActionClicked.bind(this,'Irrelevant',url,uniqueTag)} iconStyle={{width:25,height: 25,marginBottom:'-9px',color:colorTagIrrelev  }} style={{height: 8, margin: '-10px', padding:0}}><IrrelevantFace /></IconButton>
                                      </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Neutral</Tooltip>}>
                                      <Button id={'Neutral-'+i}>
                                        <IconButton onTouchTap={this.onTagActionClicked.bind(this,'Neutral',url,uniqueTag)} iconStyle={{width:25,height: 25,marginBottom:'-9px', color:colorTagNeutral }} style={{height: 8, margin: '-10px', padding:0,}}><NeutralFace /></IconButton>
                                      </Button>
                                    </OverlayTrigger>
                                  </ButtonGroup></p>
                                  <p><a target='_blank' href={url} style={{ color:'blue'}} >{title}</a> <br/><a target='_blank' href={url} style={{fontSize:'11px'}}>{url}</a></p>
                                </div>

                                <br/>
                                <div style={{marginTop:'-3px'}}> <p>{description}</p>
                                </div><Divider />
                              </div>;
              }
              else{
                 snippet = <div style={{ width:'440px',  borderColor:'silver', marginLeft: '8px',marginTop: '5px',}}>
                                <p style={{color:'blue'}}>{title}</p>
                                <p style={{float:'right'}}>
                                <ButtonGroup bsSize='small'>
                                  <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Relevant</Tooltip>}>
                                    <Button id={'Relevant-'+i}>
                                       <IconButton onTouchTap={this.onTagActionClicked.bind(this,'Relevant',url,uniqueTag)} iconStyle={{width:25,height: 25,marginBottom:'-9px', color:colorTagRelev }} style={{height: 8, margin: '-10px', padding:0,}}><RelevantFace /></IconButton>
                                    </Button>
                                  </OverlayTrigger>
                                  <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Irrelevant</Tooltip>}>
                                    <Button id={'Irrelevant-'+i}>
                                      <IconButton onTouchTap={this.onTagActionClicked.bind(this,'Irrelevant',url,uniqueTag)} iconStyle={{width:25,height: 25,marginBottom:'-9px',color:colorTagIrrelev  }} style={{height: 8, margin: '-10px', padding:0}}><IrrelevantFace /></IconButton>
                                    </Button>
                                  </OverlayTrigger>
                                  <OverlayTrigger placement='bottom' overlay={<Tooltip id='tooltip'>Neutral</Tooltip>}>
                                    <Button id={'Neutral-'+i}>
                                      <IconButton onTouchTap={this.onTagActionClicked.bind(this,'Neutral',url,uniqueTag)} iconStyle={{width:25,height: 25,marginBottom:'-9px', color:colorTagNeutral}} style={{height: 8, margin: '-10px', padding:0,}}><NeutralFace /></IconButton>
                                    </Button>
                                  </OverlayTrigger>
                                </ButtonGroup>
                              </p>
                                  <p>
                                    <a target='_blank' href={props.originalData['urls'][i]} style={{fontSize:'10px'}}>{props.originalData['urls'][i]}</a>
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
