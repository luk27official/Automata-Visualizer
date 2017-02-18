
var RegEx = (function() {

function convertToRegex(automaton) {
    collapseTransitions(automaton);
    console.log(automaton);
}

function collapseTransitions(automaton) {
    let states = automaton.getStates();
    let transitions = [];
    let symbols = [];
    let currentTransition = null;

    for(let state in states) {
        transitions = states[state]._getTransitions();

        for(let i = 0; i < transitions.length; i++) {
            currentTransition = transitions[i];
            for(let x = i+1; x < transitions.length; x++) {
                if(currentTransition.getTarget() === transitions[x].getTarget()) {
                    symbols.push(transitions[x].getSymbol());
                    transitions[x].getTarget().removeTransitionFromMe(transitions[x].getId());
                    states[state].removeTransition(transitions[x].getId());
                    x--;
                }
            }
            symbols.map(function(symbol) {
                currentTransition._symbol += '+' + symbol;
            });
            symbols = [];
        }
    }
}

return {
    convertToRegex: convertToRegex
}

})();