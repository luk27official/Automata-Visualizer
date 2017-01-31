
var Automaton = joint.dia.Graph.extend({
    alphabet: [],
    finalStates: [],
    initialState: null,
    currentState: null,
    counter: 0,
    insertState: insertState,
    removeState: removeState,
    updateStateName: updateStateName,
    updateStateType: updateStateType,
    checkInitialState: checkInitialState,
    checkTransitionsValidity: checkTransitionsValidity
});

function insertState(options) {
    let state = new State(options);

    state.attr({
        text: {text: 'q' + this.counter}
    });
    
    this.addCell(state);
    this.counter++;
}

function removeState(state) {
    if(state.initial) this.initialState = null;
    else if(state.final) removeFinalState.call(this, state.id);
    state.remove();
}

function updateStateName(state, name) {
    state.setName(name);
}

function updateStateType(state, type) {
    if(type.initial) {
        let states = this.getElements();
        for(let state in states) {
            if(states[state].initial) {
                states[state].setBehavior({initial: false});
                break;
            }
        }
        this.initialState = state;
    }
    state.setBehavior(type);
}

function removeFinalState(id) {
    for(let i = this.finalStates.length - 1; i >= 0; i--) {
        if(this.finalStates[i].id === id) this.finalStates.splice(i, 1);
    }
}

function checkInitialState() {
    if(!this.initialState) return {valid: false, msg: 'No initial state has been set.'};
    return {valid: true, msg: 'Valid'};
}

function checkTransitionsValidity(symbols) {
    for(let symbol in symbols) {
        if(!this.alphabet.includes(symbols[symbol])) return {valid: false, msg: symbols[symbol]};
    }

    return {valid: true};
}