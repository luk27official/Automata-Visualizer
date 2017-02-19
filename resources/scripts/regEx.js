
var RegEx = (function() {

function convertToRegex(automaton) {
    collapseTransitions(automaton.getStates());
    let regex = reduceStates(automaton);
    console.log(regex);
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
                //currentTransition._symbol += '+' + symbol;
                currentTransition._symbol = constructRegEx(currentTransition._symbol, '', symbol, '+');
            });
            symbols = [];
        }
    }
}

function reduceStates(automaton) {
    let states = automaton.getStates();
    let copy = null;
    let newTransitionId = 1;
    let finals = 0;
    let regex = '';

    for(let i = 0; i < states.length; i++) {
        if(states[i].isFinal() || states[i].isInitial()) {
            if(states[i].isFinal()) finals++;
            continue;
        }

        newTransitionId = removeState(states[i], newTransitionId);
        states.splice(i, 1);
        i--;
    }

    copy = automaton.clone();
    if(states[0].isFinal()) {
        regex = getRegexWhereInitialStateIsFinalState(copy, finals);
    }
    else {
        regex = getRegexWhereInitialStateIsNotFinalState(copy, finals);
    }

    return regex;
}

function getRegexWhereInitialStateIsFinalState(automaton, finals) {

}

function getRegexWhereInitialStateIsNotFinalState(automaton, finals) {
    if(finals === 1) {
        return buildTwoStatesRegex(automaton.getStates());
    }
}

function buildTwoStatesRegex(states) {
    let regex = '';
    let initialLoopBack = checkForLoopbackTransition(states[0]._getTransitions());
    let finalLoopBack = checkForLoopbackTransition(states[1]._getTransitions());
    let transitionToInitialState = getTransition(states[1], states[0]);

    regex = initialLoopBack ? constructLoopRegex(initialLoopBack.getSymbol()) : '';
    regex += getTransition(states[0], states[1]).getSymbol();
    regex = finalLoopBack ? regex + constructLoopRegex(finalLoopBack.getSymbol()) : regex;

    if(transitionToInitialState) {
        let loopExpression = '(' + transitionToInitialState.getSymbol() + ')' + regex;
        regex += constructLoopRegex(loopExpression);
    }

    return regex;
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
            if(loopbackTransition && outgoingTransitions[x].getId() === loopbackTransition.getId()) continue;
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
    if(regEx.length > 1) return '(' + regEx + ')*';

    return regEx + '*';
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

function constructRegEx(incomingRegEx, loopRegEx, outgoingRegex, operator) {
    if(outgoingRegex.length > 1) outgoingRegex = '(' + outgoingRegex + ')';
    if(incomingRegEx.length > 1) incomingRegEx = '(' + incomingRegEx + ')';

    if(!operator) return incomingRegEx + loopRegEx + outgoingRegex;
    else return incomingRegEx + operator + outgoingRegex;
}

function getIncomingStates(incomingTransitions) {
    return incomingTransitions.map(function(transition) {
        return transition.getSource();
    });
}

function getTransition(source, target) {
    let transitions = source._getTransitions();

    for(let transition in transitions) {
        if(transitions[transition].getTarget().getId() === target.getId()) return transitions[transition];
    }

    return null;
}

return {
    convertToRegex: convertToRegex
}

})();