
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
    this._getTargetNamesForNewState = getTargetNamesForNewState;
    this._checkIfNewStateIsCurrentState = checkIfNewStateIsCurrentState;
    this._checkIfNewStateExists = checkIfNewStateExists;
    this._createDFAState = createDFAState;
    this._toJSON = toJSON;
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
    let currentState = new State('{' + initialState.getName() + '}', 0);
    currentState.setInternalName(initialState.getInternalName());
    currentState.setBehavior({initial: true});
    let newStates = [currentState];
    let pendingStates = [];

    this._runPass(newStates, pendingStates, currentState);
    for(let i = 0; i < pendingStates.length; i++) {
        this._runPass(newStates, pendingStates, pendingStates[i]);
    }

    console.log(newStates);
    return this._toJSON(newStates);
}

function runPass(newStates, pendingStates, currentState) {
    let names = currentState.getInternalName();
    let newStateName = [];
    let constructedInternalName = '';

    names = names.split(',');

    for(let symbol in this._alphabet) {
        newStateName = this._getTargetNamesForNewState(names, this._alphabet[symbol]);
        constructedInternalName = newStateName.join();
        
        if(!constructedInternalName) continue;
        if(checkIfNewStateIsCurrentState(currentState, constructedInternalName, this._alphabet[symbol])) continue;
        if(checkIfNewStateExists(newStates, constructedInternalName, currentState, this._alphabet[symbol])) continue;

        this._createDFAState(newStateName, constructedInternalName, pendingStates, this._alphabet[symbol], currentState, newStates);
    }
}

function getTargetNamesForNewState(names, symbol) {
    let state = null;
    let transitions = [];
    let newStateName = [];
    let targetInternalName = '';
    let exists = false;

    for(let name in names) {
        state = this._getStateByInternalName(names[name]);
        transitions = this._getTransitionsBySymbol(state, symbol);
        for(let transition in transitions) {
            exists = false;
            targetInternalName = transitions[transition].getTarget().getInternalName();
            for(let internalName in newStateName) {
                if(newStateName[internalName] === targetInternalName) {
                    exists = true;
                    break;
                }                
            }
            
            if(exists) continue;
            newStateName.push(targetInternalName);
        }
    }

    return newStateName;
}

function checkIfNewStateIsCurrentState(currentState, constructedInternalName, symbol) {
    let internalName = currentState.getInternalName().split(',');
    let constructedName = constructedInternalName.split(',');
    let counterCheck = 0;

    if(internalName.length !== constructedName.length) return false;

    for(let i = 0; i < constructedName.length; i++) {
        for(let name in internalName) {
            if(constructedName[i] === internalName[name]) {
                counterCheck++;
                break;
            }
        }
    }

    if(counterCheck >= constructedName.length) {
         currentState.addTransition(currentState, symbol, 0);
        return true;
    }

    return false;
}

function checkIfNewStateExists(newStates, constructedInternalName, currentState, symbol) {
    let internalName = '';
    let constructedName = constructedInternalName.split(',');
    let counterCheck = 0;

    for(let state in newStates) {
        internalName = newStates[state].getInternalName().split(',');
        if(internalName.length !== constructedName.length) continue;

        for(let i = 0; i < constructedName.length; i++) {
            for(let name in internalName) {
                if(constructedName[i] === internalName[name]) {
                    counterCheck++;
                    break;
                }
            }
        }

        if(counterCheck >= constructedName.length) {
            currentState.addTransition(newStates[state], symbol, 0);
            return true;
        }
        counterCheck = 0;
    }

    return false;
}

function createDFAState(newStateName, constructedInternalName, pendingStates, symbol, currentState, newStates) {
    let displayName = [];
    let newState = null;
    let final = false;
    let state = null;

    for(let name in newStateName) {
        state = this._getStateByInternalName(newStateName[name]);
        if(!final) final = state.isFinal();
        displayName.push(state.getName());
    }
    
    newState = new State('{' + displayName.join() + '}', 0);
    newState.setInternalName(constructedInternalName);
    newState.setBehavior({final: final});
    currentState.addTransition(newState, symbol, 0);
    newStates.push(newState);
    pendingStates.push(newState);
}

function toJSON(states) {
    let jsonStates = [];
    let json = {};
    let transitions = [];
    let edge = {};

    for(let state in states) {
        json.name = states[state].getName();
        json.internalName = states[state].getInternalName();
        json.initial = states[state].isInitial();
        json.final = states[state].isFinal();

        transitions = states[state]._getTransitions();
        json.transitions = [];
        for(let transition in transitions) {
            edge.source = transitions[transition].getSource().getInternalName();
            edge.target = transitions[transition].getTarget().getInternalName();
            edge.symbol = transitions[transition].getSymbol();
            json.transitions.push(edge);
            edge = {};
        }

        jsonStates.push(json);
        json = {};
    }

    return jsonStates;
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