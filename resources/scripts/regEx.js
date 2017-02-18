
var RegEx = (function() {

function convertToRegex(automaton) {
    collapseTransitions(automaton.getStates());
    reduceStates(automaton.getStates());
    console.log(automaton);
}

function collapseTransitions(states) {
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

function reduceStates(states) {
    let newTransitionId = 1;

    for(let i = 0; i < states.length; i++) {
        if(states[i].isFinal() || states[i].isInitial()) continue;

        newTransitionId = removeState(states[i], newTransitionId);
        states.splice(i, 1);
        i--;
    }

    
}

function removeState(state, newTransitionId) {
    let incomingTransitions = [];
    let counter = 0;
    let outgoingTransitions = state._getTransitions();
    let loopbackTransition = checkForLoopbackTransition(outgoingTransitions);
    let loopRegEx = loopbackTransition ? constructLoopRegex(loopbackTransition.getSymbol()) : '';

    removeIncomingTransitionsFromTargets(outgoingTransitions);
    incomingTransitions = state.getIncomingTransitions();

    for(let i = 0; i < incomingTransitions.length; i++) {
        for(let x = 0; x < outgoingTransitions.length; x++) {
            if(loopbackTransition && outgoingTransitions[x].getId() === loopbackTransition.getId) continue;
            if(counter === 0) updateIncomingTransition(incomingTransitions[i], loopRegEx, outgoingTransitions[x]);
            else { newTransitionId = createNewTransition(incomingTransitions[i], loopRegEx, outgoingTransitions[x], newTransitionId); }

            counter++;
        }
        counter = 0;
    }

    collapseTransitions(getIncomingStates(incomingTransitions));

    return newTransitionId;
}

function constructLoopRegex(regEx) {
    return '(' + regEx + ')*';
}

function checkForLoopbackTransition(transitions) {
    for(let transition in transitions) {
        if(isTransitionLoopback(transitions[transition])) return transitions[transition];
    }

    return null;
}

function removeIncomingTransitionsFromTargets(transitions) {
    for(let transition in transitions) {
        transitions[transition].getTarget().removeTransitionFromMe(transitions[transition].getId());
    }
}

function isTransitionLoopback(transition) {
    if(transition.getSource().getId() === transition.getTarget().getId()) return true;
    return false;
}

function updateIncomingTransition(incomingTransition, loopRegEx, outgoingTransition) {
    incomingTransition.setSymbol(constructRegEx(incomingTransition.getSymbol(), loopRegEx, outgoingTransition.getSymbol()));
    incomingTransition.setTarget(outgoingTransition.getTarget());
    incomingTransition.getTarget().addTransitionToMe(incomingTransition);
}

function createNewTransition(incomingTransition, loopRegEx, outgoingTransition, newTransitionId) {
    let regEx = constructRegEx(incomingTransition.getSymbol(), loopRegEx, outgoingTransition.getSymbol());
    let source = incomingTransition.getSource();
    let target = outgoingTransition.getTarget();

    source.addTransition(target, regEx, newTransitionId);
    return ++newTransitionId;
}

function constructRegEx(incomingRegEx, loopRegEx, outgoingRegex) {
    if(outgoingRegex.length > 1) returnincomingRegEx + loopRegEx + '(' + outgoingRegex + ')';

    return incomingRegEx + loopRegEx + outgoingRegex;
}

function getIncomingStates(incomingTransitions) {
    return incomingTransitions.map(function(transition) {
        return transition.getSource();
    });
}

return {
    convertToRegex: convertToRegex
}

})();