
var DFA = (function() {

function DFA() {
    Automaton.call(this);

    this.getStateTargetForSymbol = getStateTargetForSymbol;
    this.toString = toString;
    this._runValidations = runValidations;
    this._processWord = processWord;
    this._validateStateTransitions = validateStateTransitions;
    this._checkTransitionForEachSymbolInAlphabet = checkTransitionForEachSymbolInAlphabet;
    this._checkSymbolDuplication = checkSymbolDuplication;
}

DFA.prototype = Object.create(Automaton.prototype);
DFA.prototype.constructor = DFA;

function getStateTargetForSymbol(internalName, symbol) {
    let state = null;
    let transitions = [];

    state = this._getStateByInternalName(internalName);
    transitions = this._getTransitionsBySymbol(state, symbol);

    if(!transitions.length) return '';
    return transitions[0].getTarget().getInternalName();
}

function processWord(word) {
    this._currentState = this.getInitialState();
    let nextState = null;
    let transitions;

    for(symbol in word) {
        nextState = null;
        transitions = this._currentState._getTransitions();
        for(transition in transitions) {
            if(transitions[transition].getSymbol() === word[symbol]) {
                nextState = transitions[transition].getTarget();
                break;
            }
        }
        if(!nextState) return {valid: false, msg: 'The inserted word is not accepted.'};
        this._currentState = nextState;
    }

    if(this._currentState.isFinal()) return {valid: true, msg: 'Word accepted!'};
    return {valid: false, msg: 'The inserted word is not accepted.'};
}

function runValidations(word) {
    let status = this._validateWord(word);
    if(!status.valid) return status;

    status = this._validateStateTransitions();
    if(!status.valid) return status;

    return this._checkInitialState();
}

function validateStateTransitions() {
    let states = this.getStates();
    let status;

    for(let state in states) {
        let transitions = states[state]._getTransitions();
        let symbols = this._getTransitionSymbols(transitions);

        status = this._checkSymbolDuplication(symbols);
        if(!status.valid) {
            status.msg = 'The state ' + states[state].getName() + ' has more than one transition for the symbol ' + status.msg;
            return status;
        }

        status = this._checkTransitionsValidity(symbols);
        if(!status.valid) {
            status.msg = 'The state ' + states[state].getName() + ' has a transition with the symbol ' + status.msg + ' which is not supported by the alphabet.';
            return status;
        }
    }

    return {valid: true};
}

function checkTransitionForEachSymbolInAlphabet(symbols) {
    for(let symbol in this._alphabet) {
        if(!symbols.includes(this._alphabet[symbol])) return {valid: false, msg: this._alphabet[symbol]};
    }

    return {valid: true};
}

function checkSymbolDuplication(symbols) {
    for(let i = 0; i < symbols.length - 1; i++) {
        for(let x = i + 1; x < symbols.length; x++) {
            if(symbols[i] === symbols[x]) return {valid: false, msg: symbols[i]};
        }
    }

    return {valid: true};
}

function toString() {
    return 'DFA';
}

return DFA;

})();