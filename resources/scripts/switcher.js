
var Switcher = (function() {

function Switcher() {

}

function changeAutomaton(item) {
    if(!confirm('Changing the type of Automaton will erase the current graph. Are you sure about this?')) return;
    $('#' + currentAutomaton).removeClass('active');
    currentAutomaton = item.id;
    item.className = 'active';
    resetGraph(item);
}

function setNewAutomaton(name) {
    automaton = generateNewAutomaton(name);
    
    let div = document.createElement('div');
    div.id = 'paper';
    document.body.appendChild(div);

    paper = new joint.dia.Paper({
    el: $('#paper'),
    width: width,
    height: height,
    gridSize: 1,
    model: graph,
    defaultLink: new joint.shapes.fsa.Arrow,
    clickThreshold: 1,
    linkPinning: false
    });

    registerEventHandlers(paper, graph);    
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