
var Switcher = (function() {

function Switcher() {
    this.setNewAutomaton = setNewAutomaton;
    this.generateNewAutomaton = generateNewAutomaton;
}

function setNewAutomaton(name) {
    return generateNewAutomaton(name); 
}

function generateNewAutomaton(name) {
    switch(name) {
        case 'DFA':
            $('#convertDFA').hide();
            return new DFA();
        
        case 'NFA':
            $('#convertDFA').show();
            return new NFA();

        case 'NFAE':
            $('#convertDFA').hide();
            return new NFAE();
        
        default:
            return null;
    }
}

return Switcher;

})();