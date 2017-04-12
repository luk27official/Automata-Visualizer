
var nfaeCtrl = (function() {

function nfaeCtrl() {
    nfaCtrl.call(this);

    this.setTransition = setTransition;
}

nfaeCtrl.prototype = Object.create(nfaCtrl.prototype);
nfaeCtrl.prototype.constructor = nfaeCtrl;

function setTransition(newTransition, automaton, diagram) {
    let source = newTransition.getSourceElement();
    let target = newTransition.getTargetElement();
    let name = prompt('Symbol:');
    if(!name) {
        name = epsilon;
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

return nfaeCtrl;

})();