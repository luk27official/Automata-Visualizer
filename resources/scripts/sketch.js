
var automaton = new Automaton();
var graph = new joint.dia.Graph;
var toolbarAction = 'select';
var currentAutomaton = 'DFA';
var selectedCell = null;
var selectedState = null;
var insertedAlphabet = null;

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 1800,
    height: 1000,
    gridSize: 1,
    model: graph,
    defaultLink: new joint.shapes.fsa.Arrow,
    clickThreshold: 1
});

$('#toolbar').hide();

$('#set-name').click(function() {
    if(!selectedCell) return;
    setStateName();
});

registerEventHandlers(paper, graph);

function setStateName() {
    let name = prompt('New name for state:');
    let result = automaton.updateStateName(selectedState, name);
    selectedCell.attr({
        text: {text: name}
    });
    console.log(automaton._states);
}

function setTransition(link) {
    let source = link.getSourceElement();
    let target = link.getTargetElement();
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

    let state = automaton.getState(getElementText(source));
    state.addTransition(automaton.getState(getElementText(target)), name, link.id);
    console.log(automaton._states);
}

function setInitial(checkbox) {
    console.log('initial - ', checkbox.checked);
    automaton.updateStateType(selectedState, {initial: checkbox.checked}, updateElementAppearance);
    console.log(automaton._states);
}

function setFinal(checkbox) {
    console.log('final - ', checkbox.checked);
    automaton.updateStateType(selectedState, {final: checkbox.checked}, updateElementAppearance);
    console.log(automaton._states);
}

function updateElementAppearance(attr) {
    selectedCell.attr(attr);
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
    defaultLink: new joint.shapes.fsa.Arrow,
    clickThreshold: 1
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

function getElementText(cell) {
    return cell.attributes.attrs.text.text
}