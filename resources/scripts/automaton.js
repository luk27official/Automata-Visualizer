
var Automaton = joint.dia.Graph.extend({
    alphabet: [],
    finalStates: [],
    initialState: null,
    currentState: null,
    counter: 0,
    insertState: insertState,
    removeState: removeState,
    updateStateName: updateStateName,
    updateStateType: updateStateType
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
    // let states = this.getElements();
    // for(let state in states) {
    //     if(states[state].id === state.id) continue;
    //     if(states[state].getName() === name) return 0;
    // }

    state.setName(name);
    //return 1;
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