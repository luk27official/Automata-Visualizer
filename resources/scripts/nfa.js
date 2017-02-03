
var NFA = (function () {

function NFA() {
    Automaton.call(this);

    this.run = run;
    this._runValidations = runValidations;
    this._validateWord = validateWord;
    this._processWord = processWord;
}

NFA.prototype = Object.create(Automaton.prototype);
NFA.prototype.constructor = NFA;

function run(word) {
    let status = this._runValidations(word);
    if(!status.valid) return status;

    return this._processWord(word);
}

function processWord(word) {
    let currentStates = [this._initialState];
    let nextStates = [];
    let transitions = [];

    for(let symbol in word) {
        for(state in currentStates) {
            transitions = currentStates[state]._getTransitions();
            for(let transition in transitions) {
                if(transitions[transition].getSymbol() !== word[symbol]) continue;
                nextStates.push(transitions[transition].getTarget());
            }
        }

        currentStates = nextStates;
        nextStates = [];
    }

    for(let state in currentStates) {
        if(currentStates[state].isFinal()) return {valid: true, msg: 'Valid!!'};
    }

    return {valid: false, msg: 'Word not accepted!!'};
}

function runValidations(word) {
    let status = this._validateWord(word);
    if(!status.valid) return status;

    return this._checkInitialState();
}

function validateWord(word) {
    for(let symbol in word) {
        if(!this._alphabet.includes(word[symbol])) return {valid: false, msg: 'The inserted word has the symbol ' + word[symbol] + ' which is not supported by the alphabet.'};
    }

    return {valid: true};
}

return NFA;

})();