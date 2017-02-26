
var Minimize = (function() {

let mainBlock = {};
let alphabet = [];
let originalAutomaton = null;

function Minimize(automaton, symbols) {
    alphabet = symbols;
    originalAutomaton = automaton;
    mainBlock = createMainBlock(automaton.getStates());

    runMinimization(automaton.getStates());
    console.log(mainBlock);
}

function runMinimization(states) {
    let currentState = null;

    for(let i = 0; i < states.length - 1; i++) {
        currentState = states[i];
        for(let x = i + 1; x < states.length; x++) {
            if(checkEquivalence(currentState, states[x]) === null)
                runInDepthDifferenceCheck(currentState, states[x]);
        }
    }
}

function createMainBlock(states) {
    let block = {};
    let internalName = '';
    let finalStates = [];

    for(let i = 0; i < states.length - 1; i++) {
        internalName = states[i].getInternalName();
        block[internalName] = {};

        for(let x = i + 1; x < states.length; x++) {
            block[internalName][states[x].getInternalName()] = {equivalent: null, dependents: []};
        }
    }

    finalStates = getFinalStates();

    for(let state in finalStates) {
        internalName = finalStates[state].getInternalName();

        for(let key in block) {
            if(key !== internalName) {
                if(block[key].hasOwnProperty(internalName)) {
                    if(!originalAutomaton._getStateByInternalName(key).isFinal()) block[key][internalName].equivalent = false;
                }
            }
            else {
                for(let innerKey in block[key]) {
                    if(!originalAutomaton._getStateByInternalName(innerKey).isFinal()) block[key][innerKey].equivalent = false;
                }
            }
        }
    }

    return block;
}

function runQuickDifferenceCheck(currentState, nextState) {
    if(currentState.isFinal() !== nextState.isFinal()) return true;

    return false;
}

function runInDepthDifferenceCheck(currentState, nextState) {
    let currentStateTransitions = nextStateTransitions = [];
    let currentStateTarget = nextStateTarget = null;
    let equivalence = null;

    for(let symbol in alphabet) {
        currentStateTransitions = originalAutomaton._getTransitionsBySymbol(currentState, alphabet[symbol]);
        nextStateTransitions = originalAutomaton._getTransitionsBySymbol(nextState, alphabet[symbol]);
        currentStateTarget = currentStateTransitions[0].getTarget();
        nextStateTarget = nextStateTransitions[0].getTarget();

        if(isSameTarget(currentStateTarget, nextStateTarget)) continue;

        equivalence = checkEquivalence(currentStateTarget, nextStateTarget);
        switch(equivalence) {
            case false:
                setEquivalence(currentState, nextState, false);
                return;

            case null:
                addAsDependentPair(currentState.getInternalName() + ',' + nextState.getInternalName(), currentStateTarget.getInternalName(), nextStateTarget.getInternalName());
                break;
        }
    }
}

function isSameTarget(currentStateTarget, nextStateTarget) {
    return currentStateTarget.getInternalName() === nextStateTarget.getInternalName();
}

function addAsDependentPair(dependentPairInternalName, firstStateInternalName, secondStateInternalName) {
    let dependents = [];

    if(checkInternalNameFormat(firstStateInternalName, secondStateInternalName))
        dependents = mainBlock[firstStateInternalName][secondStateInternalName].dependents;
    else
        dependents = mainBlock[secondStateInternalName][firstStateInternalName].dependents;

    if(checkRedundancyInDependentsArray(dependents, dependentPairInternalName)) return;
    dependents.push(dependentPairInternalName);
}

function checkRedundancyInDependentsArray(dependents, dependentPairInternalName) {
    let resident = [];
    let visitor = dependentPairInternalName.split(',');
    let counter = 0;

    for(let dependent in dependents) {
        resident = dependents[dependent].split(',');

        for(let i = 0; i < resident.length; i++) {
            for(let x = 0; x < visitor.length; x++) {
                if(resident[i] === visitor[x]) { counter++; break; }
            }
        }
    }

    if(counter === 2) return true;
    return false;
}

function checkEquivalence(firstState, secondState) {
    if(checkInternalNameFormat(firstState.getInternalName(), secondState.getInternalName()))
        return mainBlock[firstState.getInternalName()][secondState.getInternalName()].equivalent;
    else
        return mainBlock[secondState.getInternalName()][firstState.getInternalName()].equivalent;
}

function checkInternalNameFormat(firstStateInternalName, secondStateInternalName) {
    let name = firstStateInternalName + ',' + secondStateInternalName;
    let sortedName = name.split(',').sort().join();

    return name === sortedName;
}

function setEquivalence(currentState, nextState, value) {
    let pair = mainBlock[currentState.getInternalName()][nextState.getInternalName()];
    pair.equivalent = value;

    setDependentsEquivalence(pair.dependents, value);
    pair.dependents = [];
}

function setDependentsEquivalence(dependents, equivalence) {
    let internalNames = [];
    let pair = null;

    for(let dependent in dependents) {
        internalNames = dependents[dependent].split(',');
        pair = mainBlock[internalNames[0]][internalNames[1]];

        if(pair.equivalent === null) pair.equivalent = equivalence;
    }
}

function getFinalStates() {
    let finalStates = [];
    let states = originalAutomaton.getStates();

    for(let state in states) {
        if(states[state].isFinal()) finalStates.push(states[state]);
    }

    return finalStates;
}

return Minimize;

})();