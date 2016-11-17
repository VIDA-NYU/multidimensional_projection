function TSP(callbackSolution){

    this.callbackSolution = callbackSolution;
}

TSP.prototype.setCallbackSolution = function(callbackSolution){
    this.callbackSolution = callbackSolution;
};


TSP.prototype.solveTSPCities = function(cities, groupId, anglesUsed){
    //send data to R
    //remember in R code that cities is 0-based. index (cities +1)
    runQuery('/computeTSP',{},this.callbackSolution)
};


// Runs async post query.
var runQuery = function(query, args, onCompletion, doneCb) {
    $.post(
	query,
	args,
	onCompletion)
	.done(doneCb);
};
