
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
            return new DFA();
        
        case 'NFA':
            $('#convertDFA').show();
            return new NFA();

        case 'NFAE':
            $('#convertDFA').show();
            return new NFAE();

        case 'PDA':
            $('#convertDFA').hide();
            return new PDA();
        
        default:
            return null;
    }
}

return Switcher;

})();