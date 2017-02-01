
var toolbarAction = 'select';
var currentAutomaton = 'DFA';
var selectedCell = null;
var insertedAlphabet = null;

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 1800,
    height: 1000,
    gridSize: 1,
    model: automaton,
    defaultLink: new joint.shapes.fsa.Arrow,
    clickThreshold: 1
});

$('#toolbar').hide();

$('#set-name').click(function() {
    if(!selectedCell) return;
    setStateName();
});

registerEventHandlers(paper, automaton);

function setStateName() {
    let name = prompt('New name for state:');
    let result = automaton.updateStateName(selectedCell, name);
}

function setTransitionSymbol(link) {
    let name = prompt('Symbol:');
    if(!name) {
        link.remove();
        return;
    }
    link.label(0, {
        position: 0.5,
        attrs: {
            //rect: {fill: 'white'},
            text: {fill: 'blue', text: name}
        }
    });
}

function setInitial(checkbox) {
    console.log('initial - ', checkbox.checked);
    automaton.updateStateType(selectedCell, {initial: checkbox.checked});
}

function setFinal(checkbox) {
    console.log('final - ', checkbox.checked);
    automaton.updateStateType(selectedCell, {final: checkbox.checked});
}

function evaluateWord() {
    let status;
    if(!insertedAlphabet) insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', insertedAlphabet);

    if(!insertedAlphabet) return
    automaton.alphabet = insertedAlphabet.split(" ");
    let word = prompt('Insert the word to evaluate:');
    if(!word) return;

    status = automaton.run(word);
    console.log(status.msg);
    alert(status.msg);
}

function saveAutomaton() {
    let json = JSON.stringify(automaton.toJson());
}

function changeAutomaton(item) {
    if(!confirm('Changing the type of Automaton will erase the current graph. Are you sure about this?')) return;
    $('#' + currentAutomaton).removeClass('active');
    currentAutomaton = item.id;
    item.className = 'active';
    resetGraph(item);
}

function resetGraph(item) {
    $('#toolbar').hide();
    automaton.clear();
    paper.remove();
    toolbarAction = 'select';
    selectedCell = null;
    insertedAlphabet = null;
    paper = null;
    setNewAutomaton(item.id);
}

function setNewAutomaton(name) {
    automaton = generateNewAutomaton(name);
    
    let div = document.createElement('div');
    div.id = 'paper';
    document.body.appendChild(div);

    paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 1800,
    height: 1000,
    gridSize: 1,
    model: automaton,
    defaultLink: new joint.shapes.fsa.Arrow
    });

    registerEventHandlers(paper, automaton);    
}

function generateNewAutomaton(name) {
    switch(name) {
        case 'DFA':
            return new DFA();
        
        case 'NFA':
            return new NFA();
        
        default:
            return null;
    }
}

function registerEventHandlers(paper, graph) {
    paper.on('blank:pointerclick', events.blankPointerClick);
    paper.on('cell:pointerdown', events.cellPointerDown);
    paper.on('cell:pointerclick', events.cellPointerClick);
    graph.on('change:source change:target',events.changeSourceChangeTarget);
}