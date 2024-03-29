//SortAllDGs.js

function SortAllDGs(callbackSolution){

    this.callbackSolution = callbackSolution;
}

SortAllDGs.prototype.setCallbackSolution = function(callbackSolution){
    this.callbackSolution = callbackSolution;
};

SortAllDGs.prototype.solveSortAllDGs = function(dgs, idsDAs, scale, translate){
  console.log("sigmoid: scale: " + scale + ", translate: " + translate);
    Shiny.onInputChange("SortAllDGs", {dgs:dgs, idsDAs:idsDAs, sigmoidScale: scale, sigmoidTranslate:translate});
};
