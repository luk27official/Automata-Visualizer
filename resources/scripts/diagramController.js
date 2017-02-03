
var automaton = new DFA();
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
    clickThreshold: 1,
    linkPinning: false
});

$('#toolbar').hide();

$('#set-name').click(function() {
    if(!selectedCell) return;
    setStateName();
});

registerEventHandlers(paper, graph);

function setStateName() {
    let name = prompt('New name for state:');
    if(!automaton.updateStateName(selectedState, name).valid) {
        alert('A state with that name already exists.');
        return;
    }
    selectedCell.attr({
        text: {text: name}
    });
    console.log(automaton);
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
    console.log(automaton);
}

function setInitial(checkbox) {
    console.log('initial - ', checkbox.checked);
    automaton.updateStateType(selectedState, {initial: checkbox.checked}, updateElementAppearance);
    console.log(automaton);
}

function setFinal(checkbox) {
    console.log('final - ', checkbox.checked);
    automaton.updateStateType(selectedState, {final: checkbox.checked}, updateElementAppearance);
    console.log(automaton);
}

function updateElementAppearance(attr) {
    selectedCell.attr(attr);
}

function evaluateWord() {
    let status;
    if(!insertedAlphabet) insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', insertedAlphabet);

    if(!insertedAlphabet) return
    automaton._alphabet = insertedAlphabet.split(" ");
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
    graph.clear();
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
    model: graph,
    defaultLink: new joint.shapes.fsa.Arrow,
    clickThreshold: 1
    });

    registerEventHandlers(paper, graph);    
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

function getElementText(cell) {
    return cell.attributes.attrs.text.text
}

function removeLink(link) {
    if(!link.get('target').id) return;
    let source = graph.getCell(link.attributes.source.id);
    let state = automaton.getState(getElementText(source));
    state.removeTransition(link.id);
    console.log(automaton);
}

function registerEventHandlers(paper, graph) {
    paper.on('blank:pointerclick', events.blankPointerClick);
    paper.on('cell:pointerdown', events.cellPointerDown);
    paper.on('cell:pointerclick', events.cellPointerClick);
    graph.on('change:source change:target', events.changeSourceChangeTarget);
    graph.on('remove', events.remove);
    graph.on('change:target', events.changeTarget);
    graph.on('change:source', events.changeSource);
}