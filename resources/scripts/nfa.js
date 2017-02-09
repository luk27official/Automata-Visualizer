
var NFA = (function () {

function NFA() {
    Automaton.call(this);

    this.run = run;
    this.convertToDFA = convertToDFA;

    this._processWord = processWord;
    this._convert = convert;
    this._runPass = runPass;
    this._createDFAState = createDFAState;
}

NFA.prototype = Object.create(Automaton.prototype);
NFA.prototype._consumeSymbol = consumeSymbol;
NFA.prototype._isWordValid = isWordValid;
NFA.prototype._runValidations = runValidations;
NFA.prototype._getTargetNamesForNewState = getTargetNamesForNewState;
NFA.prototype._checkIfNewStateIsCurrentState = checkIfNewStateIsCurrentState;
NFA.prototype._checkIfNewStateExists = checkIfNewStateExists;
NFA.prototype.constructor = NFA;

function run(word) {
    let status = this._runValidations(word);
    if(!status.valid) return status;

    return this._processWord(word);
}

function processWord(word) {
    let currentStates = [this.getInitialState()];

    for(let symbol in word) {
        currentStates = this._consumeSymbol(currentStates, word[symbol]);
    }

    return this._isWordValid(currentStates);
}

function consumeSymbol(currentStates, symbol) {
    let nextStates = [];
    let transitions = [];

    for(state in currentStates) {
        transitions = currentStates[state]._getTransitions();
        for(let transition in transitions) {
            if(transitions[transition].getSymbol() !== symbol) continue;
            nextStates.push(transitions[transition].getTarget());
        }
    }

    return nextStates;
}

function isWordValid(currentStates) {
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

function convertToDFA() {
    let status = this._checkInitialState();
    if(!status.valid) return status;

    return this._convert();
}

function convert() {
    let initialState = this.getInitialState();
    let currentState = new State(initialState.getName(), 0);
    currentState.setInternalName(initialState.getInternalName());
    currentState.setBehavior({initial: true, final: initialState.isFinal()});
    let newStates = [currentState];
    let pendingStates = [];

    this._runPass(newStates, pendingStates, currentState);
    for(let i = 0; i < pendingStates.length; i++) {
        this._runPass(newStates, pendingStates, pendingStates[i]);
    }

    console.log(newStates);
    return this.toJSON(newStates);
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
        if(this._checkIfNewStateIsCurrentState(currentState, constructedInternalName, this._alphabet[symbol])) continue;
        if(this._checkIfNewStateExists(newStates, constructedInternalName, currentState, this._alphabet[symbol])) continue;

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
    
    newState = new State(displayName.join(), 0);
    newState.setInternalName(constructedInternalName);
    newState.setBehavior({final: final});
    currentState.addTransition(newState, symbol, 0);
    newStates.push(newState);
    pendingStates.push(newState);
}

return NFA;

})();