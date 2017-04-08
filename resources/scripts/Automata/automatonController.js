
var automatonCtrl = (function() {

function automatonCtrl() {
    this.insertedAlphabet = null;
}

automatonCtrl.prototype.convertToRegex = convertToRegex;
automatonCtrl.prototype.convertRegexToNFAE = convertRegexToNFAE;
automatonCtrl.prototype.setAlphabet = setAlphabet;
automatonCtrl.prototype.executeRegularOperation = executeRegularOperation;
automatonCtrl.prototype.complementAutomata = complementAutomata;
automatonCtrl.prototype.minimize = minimize;
automatonCtrl.prototype.setTransition = setTransition;
automatonCtrl.prototype.changeTransition = changeTransition;

function convertToRegex(automaton) {
    let clone = null;
    let regex = '';

    if(!automaton.getStates().length) return;
    if(!this.setAlphabet(automaton)) return;
    
    clone = automaton.clone();
    if(!clone) {
        alert('No initial state has been set!');
        return;
    }

    regex = RegEx.convertToRegex(clone);
    $('#regexText').val(regex)
}

function convertRegexToNFAE() {
    let expression = $('#regexText').val();

    if(!expression) return null;

    return RegEx.toNFAE(expression);
}

function setAlphabet(automaton) {
    this.insertedAlphabet = $('#alphabet').val();
    if(!this.insertedAlphabet) { alert('Define the alphabet to use!'); return null;}

    automaton._alphabet = this.insertedAlphabet.split(" ");

    return true;
}

function executeRegularOperation(automaton, operationCallback) {
    if(!regularLanguaje.operands.length) { alert('You must add at least two operands to continue.'); return null; }
    
    if(!this.setAlphabet(automaton)) return null;
    return operationCallback(this.insertedAlphabet.split(" "));
}

function complementAutomata(automaton) {
    if(!regularLanguaje.operands.length) { alert('You must add at least one operand to continue.'); return null; }

    if(!this.setAlphabet(automaton)) return null;
    return regularLanguaje.properties.complement(this.insertedAlphabet.split(" "));
}

function minimize(automaton) {
    let newAutomaton = null;

    if(!this.setAlphabet(automaton)) return null;
    if(!(automaton instanceof DFA)) { alert("First convert it into a DFA. You just have to press the button above."); return null; }
    
    newAutomaton = automaton.minimize();

    if(!newAutomaton) { alert('No initial state has been set!'); return null; }

    return newAutomaton;
}

 function setTransition(newTransition, automaton, diagram) {
    let source = newTransition.getSourceElement();
    let target = newTransition.getTargetElement();
    let name = prompt('Symbol:');
    if(!name) {
        newTransition.remove();
        return;
    }
    newTransition.label(0, {
        position: 0.5,
        attrs: {
            text: {fill: 'black', text: name}
        }
    });

    let state = automaton.getState(source.id);
    diagram.curveTransition(source.id, target.id, newTransition, state);
    state.addTransition(automaton.getState(target.id), name, newTransition.id);
    console.log(automaton);
}

 function changeTransition(newTransition, automaton, diagram) {
    let source = newTransition.getSourceElement();
    let target = newTransition.getTargetElement();

    let state = automaton.getState(source.id);
    diagram.curveTransition(source.id, target.id, newTransition, state);
    state.addTransition(automaton.getState(target.id), newTransition.attributes.labels[0].attrs.text.text, newTransition.id);
    console.log(automaton);
}

return automatonCtrl;

})();