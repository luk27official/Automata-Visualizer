
var Minimize = (function() {

let mainBlock = {};
let alphabet = [];
let originalAutomaton = null;

function Minimize(automaton, symbols) {
    alphabet = symbols;
    originalAutomaton = automaton;

    checkTransitionForEachSymbol();

    removeUnreachableStates();
    mainBlock = createMainBlock(originalAutomaton.getStates());

    return runMinimization();
}

function checkTransitionForEachSymbol() {
    let sink = new State('sink', 9999);
    sink.setInternalName('q9999');
    let states = originalAutomaton.getStates();
    let sinkFlag = false;

    states.push(sink);

    for(let state in states) {
        for(let symbol in alphabet) {
            if(!originalAutomaton._getTransitionsBySymbol(states[state], alphabet[symbol]).length) {
                states[state].addTransition(sink, alphabet[symbol], 0);
                sinkFlag = true;
            }
        }
    }

    if(!sinkFlag) states.splice(states.length-1, 1);
}

function runMinimization() {
    let stateBlocks = [];
    let newAutomaton = null;

    buildEquivalencyTable();
    stateBlocks = setupStateBlocks();
    removeStateDuplicationInBlocks(stateBlocks);
    newAutomaton = buildNewAutomaton(stateBlocks);
    removeSinkState(newAutomaton);

    originalAutomaton = mainBlock = alphabet = null;
    
    return newAutomaton;
}

function removeSinkState(newAutomaton) {
    let sink = newAutomaton.getStateByName('sink');
    let incomingTransitions = sink.getIncomingTransitions();
    let state = null;

    for(let x = 0; x < incomingTransitions.length; x++) {
        state = incomingTransitions[x].getSource();
        state.removeTransition(incomingTransitions[x].getId());
        x--;
    }

    newAutomaton.removeState('sink');
}

function removeUnreachableStates() {
    let states = originalAutomaton.getStates();
    let transitions = [];

    for(let i = 0; i < states.length; i++) {
        if(states[i].isInitial()) continue;
        if(states[i].getIncomingTransitions().length !== 0) continue;
        transitions = states[i]._getTransitions();
        for(let x = 0; x < transitions.length; x++) {
            states[i].removeTransition(transitions[x--].getId());
        }

        states.splice(i--, 1);
    }
}

function buildEquivalencyTable() {
    let currentState = null;
    let states = originalAutomaton.getStates();

    for(let i = 0; i < states.length - 1; i++) {
        currentState = states[i];
        for(let x = i + 1; x < states.length; x++) {
            if(checkEquivalence(currentState, states[x]) === null)
                runInDepthDifferenceCheck(currentState, states[x]);
        }
    }
}

function setupStateBlocks() {
    let blocks = [];
    let currentBlock = [];
    let states = [];

    for(let key in mainBlock) {
        currentBlock.push(key);
        for(let innerKey in mainBlock[key]) {
            if(mainBlock[key][innerKey].equivalent === null) currentBlock.push(innerKey);
        }

        blocks.push(currentBlock);
        currentBlock = [];
    }

    states = originalAutomaton.getStates();
    currentBlock.push(states[states.length - 1].getInternalName());
    blocks.push(currentBlock);

    return blocks;
}

function removeStateDuplicationInBlocks(blocks) {
    let currentBlock = null;

    for(let i = 0; i < blocks.length - 1; i++) {
        currentBlock = blocks[i];

        for(let x = i + 1; x < blocks.length; x++) {
            if(!checkStateDuplication(currentBlock, blocks[x])) continue;
            blocks.splice(x, 1);
            x--;
        }
    }

    console.log(blocks);
}

function buildNewAutomaton(blocks) {
    let newStates = [];
    let pendingStates = [];
    let displayName = '';
    let oldState = null;
    let newState = null;
    let target = null;
    let newAutomaton = null;
    let initialState = null;
    let final = false;
    let initial = false;
    let targetInternalName = '';
    let transitionCounter = 0;

    for(let block in blocks) {
        for(let internalName in blocks[block]) {
            oldState = originalAutomaton._getStateByInternalName(blocks[block][internalName]);
            if(!final) final = oldState.isFinal();
            if(!initial) initial = oldState.isInitial();
            displayName = !displayName ? oldState.getName() : displayName + ',' + oldState.getName();
        }

        newState = new State(displayName, 0);
        newState.setInternalName(blocks[block].join());
        newState.setBehavior({initial: initial, final: final});
        newStates.push(newState);
        displayName = '';
        initial = false;
        final = false;
        if(newState.isInitial()) initialState = newState;
    }

    for(let i = 0; i < newStates.length; i++) {
        oldState = originalAutomaton._getStateByInternalName(newStates[i].getInternalName().split(',')[0]);

        for(let symbol in alphabet) {
            targetInternalName = originalAutomaton._getTransitionsBySymbol(oldState, alphabet[symbol])[0].getTarget().getInternalName();

            for(let x = 0; x < newStates.length; x++) {
                if(!newStates[x].getInternalName().split(',').includes(targetInternalName)) continue;

                newStates[i].addTransition(newStates[x], alphabet[symbol], transitionCounter++);
                break;
            }
        }
    }

    newAutomaton = new DFA();
    newAutomaton._states = newStates;
    newAutomaton.resetStateInternalNames();
    newAutomaton._initialState = initialState;

    return newAutomaton;
}

function checkStateDuplication(currentBlock, nextBlock) {
    for(let internalName in currentBlock) {
        if(nextBlock.includes(currentBlock[internalName])) return true;
    }

    return false;
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
    let currentStateTransitions = [];
    let nextStateTransitions = [];
    let currentStateTarget = null;
    let nextStateTarget = null;
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
        counter = 0;

        for(let i = 0; i < resident.length; i++) {
            for(let x = 0; x < visitor.length; x++) {
                if(resident[i] === visitor[x]) { counter++; break; }
            }
        }

        if(counter === 2) return true;
    }

    return false;
}

function checkEquivalence(firstState, secondState) {
    if(checkInternalNameFormat(firstState.getInternalName(), secondState.getInternalName()))
        return mainBlock[firstState.getInternalName()][secondState.getInternalName()].equivalent;
    else
        return mainBlock[secondState.getInternalName()][firstState.getInternalName()].equivalent;
}

function checkInternalNameFormat(firstStateInternalName, secondStateInternalName) {
    let firstName = parseInt(firstStateInternalName.substring(1));
    let secondName = parseInt(secondStateInternalName.substring(1));

    if(firstName < secondName) return true;
    return false;
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

        if(pair.equivalent === null) {
            pair.equivalent = equivalence;
            if(pair.dependents.length) {
                setDependentsEquivalence(pair.dependents, equivalence);
                pair.dependents = [];
            }
        }
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