
var Turing = (function() {

function Turing() {
    Automaton.call(this);

    this.tapeDefaultSymbol = 'B';
    this.head = null;
    this.tape = [this.tapeDefaultSymbol];

    this._processWord = processWord;
    this.evaluate = evaluate;
    this.toString = toString;

    this.moveHead = moveHead;
    this.parseTransitionLabel = parseTransitionLabel;
    this.resetTape = resetTape;
    this.getRightTransition = getRightTransition;
}

Turing.prototype = Object.create(Automaton.prototype);
Turing.prototype.constructor = Turing;

function processWord(word) {
    this.tape = this.tape.concat(word.split(''));
    this.tape.push(this.tapeDefaultSymbol);
    let response = null;
    this.head = 1;

    response = this.evaluate();
    this.resetTape();
    return response;
}

function evaluate() {
    let currentState = this.getInitialState();
    let stateTransitions = [];
    let acceptedFlag = true;
    let currentTapeSymbol = null;
    let bundle = null;

    while(!currentState.isFinal()) {
        currentTapeSymbol = this.tape[this.head];
        stateTransitions = currentState._getTransitions();
        bundle = this.getRightTransition(stateTransitions, currentTapeSymbol);

        if(!bundle) { acceptedFlag = false; break; }

        this.tape[this.head] = bundle.values.write;
        this.moveHead(bundle.values.direction);
        currentState = bundle.transition.getTarget();
    }

    if(acceptedFlag) return {valid: true, msg: 'Word accepted!' };
    else return {valid: false, msg: 'Word not accepted!'};
}

function getRightTransition(transitions, tapeSymbol) {
    let currentTransition = null;
    let transitionValues = null;

    for(let transition in transitions) {
        currentTransition = transitions[transition];
        transitionValues = this.parseTransitionLabel(currentTransition.getSymbol());
        if(transitionValues.read === tapeSymbol) return { transition: currentTransition, values: transitionValues };
    }

    return null;
}

function moveHead(direction) {
    if(direction === 'R') this.head++;
    else this.head--;
}

function parseTransitionLabel(transitionLabel) {
    let readSymbol = transitionLabel[0];
    let writeSymbol = transitionLabel[2];
    let direction = transitionLabel[4];

    return { read: readSymbol, write: writeSymbol, direction: direction };
}

function resetTape() {
    this.tape = [this.tapeDefaultSymbol];
    this.head = null;
}

function toString() {
    return 'Turing';
}

return Turing;

})();