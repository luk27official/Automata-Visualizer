
var PDA = (function() {

function PDA() {
    NFAE.call(this);

    this.initialSymbolStack = 'Z';
    this.runnersCounter = 0;
    this.runnersLimit = 512;
    this.lastChanceToGoDeeper = 0;

    this._processWord = processWord;
    this.convertToFinalState = convertToFinalState;
    this.getEpsilonClosure = getEpsilonClosure;
    this.consumeSymbol = consumeSymbol;
    this.checkWordAcceptance = checkWordAcceptance;
    this.parseTransitionSymbol = parseTransitionSymbol;
    this.parseAlphabetSymbol = parseAlphabetSymbol;
    this.parsePopSymbol = parsePopSymbol;
    this.runParser = runParser;
    this.comparePopSymbolWithStackSymbol = comparePopSymbolWithStackSymbol;
    this.applyStackOperation = applyStackOperation;
    this.createNewRunner = createNewRunner;
    this.getTransitionsBySymbol = getTransitionsBySymbol;
    this.buildPDATransitionSymbol = buildPDATransitionSymbol;

    this.evaluateRunner = evaluateRunner;
    this.filterTransitions = filterTransitions;
}

PDA.prototype = Object.create(NFAE.prototype);
PDA.prototype.constructor = PDA;

function processWord(word) {
    let runner = {state: this.getInitialState(), word: word, stack: [this.initialSymbolStack]}
    this.runnersCounter = 0;
    this.runnersLimit = 512;
    this.lastChanceToGoDeeper = 0;

    return this.evaluateRunner(runner, null, null, null);
}

function evaluateRunner(runner, pattern, lastIndexStack, previousState) {
    let activeRunners = [];
    let acceptanceFlag = false;
    let newLastIndexStack = null;
    let probablePattern = null;

    if(++this.runnersCounter === this.runnersLimit) {
        if(!confirm(this.runnersCounter + ' snapshots have been generated. Want to continue?')) 
            return {valid: true, msg: 'Execution has stopped.'};
        this.runnersLimit *= 2;
    }

    if(!pattern) {
        lastIndexStack = runner.stack.length - 1;
        pattern = runner.stack[lastIndexStack];
        previousState = runner.state.getInternalName();
    }

    else if(runner.stack.length) {
        newLastIndexStack = runner.stack.length - 1;
        if(newLastIndexStack > lastIndexStack) probablePattern = runner.stack.slice(lastIndexStack, newLastIndexStack + 1).join('');
        else pattern = runner.stack[newLastIndexStack];
        
        if(newLastIndexStack > lastIndexStack) {
            if(runner.stack.length - 1 > runner.word.length) {
                if(this.lastChanceToGoDeeper === 4) {
                    this.lastChanceToGoDeeper = 0;
                    if(probablePattern === pattern && runner.state.getInternalName() === previousState) return {valid: false, msg: 'stack infinite loop'};
                }
                else this.lastChanceToGoDeeper++;
            }
        }

        lastIndexStack = newLastIndexStack;
        pattern = probablePattern;
        previousState = runner.state.getInternalName();
    }

    if(runner.word.length) this.consumeSymbol(runner, activeRunners);
    //Para evitar caer en un ciclo infinito como en el ejemplo de los parentesis 
    else {
        if(this.checkWordAcceptance(runner).valid) return {valid: true, msg: 'Word accepted!!'};
    }

    this.getEpsilonClosure(runner, activeRunners);

    for(let i = 0; i < activeRunners.length; i++) {
        acceptanceFlag = this.evaluateRunner(activeRunners[i], pattern, lastIndexStack, previousState);
        if(acceptanceFlag.valid) return acceptanceFlag;
    }

    if(!runner.word.length) return this.checkWordAcceptance(runner);
    return {valid: false, msg: 'Word not accepted!!'};
}

function consumeSymbol(runner, activeRunners) {
    let newRunner = null;
    let transitions = this.getTransitionsBySymbol(runner.state, runner.word[0]);

    this.filterTransitions(transitions, runner);
    for(let transition in transitions) {
        newRunner = this.createNewRunner(transitions[transition].getTarget(), runner.word.substring(1), runner.stack);
        this.applyStackOperation(newRunner.stack, this.parseTransitionSymbol(transitions[transition].getSymbol()));
        activeRunners.push(newRunner);
    }
}

function getEpsilonClosure(runner, activeRunners) {
    let newRunner = null;
    let transitions = [];

    transitions = this.getTransitionsBySymbol(runner.state, epsilon);
    this.filterTransitions(transitions, runner);
    for(let transition in transitions) {
        newRunner = this.createNewRunner(transitions[transition].getTarget(), runner.word, runner.stack);
        this.applyStackOperation(newRunner.stack, this.parseTransitionSymbol(transitions[transition].getSymbol()));
        activeRunners.push(newRunner);
    }
}

function checkWordAcceptance(runner) {
    if(runner.state.isFinal()) return {valid: true, msg: 'Word accepted!!'};
    return {valid: false, msg: 'Word not accepted!!'};
}

function filterTransitions(transitions, currentRunner) {
    for(let x = 0; x < transitions.length; x++) {
        value = this.parseTransitionSymbol(transitions[x].getSymbol());
        if(this.comparePopSymbolWithStackSymbol(value.pop, currentRunner.stack)) continue;
        transitions.splice(x--, 1);
    }
}

function convertToFinalState(initialSymbolStack) {
    this._initialState.setBehavior({initial: false});
    let initialState = new State('q' + this._counter++);
    let finalState = new State('q' + this._counter++);
    let popValue = '';

    initialState.setBehavior({initial: true});
    finalState.setBehavior({final: true});

    popValue = this.buildPDATransitionSymbol(epsilon, this.initialSymbolStack, initialSymbolStack + this.initialSymbolStack);
    initialState.addTransition(this._initialState, popValue, 0);

    popValue = this.buildPDATransitionSymbol(epsilon, this.initialSymbolStack, epsilon);
    for(let state in this._states) {
        this._states[state].addTransition(finalState, popValue, 0);
    }

    this._initialState = initialState;
    this._states.push(initialState);
    this._states.push(finalState);

    console.log(this);
}

function applyStackOperation(stack, values) {
    if(values.pop !== epsilon) for(let i = 0; i < values.pop.length; i++) stack.pop();
    if(values.push !== epsilon) for(let i = values.push.length - 1; i >= 0; i--) stack.push(values.push[i]);
}

function parseTransitionSymbol(transitionSymbol) {
    let alphabetSymbol = null;
    let popSymbol = null;
    let pushSymbol = null;
    let obj = {};

    obj = this.parseAlphabetSymbol(transitionSymbol);
    alphabetSymbol = obj.symbol;

    obj = this.parsePopSymbol(transitionSymbol, obj.pos);
    popSymbol = obj.symbol;

    pushSymbol = transitionSymbol.substring(++obj.pos);

    return {alphabet: alphabetSymbol, pop: popSymbol, push: pushSymbol};
}

function parseAlphabetSymbol(transitionSymbol) {
    let alphabetDelimiter = ',';
    let i = 0;

    return this.runParser(i, transitionSymbol, alphabetDelimiter, i);
}

function parsePopSymbol(transitionSymbol, i) {
    let popDelimiter = '/';
    let popSymbol = null;
    let startPos = ++i;

    return this.runParser(startPos, transitionSymbol, popDelimiter, i);
}

function runParser(startPos, transitionSymbol, delimiter, i) {
    let symbol = null;

    for(; i < transitionSymbol.length; i++) {
        if(transitionSymbol[i] !== delimiter) continue;
        symbol = transitionSymbol.substring(startPos, i);
        break;
    }

    return {symbol: symbol, pos: i};
}

function comparePopSymbolWithStackSymbol(popValue, stack) {
    if(popValue === epsilon) return true;

    for(let i = 0; i < popValue.length; i++) {
        if(popValue[i] !== stack[stack.length - (i + 1)]) return false;
    }

    return true;
}

function createNewRunner(state, word, stack) {
    return {state: state, word: word, stack: Array.from(stack)};
}

function getTransitionsBySymbol(state, alphabetSymbol) {
    let transitions = state._getTransitions();
    let response = [];
    let value = {};

    for(let transition in transitions) {
        value = this.parseTransitionSymbol(transitions[transition].getSymbol());
        if(value.alphabet !== alphabetSymbol) continue;
        response.push(transitions[transition]);
    }

    return response;
}

function buildPDATransitionSymbol(alphabet, popValue, pushValue) {
    return alphabet + ',' + popValue + '/' + pushValue;
}

return PDA;

})();