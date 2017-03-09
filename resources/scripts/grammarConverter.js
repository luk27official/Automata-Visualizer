
var grammarConverter = (function() {

function convertGrammartoEmptyStackPDA(productions) {
    let productionVariables = [];
    let state = new State('q0', 0);
    let pda = new PDA();

    productionVariables = buildTransitionsForProductionVariables(state, productions);
    buildTransitionsForTerminalSymbols(state, productions, productionVariables);

    state.setBehavior({initial: true});
    pda._initialState = state;
    pda._states.push(state);
    pda._counter++;

    return {
        grammarInitialSymbol: productionVariables[0], 
        pda: pda
    };
}

function buildTransitionsForProductionVariables(state, productions) {
    let currentProduction = null;
    let transitionSymbol = '';
    let productionVariables = [];

    for(let production in productions) {
        currentProduction = productions[production];
        transitionSymbol = buildPDATransitionSymbol(epsilon, currentProduction.left, currentProduction.right);
        state.addTransition(state, transitionSymbol, 0);
        productionVariables.push(currentProduction.left);
    }

    removeDuplicateProductionVariables(productionVariables);
    return productionVariables;
}

function removeDuplicateProductionVariables(productionVariables) {
    for(let i = 0; i < productionVariables.length - 1; i++) {
        for(let x = i + 1; x < productionVariables.length; x++) {
            if(productionVariables[i] === productionVariables[x]) productionVariables.splice(x--, 1);
        }
    }
}

function buildTransitionsForTerminalSymbols(state, productions, productionVariables) {
    let terminals = getTerminalSymbols(productions, productionVariables);
    let transitionSymbol = '';
    let currentTerminal = null;

    for(let terminal in terminals) {
        currentTerminal = terminals[terminal];
        transitionSymbol = buildPDATransitionSymbol(currentTerminal, currentTerminal, epsilon);
        state.addTransition(state, transitionSymbol, 0);
    }
}

function getTerminalSymbols(productions, productionVariables) {
    let terminalSymbols= [];
    let currentProduction = null;
    let lastVisitedProductionVariable = productionVariables[0];;

    for(let production in productions) {
        currentProduction = productions[production].right;
        lastVisitedProductionVariable = addTerminalSymbolsToArray(currentProduction, productionVariables, terminalSymbols, lastVisitedProductionVariable);
    }

    return terminalSymbols;
}

function addTerminalSymbolsToArray(productionRight, productionVariables, terminals, lastVisitedProductionVariable) {
    for(let i = 0; i < productionRight.length; i++) {
        if(productionRight[i] === epsilon) continue;

        if(checkIfSymbolIsTerminal(productionRight[i], productionVariables, lastVisitedProductionVariable))
            if(!checkIfTerminalSymbolAlreadyExists(terminals, productionRight[i]))
                terminals.push(productionRight[i]);

        else lastVisitedProductionVariable = productionRight[i];
    }

    return lastVisitedProductionVariable;
}

function checkIfSymbolIsTerminal(symbol, productionVariables, lastVisitedProductionVariable) {
    if(symbol === lastVisitedProductionVariable) return false;

    for(let i = 0; i < productionVariables.length; i++) {
        if(symbol === productionVariables[i]) return false;
    }

    return true;
}

function checkIfTerminalSymbolAlreadyExists(terminals, symbol) {
    for(let i = 0; i < terminals.length; i++) {
        if(terminals[i] === symbol) return true;
    }

    return false;
}

function buildPDATransitionSymbol(alphabet, popValue, pushValue) {
    return alphabet + ',' + popValue + '/' + pushValue;
}

return {
    convertGrammartoEmptyStackPDA: convertGrammartoEmptyStackPDA
}

})();