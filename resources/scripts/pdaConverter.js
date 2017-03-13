
var pdaConverter = (function() {

function convertPDAToGrammar(pda) {
    let clone = pda.clone();
    let productions = [];
    let transitions = [];

    runFirstStep(clone, productions);
    transitions = runSecondStep(clone, productions);
    runThirdStep(pda, productions, transitions);
    simplifyGrammar(pda._alphabet, productions);

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

    return transitions;
}

function runThirdStep(pda, productions, transitions) {
    let currentTransition = null;
    let transitionValue = null;
    let truthTable = null;
    let currentRow = null;
    let production = null;
    let rightValue = null;

    for(let transition in transitions) {
        currentTransition = transitions[transition];
        transitionValue = pda.parseTransitionSymbol(currentTransition.getSymbol());

        if(transitionValue.push === epsilon) continue;
        truthTable = generatePermutation(pda.getStates(), transitionValue.push);

        for(let i = 0; i < truthTable[0].length; i++) {
            production = {};
            rightValue = [];
            currentRow = getRowFromTable(truthTable, i);
            production.left = buildGrammarVariable(currentTransition.getSource().getInternalName(), transitionValue.pop, currentRow[transitionValue.push.length - 1]);
            rightValue.push(transitionValue.alphabet);
            rightValue.push(buildGrammarVariable(currentTransition.getTarget().getInternalName(), transitionValue.push[0], currentRow[0]));

            for(let x = 1; x < transitionValue.push.length; x++) {
                rightValue.push(buildGrammarVariable(currentRow[x - 1], transitionValue.push[x], currentRow[x]));
            }

            production.right = rightValue.join();
            productions.push(production);
        }
    }
}

function simplifyGrammar(terminals, productions) {
    let currentProduction = null;
    let rightValue = null;
    let existsFlag = false;

    for(let i = 0; i < productions.length; i++) {
        currentProduction = productions[i];
        rightValue = currentProduction.right.split(',');
        existsFlag = checkExistance(terminals, productions, rightValue);
        if(existsFlag) continue;

        productions.splice(i--, 1);
    }
}

function checkExistance(terminals, productions, rightValue) {
    let currentValue = null;

    for(let i = 0; i < rightValue.length; i++) {
        currentValue = rightValue[i];
        if(checkIfValueIsTerminal(terminals, currentValue) || currentValue === epsilon) continue;
        if(checkIfItIsVariableProduction(productions, currentValue)) continue;

        return false;
    }

    return true;
}

function checkIfValueIsTerminal(terminals, value) {
    for(let terminal in terminals) {
        if(terminals[terminal] === value) return true;
    }

    return false;
}

function checkIfItIsVariableProduction(productions, value) {
    let currentProduction = null;

    for(let production in productions) {
        currentProduction = productions[production];
        if(currentProduction.left === value) return true;
    }

    return false;
}

function generatePermutation(states, pushValue) {
    let rows = states.length**pushValue.length;
    let columns = pushValue.length;
    let table = [];
    let maxLimit = 1;
    let simulatedPosition = 0;
    let currentRow = 0;

    for(let i = 0; i < columns; i++) table.push([]);

    for(let i = columns - 1; i >= 0; i--) {
        maxLimit = states.length**simulatedPosition++;
        currentRow = 0;
        while(currentRow < rows) {
            for(let y = 0; y < states.length; y++) {
                for(let z = 0; z < maxLimit; z++) {
                    table[i].push(states[y].getInternalName());
                    currentRow++;
                }
            }
        }
    }

    return table;
}

function getRowFromTable(table, index) {
    let row = [];

    for(let i = 0; i < table.length; i++) {
        row.push(table[i][index]);
    }

    return row;
}

function buildGrammarVariable(startState, topStack, endState) {
    return startState + topStack + endState;
}

return {
    convertPDAToGrammar: convertPDAToGrammar
}

})();