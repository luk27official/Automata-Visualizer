
function Automaton() {
    this._counter = 0;
    this._alphabet = [];
    this._states = [];
    this._initialState = null;
    this._currentState = null;

    //Private
    this._buildStates = buildStates;
    this._buildTransitions = buildTransitions;
}

//Public
Automaton.prototype.run = run;
Automaton.prototype.insertState = insertState;
Automaton.prototype.removeState = removeState;
Automaton.prototype.updateStateName = updateStateName;
Automaton.prototype.updateStateType = updateStateType;
Automaton.prototype.getCounter = getCounter;
Automaton.prototype.getState = getState;
Automaton.prototype.getStateByName = getStateByName;
Automaton.prototype.getStates = getStates;
Automaton.prototype.getInitialState = getInitialState;
Automaton.prototype.buildFromJSON = buildFromJSON;
Automaton.prototype.toJSON = toJSON;
Automaton.prototype.clone = clone;
Automaton.prototype.minimize = minimize;
Automaton.prototype.resetStateInternalNames = resetStateInternalNames;

//Protected
Automaton.prototype._checkInitialState = checkInitialState;
Automaton.prototype._checkTransitionsValidity = checkTransitionsValidity;
Automaton.prototype._getTransitionSymbols = getTransitionSymbols;
Automaton.prototype._getStateByInternalName = getStateByInternalName;
Automaton.prototype._getTransitionsBySymbol = getTransitionsBySymbol;
Automaton.prototype._validateWord = validateWord;
Automaton.prototype._runNextCloningIteration = runNextCloningIteration;
Automaton.prototype._checkIfNewStateIsMe = checkIfNewStateIsMe;
Automaton.prototype._checkIfNewStateAlreadyExists = checkIfNewStateAlreadyExists;
Automaton.prototype._getTargetsForCloning = getTargetsForCloning;
Automaton.prototype._createState = createState;

function run(word) {
    let status = this._runValidations(word);
    if(!status.valid) return status;

    return this._processWord(word);
}

function insertState(id) {
    let state = new State('q' + this._counter, id);
    
    this._states.push(state);
    this._counter++;
}

function removeState(name) {
    let state = null;

    for(let i = 0; i < this._states.length; i++) {
        if(this._states[i].getName() === name) {
            state = this._states[i];
            this._states.splice(i, 1);
            break;
        }
    }

    if(state.isInitial()) this._initialState = null;
}

function updateStateName(state, name) {
    state.setName(name);
}

function updateStateType(state, type, removeInitialSymbol) {
    let appearance = {};

    if(type.initial) {
        for(let state in this._states) {
            if(this._states[state].isInitial()) {
                this._states[state].setBehavior({initial: false});
                removeInitialSymbol();
                break;
            }
        }
        this._initialState = state;
    }

    appearance = state.setBehavior(type);
}

function checkInitialState() {
    if(!this._initialState || !this._initialState.isInitial()) return {valid: false, msg: 'No initial state has been set.'};
    return {valid: true, msg: 'Valid'};
}

function checkTransitionsValidity(symbols) {
    for(let symbol in symbols) {
        if(!this._alphabet.includes(symbols[symbol])) return {valid: false, msg: symbols[symbol]};
    }

    return {valid: true};
}

function getTransitionSymbols(transitions) {
    let symbols = [];

    for(let transition in transitions) {
        symbols.push(transitions[transition].getSymbol());
    }

    return symbols;
}

function getState(id) {
    for(let state in this._states) {
        if(this._states[state].getId() === id)
            return this._states[state];
    }

    return null;
}

function getStateByName(name) {
    for(let state in this._states) {
        if(this._states[state].getName() === name)
            return this._states[state];
    }

    return null;
}

function getStates() {
    return this._states;
}

function getCounter() {
    return this._counter;
}

function getInitialState() {
    return this._initialState;
}

function getStateByInternalName(name) {
    for(let state in this._states) {
        if(this._states[state].getInternalName() === name)
            return this._states[state];
    }

    return null;
}

function getTransitionsBySymbol(state, symbol) {
    let transitions = state._getTransitions();
    let response = [];

    for(let transition in transitions) {
        if(transitions[transition].getSymbol() !== symbol) continue;
        response.push(transitions[transition]);
    }

    return response;
}

function buildFromJSON(data) {
    let states = data.states;

    this._buildStates(states);
    this._buildTransitions(states);
}

function buildStates(states) {
    let newState = null;

    for(let state in states) {
        newState = new State(states[state].name, states[state].id);
        newState.setBehavior({initial: states[state].initial, final: states[state].final});
        newState.setInternalName(states[state].internalName);
        
        this._states.push(newState);
        this._counter++;
        newState = null;
    }

    //this._initialState = this._states[0];
    for(let state in this._states) {
        if(!this._states[state].isInitial()) continue;
        this._initialState = this._states[state];
        break;
    }
}

