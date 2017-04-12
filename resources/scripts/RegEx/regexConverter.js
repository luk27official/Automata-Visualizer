
var regexConverter = (function() {

    let counter = 0;

function convertToNFAE(regex) {
    let newRegex = setupRegexFormat(regex);
    console.log(regex);
    console.log(newRegex);
    let output = Parser.parse(newRegex);
    let automaton = buildNFAE(output);
    counter =  0;

    automaton.getStates()[0].setBehavior({initial: true});
    automaton.getStates()[automaton.getStates().length-1].setBehavior({final: true});
    console.log(output);
    console.log(automaton);
    return automaton;
}

function setupRegexFormat(regex) {
    let newRegex = '';

    for(let i = 0; i < regex.length; i++) {
        newRegex = newRegex.concat(regex[i]);
        if(i === regex.length-1) break;
        if(checkRegexRules(regex[i], regex[i+1])) newRegex = newRegex.concat('.');
    }

    return newRegex;
}

function checkRegexRules(leftCharacter, rightCharacter) {
    if(leftCharacter === ')' && rightCharacter === '(') return true;
    if(leftCharacter === ')' && isASymbol(rightCharacter)) return true;
    if(leftCharacter === '*' && isASymbol(rightCharacter)) return true;
    if(leftCharacter === '*' && rightCharacter === '(') return true;
    if(isASymbol(leftCharacter) && rightCharacter === '(') return true;
    if(isASymbol(leftCharacter) && isASymbol(rightCharacter)) return true;

    return false;
}

function isASymbol(character) {
    if(character !== ')' && character !== '(' && character !== '+' && character !== '*') return true;
    return false;
}

// Dos caracteres seguidos en el que el de la izquierda sea ')' y el de la derecha sea '('
// Dos caracteres seguidos en el que el de la izquierda sea ')' y el el de la derecha un simbolo
// Dos caracteres seguidos en el que el de la izquierda sea '*' y el de la derecha un simbolo
// Dos caracteres seguidos en el que el de la izquierda sea '*' y el el de la derecha sea '('
// Dos caracteres seguidos en el que el de la izquierda sea un simbolo y el el de la derecha sea '('
// Dos caracteres seguidos en el que ambos sean simbolos

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
    initialState.addTransition(statesLeft[0], epsilon, 0);
    initialState.addTransition(statesRight[0], epsilon, 0);
    automaton.getStates().unshift(initialState);
    automaton.getStates().push(lastState);
    statesLeft[statesLeft.length-1].addTransition(lastState, epsilon, 0);
    statesRight[statesRight.length-1].addTransition(lastState, epsilon, 0);

    return automaton;
}

function buildConcatAutomaton(left, right) {
    let automaton = new Automaton();

    automaton._states = left.getStates().concat(right.getStates());
    left.getStates()[left.getStates().length-1].addTransition(right.getStates()[0], epsilon, 0);
    return automaton;
}

function buildKleeneAutomaton(expression) {
    let initialState = new State('q' + counter++, 0);
    let lastState = new State('q' + counter++, 0);
    let states = expression.getStates();

    initialState.addTransition(states[0], epsilon, 0);
    initialState.addTransition(lastState, epsilon, 0);
    states[states.length-1].addTransition(lastState, epsilon, 0);
    states[states.length-1].addTransition(states[0], epsilon, 0);
    states.unshift(initialState);
    states.push(lastState);

    return expression;
}

return {
    convertToNFAE: convertToNFAE
}

})();