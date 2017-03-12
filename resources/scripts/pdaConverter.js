
var pdaConverter = (function() {

function convertPDAToGrammar(pda) {
    let clone = pda.clone();
    let productions = [];

    runFirstStep(clone, productions);
    runSecondStep(clone, productions);
    console.log(productions);
}

function runFirstStep(pda, productions) {
    let finals = pda.getFinalStates();
    let currentState = null;
    let production = null;

    for(let state in finals) {
        production = {};
        currentState = finals[state];
        production.left = 'S';
        production.right = buildGrammarVariable(pda.getInitialState().getInternalName(), 'Z', currentState.getInternalName());
        productions.push(production);
    }
}

function runSecondStep(pda, productions) {
    let transitions = pda.getTransitions();
    let currentTransition = null;
    let transitionValue = null;
    let production = null;

    for(let transition in transitions) {
        production = {};
        currentTransition = transitions[transition];
        transitionValue = pda.parseTransitionSymbol(currentTransition.getSymbol());
        if(transitionValue.push !== epsilon) continue;
        production.left = buildGrammarVariable(currentTransition.getSource().getInternalName(), transitionValue.pop, currentTransition.getTarget().getInternalName());
        production.right = transitionValue.alphabet;
        productions.push(production);
    }
}

function buildGrammarVariable(startState, topStack, endState) {
    return startState + topStack + endState;
}

return {
    convertPDAToGrammar: convertPDAToGrammar
}

})();