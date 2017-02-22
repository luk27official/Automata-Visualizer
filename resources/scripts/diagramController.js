
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
$(".button-collapse").sideNav();
$('.button-collapse').sideNav({
      menuWidth: 400, // Default is 300
      edge: 'left', // Choose the horizontal origin
      closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
      draggable: true // Choose whether you can drag to open on touch screens
    }
  );

$('#set-name').click(function() {
    if(!selectedCell) return;
    setStateName();
});

function setUp() {
    let config = loader.checkSource({switcher: switcher, graph: graph, paper: paper});
    automaton = config.automaton;
    currentAutomaton = config.currentAutomaton;
    diagram = config.diagram;

    $('#' + 'DFA').removeClass('active');
    document.getElementById(currentAutomaton).className = 'active';

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
    let word = '';

    setAlphabet();
    word = prompt('Insert the word to evaluate:');
    //if(!word) return;

    status = automaton.run(word);
    console.log(automaton.clone());
    console.log(status.msg);
    alert(status.msg);
}

function convertToDFA() {
    let status;
    let dataToSend;
    let newStates = [];

    setAlphabet();
    newStates = automaton.convertToDFA();
    console.log(newStates);
    //Validar que newStates tenga los nuevos estados
    dataToSend = JSON.stringify({type: 'DFA', states: newStates});
    window.open('file:///C:/Users/alefe/Documents/Code/JS/Automata/index.html?data=' + encodeURIComponent(dataToSend));
}

function convertToRegex() {
    if(!automaton.getStates().length) return;

    setAlphabet();
    let clone = automaton.clone();
    if(!clone) {
        alert('No initial state has been set!');
        return;
    }
    let regex = RegEx.convertToRegex(clone);
    $('#regexText').val(regex)
}

function convertRegexToNFAE() {
    let expression = $('#regexText').val();
    let generatedAutomaton = null;
    let json = {};

    if(!expression) return;

    generatedAutomaton = RegEx.toNFAE(expression);
    json = automaton.toJSON(generatedAutomaton.getStates());
    console.log(json);
    dataToSend = JSON.stringify({type: 'NFAE', states: json});
    window.open('file:///C:/Users/alefe/Documents/Code/JS/Automata/index.html?data=' + encodeURIComponent(dataToSend));
}

function setAlphabet() {
    if(!insertedAlphabet) insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else {
        insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', insertedAlphabet);
    }

    if(!insertedAlphabet) return
    automaton._alphabet = insertedAlphabet.split(" ");
}

function saveAutomaton(item) {
    let jsons = [];
    let automaton_json = automaton.toJSON();
    let automaton_visuals = graph.toJSON();
    jsons.push(automaton_json);
    jsons.push(automaton_visuals);
    $(item).attr("href", "data:application/octet-stream," + encodeURIComponent(JSON.stringify(jsons))).attr("download", "automaton.json");
}

function importAutomaton(event) {
    let input = event.target;
    let reader = new FileReader();
    let json = '';

    reader.onload = function() {
      json = reader.result;
      graph.fromJSON(JSON.parse(json))
    };
    reader.readAsText(input.files[0])
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
    graph.on('change:position', events.changePosition);
}
