
var pdaCtrl = (function() {

function pdaCtrl() {
    this.insertedAlphabet = null;

    this.setTransition = setTransition;
    this.removeNewTransition = removeNewTransition;
    this.resetTransitionInputs = resetTransitionInputs;
    this.getTransitionValues = getTransitionValues;
    this.setAlphabet = setAlphabet;
}

function setTransition(newTransition, automaton, diagram) {
    let state = null;
    let source = newTransition.getSourceElement();
    let target = newTransition.getTargetElement();
    let values = this.getTransitionValues();
    let value = values.alphabet + ',' + values.pop + '/' + values.push;

    newTransition.label(0, {
        position: 0.5,
        attrs: {
            text: {fill: 'blue', text: value}
        }
    });

    state = automaton.getState(source.id);
    diagram.curveTransition(source.id, target.id, newTransition, state);
    state.addTransition(automaton.getState(target.id), value, newTransition.id);

    this.resetTransitionInputs();
    console.log(automaton);
}

function removeNewTransition(newTransition) {
    newTransition.remove();
}

function resetTransitionInputs() {
    $('#symbol-input').val('');
    $('#pop-input').val('');
    $('#push-input').val('');
}

function getTransitionValues() {
    let alphabet = $('#symbol-input').val() ? $('#symbol-input').val() : 'E';
    let popValue = $('#pop-input').val() ? $('#pop-input').val() : 'E';
    let pushValue = $('#push-input').val() ? $('#push-input').val() : 'E';

    return {alphabet: alphabet, pop: popValue, push: pushValue};
}

function setAlphabet(automaton) {
    if(!this.insertedAlphabet) this.insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else {
        this.insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', this.insertedAlphabet);
    }

    if(!this.insertedAlphabet) return null;
    automaton._alphabet = this.insertedAlphabet.split(" ");

    return true;
}

return pdaCtrl;

})();