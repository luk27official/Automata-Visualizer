
function DFA() {
    Automaton.call(this);

    this.run = run;
    this._runValidations = runValidations;
    this._processWord = processWord;
    this._validateWord = validateWord;
    this._validateStateTransitions = validateStateTransitions;
    this._checkTransitionForEachSymbolInAlphabet = checkTransitionForEachSymbolInAlphabet;
    this._checkSymbolDuplication = checkSymbolDuplication;
}

DFA.prototype = Object.create(Automaton.prototype);
DFA.prototype.constructor = DFA;

function run(word) {
    let status = this._runValidations(word);
    if(!status.valid) return status;

    return this._processWord(word);
}

function processWord(word) {
    this._currentState = this._initialState;
    let transitions;

    for(symbol in word) {
        transitions = this._currentState._getTransitions();
        for(transition in transitions) {
            if(transitions[transition].getSymbol() === word[symbol]) {
                this._currentState = transitions[transition].getTarget();
                break;
            }
        }
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

function validateWord(word) {
    for(let symbol in word) {
        if(!this._alphabet.includes(word[symbol])) return {valid: false, msg: 'The inserted word has the symbol ' + word[symbol] + ' which is not supported by the alphabet.'};
    }

    return {valid: true};
}

function validateStateTransitions() {
    let states = this.getStates();
    let status;

    for(let state in states) {
        let transitions = states[state]._getTransitions();
        let symbols = this._getTransitionSymbols(transitions);

        status = this._checkTransitionForEachSymbolInAlphabet(symbols);
        if(!status.valid) {
            status.msg = 'The state ' + states[state].getName() + ' lacks a transition for the symbol ' + status.msg;
            return status;
        }

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