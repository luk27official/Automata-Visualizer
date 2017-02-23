
var regularLanguaje = (function() {

let operands = [];

let properties = {
    intersect: intersect,
    unite: unite,
    complement: complement
};

function intersect(alphabet) {
    let result = null;

    for(let i = 0; i < operands.length; i++) {
        if(i+1 === operands.length) return result;
        //Convertir a DFA aquellos operandos que no lo sean
        result = !result ? combine(operands[i].operand, operands[i+1].operand, alphabet, 'intersection') : combine(result, operands[i+1], alphabet, 'intersection');
        //Setear el nombre de cada estado en el automata 'result' como la concatenacion de 'q' y un contador.
    }
}

function convertOperandstoDFA(operand) {

}

function combine(firstOperand, secondOperand, alphabet, operation) {
    let result = null;

    setupOperands(firstOperand, secondOperand);

    let initialStateFirst = firstOperand.getInitialState();
    let initialStateSecond = secondOperand.getInitialState();
    let currentState = new State(initialStateFirst.getName() + ',' + initialStateSecond.getName(), 0);
    currentState.setInternalName(initialStateFirst.getInternalName() + ',' + initialStateSecond.getInternalName());
    currentState.setBehavior({initial: true});
    let newStates = [currentState];
    let pendingStates = [];

    runPass(newStates, pendingStates, currentState, firstOperand, secondOperand, alphabet);
    for(let i = 0; i < pendingStates.length; i++) {
        runPass(newStates, pendingStates, pendingStates[i], firstOperand, secondOperand, alphabet);
    }

    setFinalStates(operation, newStates, firstOperand, secondOperand);

    result = new Automaton();
    result._states = newStates;
    result._initialState = newStates[0];
    result._counter = newStates.length;

    return result;
}

function setFinalStates(operation, states, firstOperand, secondOperand) {
    switch(operation) {
        case 'intersection':
            setIntersectionFinalStates(states, firstOperand, secondOperand);
            break;

        case 'union':
            setUnionFinalStates(states);
            break;
        
        case 'complement':
            setComplementFinalStates(states);
            break;
    }
}

function setIntersectionFinalStates(newStates, firstOperand, secondOperand) {
    let names = [];
    let automaton = null;
    let state = null;
    let candidate = true;
    let counter = 0;

    for(let newState in newStates) {
        candidate = true;
        names = newStates[newState].getInternalName().split(',');
        for(let internalName in names) {
            automaton = selectAutomatonOwner(names[internalName], firstOperand, secondOperand);
            state = automaton._getStateByInternalName(names[internalName]);
            if(!state.isFinal()) { candidate = false; break;}
            counter++;
        }

        if(candidate && counter === 2) newStates[newState].setBehavior({final: true});
        counter = 0;
    }
}

function runPass(newStates, pendingStates, currentState, firstOperand, secondOperand, alphabet) {
    let names = currentState.getInternalName();
    let newStateName = [];
    let constructedInternalName = '';
    let automaton = null;

    names = names.split(',');

    for(let symbol in alphabet) {
        newStateName = getTargetStates(names, firstOperand, secondOperand, alphabet[symbol]);
        constructedInternalName = newStateName.join();

        if(!constructedInternalName) continue;
        if(checkIfNewStateIsCurrentState(currentState, constructedInternalName, alphabet[symbol])) continue;
        if(checkIfNewStateExists(newStates, constructedInternalName, currentState, alphabet[symbol])) continue;

        createDFAState(newStateName, constructedInternalName, pendingStates, alphabet[symbol], currentState, newStates);
    }
}

function getTargetStates(names, firstOperand, secondOperand, symbol) {
    let newStateName = [];
    let automaton = null;
    let targetInternalName = '';
    
    for(let name in names) {
        automaton = selectAutomatonOwner(names[name], firstOperand, secondOperand);
        targetInternalName = automaton.getStateTargetForSymbol(names[name], symbol);
        if(!targetInternalName) continue;
        newStateName.push(targetInternalName);
    }

    return newStateName;
}

function selectAutomatonOwner(stateInternalName, firstOperand, secondOperand) {
    let flag = stateInternalName[stateInternalName.length-1];

    if(flag === 'A') return firstOperand;
    else return secondOperand;
}

function setupOperands(firstOperand, secondOperand) {
    let firstOperandStates = firstOperand.getStates();
    let secondOperandStates = secondOperand.getStates();

    for(let state in firstOperandStates) {
        firstOperandStates[state].setInternalName(firstOperandStates[state].getInternalName() + 'A');
        firstOperandStates[state].setName(firstOperandStates[state].getName() + 'A');
    }

    for(let state in secondOperandStates) {
        secondOperandStates[state].setInternalName(secondOperandStates[state].getInternalName() + 'B');
        secondOperandStates[state].setName(secondOperandStates[state].getName() + 'B');
    }
}

function checkIfNewStateIsCurrentState(currentState, constructedInternalName, symbol) {
    let internalName = currentState.getInternalName().split(',');
    let constructedName = constructedInternalName.split(',');
    let counterCheck = 0;

    if(internalName.length !== constructedName.length) return false;
    for(let i = 0; i < constructedName.length; i++) {
        for(let name in internalName) {
            if(constructedName[i] === internalName[name]) {
                counterCheck++;
                break;
            }
        }
    }

    if(counterCheck >= constructedName.length) {
         currentState.addTransition(currentState, symbol, 0);
        return true;
    }

    return false;
}

function checkIfNewStateExists(newStates, constructedInternalName, currentState, symbol) {
    let internalName = '';
    let constructedName = constructedInternalName.split(',');
    let counterCheck = 0;

    for(let state in newStates) {
        internalName = newStates[state].getInternalName().split(',');
        if(internalName.length !== constructedName.length) continue;

        for(let i = 0; i < constructedName.length; i++) {
            for(let name in internalName) {
                if(constructedName[i] === internalName[name]) {
                    counterCheck++;
                    break;
                }
            }
        }

        if(counterCheck >= constructedName.length) {
            currentState.addTransition(newStates[state], symbol, 0);
            return true;
        }
        counterCheck = 0;
    }

    return false;
}

function createDFAState(newStateName, constructedInternalName, pendingStates, symbol, currentState, newStates) {
    let displayName = [];
    let newState = null;
    let final = false;
    let state = null;

    // for(let name in newStateName) {
    //     state = this._getStateByInternalName(newStateName[name]);
    //     if(!final) final = state.isFinal();
    //     displayName.push(state.getName());
    // }
    
    newState = new State(constructedInternalName, 0);
    newState.setInternalName(constructedInternalName);
    currentState.addTransition(newState, symbol, 0);
    newStates.push(newState);
    pendingStates.push(newState);
}

function unite() {

}

function complement() {

}

return {
    properties: properties,
    operands: operands
};

})();