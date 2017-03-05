
var Switcher = (function() {

function Switcher() {
    this.getNewAutomaton = getNewAutomaton;
    this.generateNewAutomaton = generateNewAutomaton;
}

function getNewAutomaton(name) {
    return generateNewAutomaton(name); 
}

function generateNewAutomaton(name) {
    switch(name) {
        case 'DFA':
            $('#convertDFA').hide();
            return {automaton: new DFA(), controller: new dfaCtrl()}
            //return new DFA();
        
        case 'NFA':
            $('#convertDFA').show();
            return {automaton: new NFA(), controller: new nfaCtrl()}
            //return new NFA();

        case 'NFAE':
            $('#convertDFA').show();
            return {automaton: new NFAE(), controller: new nfaCtrl()}
            //return new NFAE();

        case 'PDA':
            $('#convertDFA').hide();
            return {automaton: new PDA(), controller: new pdaCtrl()}
            //return new PDA();
        
        default:
            return null;
    }
}

return Switcher;

})();