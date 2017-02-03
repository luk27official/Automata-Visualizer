
function Automaton() {
    this._counter = 0;
    this._alphabet = [];
    this._states = [];
    this._initialState = null;
    this._currentState = null;
}

Automaton.prototype.insertState = insertState;
Automaton.prototype.removeState = removeState;
Automaton.prototype.updateStateName = updateStateName;
Automaton.prototype.updateStateType = updateStateType;
Automaton.prototype.getCounter = getCounter;
Automaton.prototype.getState = getState;
Automaton.prototype.getStates = getStates;

Automaton.prototype._checkInitialState = checkInitialState;
Automaton.prototype._checkTransitionsValidity = checkTransitionsValidity;
Automaton.prototype._getTransitionSymbols = getTransitionSymbols;

function insertState() {
    let state = new State('q' + this._counter);
    
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
    if(this.getState(name)) return {valid: false, msg: 'A state with that name already exists!'};

    state.setName(name);
    return {valid: true};
}

function updateStateType(state, type, updateAppearance) {
    let appearance = {};

    if(type.initial) {
        for(let state in this._states) {
            if(this._states[state].isInitial()) {
                appearance = this._states[state].setBehavior({initial: false});
                updateAppearance(appearance);
                break;
            }
        }
        this._initialState = state;
    }

    appearance = state.setBehavior(type);
    updateAppearance(appearance);
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

function getState(name) {
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