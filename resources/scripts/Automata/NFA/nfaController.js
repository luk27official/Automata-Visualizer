
var nfaCtrl = (function() {

function nfaCtrl() {
    automatonCtrl.call(this);
}

nfaCtrl.prototype = Object.create(automatonCtrl.prototype);
nfaCtrl.prototype.convertToDFA = convertToDFA;
nfaCtrl.prototype.constructor = nfaCtrl;

function convertToDFA(automaton) {
    if(!this.setAlphabet(automaton)) return null;
    return automaton.convertToDFA();
}

return nfaCtrl;

})();