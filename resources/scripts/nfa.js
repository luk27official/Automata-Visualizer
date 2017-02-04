
var NFA = (function () {

function NFA() {
    Automaton.call(this);

    this.run = run;
    this.convertToDFA = convertToDFA;
    this._runValidations = runValidations;
    this._validateWord = validateWord;
    this._processWord = processWord;
    this._convert = convert;
    this._runPass = runPass;
}

NFA.prototype = Object.create(Automaton.prototype);
NFA.prototype.constructor = NFA;

function run(word) {
    let status = this._runValidations(word);
    if(!status.valid) return status;

    return this._processWord(word);
}

function convertToDFA() {
    let status = this._checkInitialState();
    if(!status.valid) return status;

    return this._convert();
}

function convert() {
    let initialState = this.getInitialState();
    let currentState = new State(initialState.getInternalName(), 0);
    //currentState.setInternalName(initialState.getInternalName());
    let newStates = [currentState];
    let pendingStates = [];

    this._runPass(newStates, pendingStates, currentState);
    for(let i = 0; i < pendingStates.length; i++) {
        this._runPass(newStates, pendingStates, pendingStates[i]);
    }
    // for(let state in pendingStates) {
    //     this._runPass(newStates, pendingStates, pendingStates[state]);
    // }

    console.log(newStates);
}

function runPass(newStates, pendingStates, currentState) {
    let names = currentState.getInternalName();
    let state = null;
    let newState = null;
    let transitions = [];
    let newStateName = [];
    let newStateExists = false;
    let constructedInternalName = '';

    names = names.split(',');

    for(let symbol in this._alphabet) {
        newStateExists = false;

        for(let name in names) {
            state = this._getStateByInternalName(names[name]);
            transitions = this._getTransitionsBySymbol(state, this._alphabet[symbol]);
            for(let transition in transitions) {
                newStateName.push(transitions[transition].getTarget().getInternalName());
            }
        }

        constructedInternalName = newStateName.join();
        
        if(!constructedInternalName) continue;
        if(currentState.getInternalName() === constructedInternalName) {
            currentState.addTransition(currentState, this._alphabet[symbol], 0);
            newStateName = [];
            continue;
        }

        for(let state in newStates) {
            if(newStates[state].getInternalName() !== constructedInternalName) continue;
            currentState.addTransition(newStates[state], this._alphabet[symbol], 0);
            newStateName = [];
            newStateExists = true;
        }

        if(newStateExists) continue
        
        newState = new State(constructedInternalName, 0);
        //newState.setInternalName(constructedInternalName);
        currentState.addTransition(newState, this._alphabet[symbol], 0);
        newStates.push(newState);
        pendingStates.push(newState);

        newStateName = [];
    }
}

function processWord(word) {
    let currentStates = [this.getInitialState()];
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