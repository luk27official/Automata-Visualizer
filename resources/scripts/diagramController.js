
var automaton = null;
var currentAutomaton = null;
var diagram = null;
var selectedCell = null;
var selectedState = null;
var insertedAlphabet = null;

var graph = new joint.dia.Graph;
var switcher = new Switcher();
var loader = new Loader();
var toolbarAction = 'select';
var width = 1920;
var height = 1080;
var paper = generateNewPaper();

setUp();

$('#toolbar').hide();

$('#set-name').click(function() {
    if(!selectedCell) return;
    setStateName();
});

function setUp() {
    let config = loader.checkSource({switcher: switcher, graph: graph, paper: paper});
    automaton = config.automaton;
    currentAutomaton = config.currentAutomaton;
    diagram = config.diagram;

    registerEventHandlers(paper, graph);
}

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
    diagram.curveTransition(source.id, target.id, link, state);
    state.addTransition(automaton.getState(target.id), name, link.id);
    console.log(automaton);
}

function setInitial(checkbox) {
    automaton.updateStateType(selectedState, {initial: checkbox.checked}, diagram.removeInitialSymbol);
    if(selectedState.isInitial()) diagram.setInitialSymbol(selectedCell);
    else diagram.removeInitialSymbol();
    console.log(automaton);
}

function setFinal(checkbox) {
    automaton.updateStateType(selectedState, {final: checkbox.checked}, diagram.removeInitialSymbol);
    if(selectedState.isFinal()) selectedCell.attr({circle: {'stroke-width': 4}});
    else selectedCell.attr({circle: {'stroke-width': 2}});
    console.log(automaton);
}

function evaluateWord() {
    let status;
    if(!insertedAlphabet) insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else {
        insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', insertedAlphabet);
    }

    if(!insertedAlphabet) return
    automaton._alphabet = insertedAlphabet.split(" ");
    let word = prompt('Insert the word to evaluate:');
    //if(!word) return;

    status = automaton.run(word);
    console.log(status.msg);
    alert(status.msg);
}

function convertToDFA() {
    let status;
    let dataToSend;
    let newStates = [];

    if(!insertedAlphabet) insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else {
        insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', insertedAlphabet);
    }

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

    automaton = switcher.getNewAutomaton(item.id);
    let div = document.createElement('div');
    div.id = 'paper';
    document.body.appendChild(div);
    paper = generateNewPaper();
    diagram = new Diagram(graph, paper, automaton);
    registerEventHandlers(paper, graph);   
}

function generateNewPaper() {
    let paper = new joint.dia.Paper({
        el: $('#paper'),
        width: width,
        height: height,
        gridSize: 1,
        model: graph,
        defaultLink: new joint.shapes.fsa.Arrow,
        clickThreshold: 1,
        linkPinning: false
    });

    return paper;
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
