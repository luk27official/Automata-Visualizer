
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
            $('#convert-to-grammar').hide();
            $('#automata-operations').show();
            $('#regex-operations').show();
            $('#regular-language-operations').show();
            return {automaton: new DFA(), controller: new dfaCtrl()}
        
        case 'NFA':
            $('#convert-to-grammar').hide();
            $('#convertDFA').show();
            $('#automata-operations').show();
            $('#regex-operations').show();
            $('#regular-language-operations').show();
            return {automaton: new NFA(), controller: new nfaCtrl()}

        case 'NFAE':
            $('#convert-to-grammar').hide();
            $('#convertDFA').show();
            $('#automata-operations').show();
            $('#regex-operations').show();
            $('#regular-language-operations').show();
            return {automaton: new NFAE(), controller: new nfaCtrl()}

        case 'PDA':
            $('#convertDFA').hide();
            //$('#automata-operations').hide();
            $('#minimize').hide();
            $('#regex-operations').hide();
            $('#regular-language-operations').hide();
            return {automaton: new PDA(), controller: new pdaCtrl()}
        
        default:
            return null;
    }
}

return Switcher;

})();