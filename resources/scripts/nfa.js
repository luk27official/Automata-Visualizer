
var NFA = Automaton.extend({
    run: run,
    _runValidations: _runValidations,
    _validateWord: _validateWord,
    _processWord: _processWord
});

function run(word) {
    let status = this._runValidations(word);
    if(!status.valid) return status;

    return this._processWord(word);
}

function _processWord(word) {
    let currentStates = [this.initialState];
    let nextStates = [];
    let transitions = [];

    for(let symbol in word) {
        for(state in currentStates) {
            transitions = this.getConnectedLinks(currentStates[state], {outbound: true});
            for(let transition in transitions) {
                if(this.getTransitionSymbol(transitions[transition]) !== word[symbol]) continue;
                nextStates.push(transitions[transition].getTargetElement());
            }
        }

        currentStates = nextStates;
        nextStates = [];
    }

    for(let state in currentStates) {
        if(currentStates[state].final) return {valid: true, msg: 'Valid!!'};
    }

    return {valid: false, msg: 'Word not accepted!!'};
}

function _runValidations(word) {
    let status = this._validateWord(word);
    if(!status.valid) return status;

    return this.checkInitialState();
}

function _validateWord(word) {
    for(let symbol in word) {
        if(!this.alphabet.includes(word[symbol])) return {valid: false, msg: 'The inserted word has the symbol ' + word[symbol] + ' which is not supported by the alphabet.'};
    }

    return {valid: true};
}