
var PDA = (function() {

function PDA() {
    Automaton.call(this);
    
    this._processWord = processWord;
    this._getEpsilonClosure = getEpsilonClosure;
    this._runValidations = runValidations;
}

PDA.prototype = Object.create(Automaton.prototype);
PDA.prototype.constructor = PDA;

function runValidations(word) {
    let status = this._validateWord(word);
    if(!status.valid) return status;

    return this._checkInitialState();
}

function processWord() {
    
}

})();