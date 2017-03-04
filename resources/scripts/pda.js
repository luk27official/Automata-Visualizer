
var PDA = (function() {

function PDA() {
    NFAE.call(this);

    this.getInitialSymbolStack = getInitialSymbolStack;

    this.initialSymbolStack = 'Z';
    this._processWord = processWord;
    this.getEpsilonClosure = getEpsilonClosure;
    this.consumeSymbol = consumeSymbol;
    this.checkWordAcceptance = checkWordAcceptance;
    this.parseTransitionSymbol = parseTransitionSymbol;
    this.parseAlphabetSymbol = parseAlphabetSymbol;
    this.parsePopSymbol = parsePopSymbol;
    this.runParser = runParser;
    this.comparePopSymbolWithStackSymbol = comparePopSymbolWithStackSymbol;
    this.travelEpsilonTransitions = travelEpsilonTransitions;
    this.travelTransitions = travelTransitions;
    this.applyStackOperation = applyStackOperation;
    this.createNewRunner = createNewRunner;
    this.getTransitionsBySymbol = getTransitionsBySymbol;
}

PDA.prototype = Object.create(NFAE.prototype);
PDA.prototype.constructor = PDA;

function processWord(word) {
    let runners = [{state: this.getInitialState(), word: word, stack: [this.initialSymbolStack]}];
    let runnersLength = 0;
    let verdict = true;

    for(let symbol in word) {
        this.getEpsilonClosure(runners);
        runnersLength = runners.length;

        for(let i = 0; i < runnersLength; i++) {
            verdict = this.consumeSymbol(runners[i], runners);
            if(!verdict) { runners.splice(i--, 1); runnersLength--; }
        }
    }

    this.getEpsilonClosure(runners);
    return this.checkWordAcceptance(runners);
}

function getEpsilonClosure(runners) {
    let transitions = [];
    let currentRunner = null;

    for(let i = 0; i < runners.length; i++) {
        currentRunner = runners[i];
        transitions = this.getTransitionsBySymbol(currentRunner.state, 'E');
        transitions = transitions.filter(function(transition) {
            let value = this.parseTransitionSymbol(transition.getSymbol());
            return this.comparePopSymbolWithStackSymbol(value.pop, currentRunner.stack);
        }, this);

        if(!transitions.length) continue;
        this.travelEpsilonTransitions(runners, currentRunner, transitions);
    }
}

function consumeSymbol(runner, runners) {
    let symbol = runner.word[0];
    let transitions = this.getTransitionsBySymbol(runner.state, symbol);

    transitions = transitions.filter(function(transition) {
        let value = this.parseTransitionSymbol(transition.getSymbol());
        return this.comparePopSymbolWithStackSymbol(value.pop, runner.stack);
    }, this);
    if(!transitions.length) return false;
    return this.travelTransitions(runner, runners, transitions);

}

function checkWordAcceptance(runners) {
    for(let runner in runners) {
        if(runners[runner].state.isFinal()) return {valid: true, msg: 'Word accepted!!'};;
    }

    return {valid: false, msg: 'Word not accepted!!'};;
}

function travelTransitions(runner, runners, transitions) {
    let currentRunners = [runner];
    let newRunner = {};
    let values = null;

    for(let i = 0; i < transitions.length - 1; i++) {
        newRunner = this.createNewRunner(runner.state, runner.word, runner.stack);
        currentRunners.push(newRunner);
        runners.push(newRunner);
    }

    for(let i = 0; i < transitions.length; i++) {
        currentRunners[i].state = transitions[i].getTarget();
        currentRunners[i].word = currentRunners[i].word.substring(1);
        values = this.parseTransitionSymbol(transitions[i].getSymbol());
        this.applyStackOperation(currentRunners[i].stack, values);
    }

    return true;
}

function travelEpsilonTransitions(runners, currentRunner, transitions) {
    let currentTransition = null;
    let transitionValues = null;
    let newRunner = {};

    for(let transition in transitions) {
        currentTransition = transitions[transition];
        newRunner = this.createNewRunner(currentTransition.getTarget(), currentRunner.word, currentRunner.stack);
        transitionValues = this.parseTransitionSymbol(currentTransition.getSymbol());
        this.applyStackOperation(newRunner.stack, transitionValues);
        //Considerar hacer un chequeo en busca de runners duplicados en la lista. Para esto comparar el estado y la pila de cada uno.
        runners.push(newRunner);
    }
}

function applyStackOperation(stack, values) {
    // if(values.pop !== 'E') stack.pop();
    // if(values.push !== 'E') stack.push(values.push);

    if(values.pop !== 'E') for(let i = 0; i < values.pop.length; i++) stack.pop();
    if(values.push !== 'E') for(let i = values.push.length - 1; i >= 0; i--) stack.push(values.push[i]);
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

function getInitialSymbolStack() {
    return this.initialSymbolStack;
}

function comparePopSymbolWithStackSymbol(popValue, stack) {
    //return popValue === stack[stack.length - 1] || popValue === 'E';
    if(popValue === 'E') return true;

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

return PDA;

})();