
var automaton;
var currentAutomaton;
var graph = new joint.dia.Graph;
var toolbarAction = 'select';
var selectedCell = null;
var selectedState = null;
var insertedAlphabet = null;
var width = 1800;
var height = 1000;

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: width,
    height: height,
    gridSize: 1,
    model: graph,
    defaultLink: new joint.shapes.fsa.Arrow,
    clickThreshold: 1,
    linkPinning: false
});

let data = window.location.search
if(data) {
    constructAutomatonFromUrlParameter();
}
else {
    automaton = new DFA();
    currentAutomaton = 'DFA';
}

$('#toolbar').hide();

$('#set-name').click(function() {
    if(!selectedCell) return;
    setStateName();
});

registerEventHandlers(paper, graph);

function setStateName() {
    let name = prompt('New name for state:');
    automaton.updateStateName(selectedState, name);
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

    let state = automaton.getState(source.id);
    state.addTransition(automaton.getState(target.id), name, link.id);
    console.log(automaton);
}

function setInitial(checkbox) {
    automaton.updateStateType(selectedState, {initial: checkbox.checked}, removeInitialSymbol);
    if(selectedState.isInitial()) setInitialSymbol(selectedCell.get('position').x, selectedCell.get('position').y);
    else removeInitialSymbol();
    console.log(automaton);
}

function setFinal(checkbox) {
    automaton.updateStateType(selectedState, {final: checkbox.checked}, removeInitialSymbol);
    if(selectedState.isFinal()) selectedCell.attr({circle: {'stroke-width': 4}});
    else selectedCell.attr({circle: {'stroke-width': 2}});
    console.log(automaton);
}

function removeInitialSymbol() {
    graph.getCell(automaton.getInitialState().getId()).getEmbeddedCells()[0].remove();
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

function convertToDFA() {
    let status;
    let dataToSend;
    let newStates = [];

    if(!insertedAlphabet) insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', insertedAlphabet);

    if(!insertedAlphabet) return
    automaton._alphabet = insertedAlphabet.split(" ");
    newStates = automaton.convertToDFA();
    console.log(newStates);
    dataToSend = JSON.stringify({type: 'DFA', states: newStates});
    window.open('file:///C:/Users/alefe/Documents/Code/JS/Automata/index.html?data=' + encodeURIComponent(dataToSend));
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
    let state = automaton.getState(source.id);
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

function setInitialSymbol(x, y) {
    let initialSymbol =  new joint.shapes.basic.initialSymbol({
        position: { x: x - 40, y: y + 50 },
        size: { width: 40, height: 40 }
    }); 

    initialSymbol.attr({
        polygon: { fill: '#000000', 'stroke-width': 2, stroke: 'black' }
    });
    graph.addCell(initialSymbol);
    selectedCell.embed(initialSymbol);
}

function constructAutomatonFromUrlParameter() {
    let data = window.location.search.slice(1).split('=')[1];
    data = JSON.parse(decodeURIComponent(data));
    console.log(data);
    automaton = generateNewAutomaton(data.type);
    currentAutomaton = data.type;
    automaton.buildFromJSON(data);
    console.log(automaton);
    renderAutomaton();
}

function renderAutomaton() {
    let states = automaton.getStates();
    let transitions = [];
    let element = null;
    let link = null;
    let sourceId = targetId = symbol = 0;
    let x = y = 100;

    for(let state in states) {
        element = generateVisualElement(x, y, states[state].getName());
        states[state]._id = element.id;
        x += 100;
        if(x >= width - 200) { x = 100; y += 100; }
    }

    for(let state in states) {
        transitions = states[state]._getTransitions();
        for(let transition in transitions) {
            sourceId =  transitions[transition].getSource().getId();
            targetId = transitions[transition].getTarget().getId();
            symbol = transitions[transition].getSymbol();
            
            link = generateVisualLink(sourceId, targetId, symbol);
            transitions[transition]._id = link.id;
        }
    }
}

function generateVisualElement(x, y, text) {
    let element = new joint.shapes.fsa.State({
        position: { x: x, y: y },
        size: { width: 60, height: 60 },
        attrs: {
            text: {text: text}
        }
    });

    graph.addCell(element);
    return element;
}

function generateVisualLink(sourceId, targetId, symbol, vertices) {    
    let link = new joint.shapes.fsa.Arrow({
        source: { id: sourceId },
        target: { id: targetId },
        labels: [{ position: .5, attrs: { text: { text: symbol || '', 'font-weight': 'bold' } } }],
        vertices: vertices || []
    });

    graph.addCell(link);
    return link;
}
