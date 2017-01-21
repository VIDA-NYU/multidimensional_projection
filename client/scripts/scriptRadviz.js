//scriptRadviz.js #main function called from R shiny

var onRadvizpoints = function(res){
  console.log("onRadvizpoints");
    __sig__.emit(__sig__.radviz_points_fetched, res);
};

var scriptRadviz = function(){
  console.log("scriptRadviz");
};

scriptRadviz.prototype.getRadvizPoints = function(){
    console.log("getRadvizPoints");
    runQuery('/getRadvizPoints',{}, onRadvizpoints)
};

scriptRadviz.prototype.initSignalSlotsRadviz = function(vis){
    console.log("initSignalSlotsRadviz");
    SigSlots.connect(__sig__.radviz_points_fetched, this, this.renderRadviz);

};

scriptRadviz.prototype.renderRadviz = function(res){
  console.log("renderRadvizz");
    var info = JSON.parse(res);
    console.log(info);

    if (!info){
        return;
    }
    var el = d3.select('#myRadvizCanvas').node();
    var radviz = new Radviz(info);


    if (window.radInterface) {
        window.radInterface.destroy();
    }

    window.radInterface = new RadvizInterface(radviz,new RadvizViews(el, {diameter: 800, circleOffset: 40}));
    window.radInterface.drawPoints();
};

scriptRadviz.start = function(){
    console.log("start");
    vis = new scriptRadviz()
    vis.initSignalSlotsRadviz(vis);
    vis.getRadvizPoints();
    return vis
};


// Runs async post query.
var runQuery = function(query, args, onCompletion, doneCb) {
    console.log("runQuery");
    $.post(
	query,
	args,
	onCompletion)
	.done(doneCb);
};