function buildTransitions(states) {
    let edge = null;

    for(let i = 0; i < this._states.length; i++) {
        for(let transition in states[i].transitions) {
            edge = states[i].transitions[transition];
            this._states[i].addTransition(this._getStateByInternalName(edge.target), edge.symbol, edge.id);
        }
    }
}

function validateWord(word) {
    for(let symbol in word) {
        if(!this._alphabet.includes(word[symbol])) return {valid: false, msg: 'The inserted word has the symbol ' + word[symbol] + ' which is not supported by the alphabet.'};
    }

    return {valid: true};
}

function toJSON(states) {
    let jsonStates = [];
    let json = {};
    let transitions = [];
    let edge = {};

    states = !states ? this._states : states;

    for(let state in states) {
        json.name = states[state].getName();
        json.internalName = states[state].getInternalName();
        json.initial = states[state].isInitial();
        json.final = states[state].isFinal();
        json.id = states[state].getId();

        transitions = states[state]._getTransitions();
        json.transitions = [];
        for(let transition in transitions) {
            edge.source = transitions[transition].getSource().getInternalName();
            edge.target = transitions[transition].getTarget().getInternalName();
            edge.symbol = transitions[transition].getSymbol();
            edge.id = transitions[transition].getId();
            json.transitions.push(edge);
            edge = {};
        }

        jsonStates.push(json);
        json = {};
    }

    return {
        states: jsonStates
    };
}

function clone() {
    let status = this._checkInitialState();
    if(!status.valid) return null;

    let automaton = chooseRightAutomaton(this);
    let initialState = this.getInitialState();
    let currentState = new State(initialState.getName(), initialState.getId());
    currentState.setInternalName(initialState.getInternalName());
    currentState.setBehavior({initial: true, final: initialState.isFinal()});
    let newStates = [currentState];
    let pendingStates = [];

    this._runNextCloningIteration(newStates, pendingStates, currentState);
    for(let i = 0; i < pendingStates.length; i++) {
        this._runNextCloningIteration(newStates, pendingStates, pendingStates[i]);
    }

    automaton._counter = newStates.length;
    automaton._states = newStates;
    automaton._initialState = newStates[0];

    return automaton;
}

function chooseRightAutomaton(automaton) {
    if(automaton instanceof DFA) return new DFA();
    if(automaton instanceof NFAE) return new NFAE();
    if(automaton instanceof NFA) return new NFA();
}

function runNextCloningIteration(newStates, pendingStates, currentState) {
    let states = this._getTargetsForCloning(currentState.getInternalName());

    for(let state in states) {
        if(this._checkIfNewStateIsMe(currentState, states[state])) continue;
        if(this._checkIfNewStateAlreadyExists(newStates, states[state], currentState)) continue;
        this._createState(states[state], pendingStates, currentState, newStates);
    }
}

function getTargetsForCloning(currentStateInternalName) {
    let transitions = this._getStateByInternalName(currentStateInternalName)._getTransitions();
    let newState = [];
    let target = null;
    let transitionId = 0;
    let symbol = '';

    for(let transition in transitions) {
        target = transitions[transition].getTarget();
        transitionId = transitions[transition].getId();
        symbol = transitions[transition].getSymbol();
        newState.push({target: target, transitionId: transitionId, transitionSymbol: symbol});
    }

    return newState;
}

function checkIfNewStateIsMe(currentState, state) {
    if(currentState.getInternalName() === state.target.getInternalName()) {
         currentState.addTransition(currentState, state.transitionSymbol, state.transitionId);
         return true;
    }

    return false;
}

function checkIfNewStateAlreadyExists(newStates, newState, currentState) {
    let internalName = '';
    
    for(let state in newStates) {
        internalName = newStates[state].getInternalName();

        if(internalName === newState.target.getInternalName()) {
            currentState.addTransition(newStates[state], newState.transitionSymbol, newState.transitionId);
            return true;
        }
    }

    return false;
}

function createState(state, pendingStates, currentState, newStates) {
    let newState = null;
    
    newState = new State(state.target.getName(), state.target.getId());
    newState.setInternalName(state.target.getInternalName());
    newState.setBehavior({final: state.target.isFinal()});
    currentState.addTransition(newState, state.transitionSymbol, state.transitionId);
    newStates.push(newState);
    pendingStates.push(newState);
}

function minimize() {
    let dfa = null;
    let clone = this.clone();
    if(!clone) return null;
    clone.resetStateInternalNames();

    if((clone instanceof DFA)) return Minimize(clone, this._alphabet);
    else {
        dfa = clone.convertToDFA();
        return Minimize(dfa, this._alphabet);
    }
}

function resetStateInternalNames() {
    let states = this.getStates();
    this._counter = 0;

    for(let state in states) {
        //states[state].setName('q' + this._counter);
        states[state].setInternalName('q' + this._counter++);
    }
}