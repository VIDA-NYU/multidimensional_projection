//scriptRadviz.js #main function called from R shiny

var onRadvizpoints = function(res){
    __sig__.emit(__sig__.radviz_points_fetched, res);
};

var scriptRadviz = function(){
};

scriptRadviz.prototype.getRadvizPoints = function(){
    runQuery('/getRadvizPoints',{}, onRadvizpoints)
};

scriptRadviz.prototype.initSignalSlotsRadviz = function(vis){
    SigSlots.connect(__sig__.radviz_points_fetched, this, this.renderRadviz);
    
};

scriptRadviz.prototype.renderRadviz = function(res){

    var info = JSON.parse(res);
    for (var i = 0; i < info.length; i++) {
	info[res[i].id] = data.employees[i];
    }
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
    vis = new scriptRadviz()
    vis.initSignalSlotsRadviz(vis);
    vis.getRadvizPoints();
    return vis
};


// Runs async post query.
var runQuery = function(query, args, onCompletion, doneCb) {
    $.post(
	query,
	args,
	onCompletion)
	.done(doneCb);
};


