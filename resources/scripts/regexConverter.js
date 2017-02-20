
var regexConverter = (function() {

    let counter = 0;

function convertToNFAE(regex) {
    let output = Parser.parse(regex);
    let automaton = buildNFAE(output);
    counter =  0;

    automaton.getStates()[0].setBehavior({initial: true});
    automaton.getStates()[automaton.getStates().length-1].setBehavior({final: true});
    console.log(output);
    console.log(automaton);
    return automaton;
}

function buildNFAE(regex) {
    let left = right = expression = null;

    if(regex.hasOwnProperty('left')) {
        left = buildNFAE(regex.left);
    }

    if(regex.hasOwnProperty('right')) {
        right = buildNFAE(regex.right);
    }

    if(regex.hasOwnProperty('expression')) {
        expression = buildNFAE(regex.expression);
    }

    switch(regex.name) {
        case 'character':
            return buildSimpleAutomaton(regex.value);

        case 'pipe':
            return buildUnionAutomaton(left, right);

        case 'concat':
            return buildConcatAutomaton(left, right);

        case 'kleene':
            return buildKleeneAutomaton(expression);
    }
}

function buildSimpleAutomaton(value) {
    let automaton = new Automaton();
    let initialState = new State('q' + counter++, 0);
    let lastState = new State('q' + counter++, 0);
    let states = automaton.getStates();

    states.push(initialState);
    states.push(lastState);
    states[0].addTransition(states[1], value, 0);

    return automaton;
}

function buildUnionAutomaton(left, right) {
    let automaton = new Automaton();
    let initialState = new State('q' + counter++, 0);
    let lastState = new State('q' + counter++, 0);
    let statesLeft = left.getStates();
    let statesRight = right.getStates();

    automaton._states = statesLeft.concat(statesRight);
    initialState.addTransition(statesLeft[0], 'E', 0);
    initialState.addTransition(statesRight[0], 'E', 0);
    automaton.getStates().unshift(initialState);
    automaton.getStates().push(lastState);
    statesLeft[statesLeft.length-1].addTransition(lastState, 'E', 0);
    statesRight[statesRight.length-1].addTransition(lastState, 'E', 0);

    return automaton;
}

function buildConcatAutomaton(left, right) {
    let automaton = new Automaton();

    automaton._states = left.getStates().concat(right.getStates());
    left.getStates()[left.getStates().length-1].addTransition(right.getStates()[0], 'E', 0);
    return automaton;
}

function buildKleeneAutomaton(expression) {
    let initialState = new State('q' + counter++, 0);
    let lastState = new State('q' + counter++, 0);
    let states = expression.getStates();

    initialState.addTransition(states[0], 'E', 0);
    initialState.addTransition(lastState, 'E', 0);
    states[states.length-1].addTransition(lastState, 'E', 0);
    states[states.length-1].addTransition(states[0], 'E', 0);
    states.unshift(initialState);
    states.push(lastState);

    return expression;
}

return {
    convertToNFAE: convertToNFAE
}

})();