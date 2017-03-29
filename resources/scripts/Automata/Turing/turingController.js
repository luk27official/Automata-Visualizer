
var turingCtrl = (function() {

function turingCtrl() {
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
    let value = values.readValue + '/' + values.writeValue + ',' + values.direction;

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
    $('#tape-read-input').val('');
    $('#tape-write-input').val('');
    $('select option[value="L"]').attr("selected",true);
}

function getTransitionValues() {
    let readValue = $('#tape-read-input').val() ? $('#tape-read-input').val() : 'B';
    let writeValue = $('#tape-write-input').val() ? $('#tape-write-input').val() : 'B';
    let direction = $('#direction-input').val();

    return { readValue: readValue, writeValue: writeValue, direction: direction };
}

function setAlphabet(automaton) {
    this.insertedAlphabet = $('#alphabet').val();
    if(!this.insertedAlphabet) { alert('Define the alphabet to use!'); return null;}
    
    automaton._alphabet = this.insertedAlphabet.split(" ");

    return true;
}

return turingCtrl;

})();