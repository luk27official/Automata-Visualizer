
var automaton = null;
var diagram = null;
var selectedCell = null;
var selectedState = null;
var insertedAlphabet = null;
var newTransition = null;
var controller = null;
var epsilon = '\u03B5';

var graph = new joint.dia.Graph;
var switcher = new Switcher();
var loader = new Loader();
var toolbarAction = 'select';
var width = "100vw";
var height = "85vh";
var paper = generateNewPaper();

setUp();

function setUp() {
    let config = loader.checkSource({switcher: switcher, graph: graph, paper: paper});
    automaton = config.automaton;
    controller = config.controller;
    diagram = config.diagram;

    $('#' + 'DFA').removeClass('active');
    document.getElementById(automaton.toString()).className = 'active';

    registerEventHandlers(paper, graph);
    jQueryInit();
}

function jQueryInit() {
    $('#toolbar').hide();
    $('.button-collapse').sideNav({
        menuWidth: 450, // Default is 300
        edge: 'left', // Choose the horizontal origin
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true // Choose whether you can drag to open on touch screens
        }
    );
    $('.modal').modal({
        dismissible: false, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 200, // Transition in duration
        outDuration: 200, // Transition out duration
        ready: function(modal, trigger) {
            if(automaton instanceof PDA) $('#symbol-input').focus();
            else if(automaton instanceof Turing) $('#tape-read-input').focus();
        }
    }
    );
    $('select').material_select();
    $('#set-name').click(function() {
        if(!selectedCell) return;
        setStateName();
    });

    $('.rhs').keypress(addNewGrammarRule);
    $('.rhs').val(epsilon);
}

function setStateName() {
    let name = prompt('New name for state:');
    automaton.updateStateName(selectedState, name);
    selectedCell.attr({
        text: {text: name}
    });
    console.log(automaton);
}

 function setTransition() {
     controller.setTransition(newTransition, automaton, diagram);
}

function changeTransition() {
    controller.changeTransition(newTransition, automaton, diagram);
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

    if(!controller.setAlphabet(automaton)) return;
    word = prompt('Insert the word to evaluate:');
    if(word === null) return;

    status = automaton.run(word);
    console.log(status.msg);
    alert(status.msg);
}

function convertToDFA() {
     let newAutomaton = controller.convertToDFA(automaton);
     if(!newAutomaton) return;

     loadAutomatonInNewTab(newAutomaton, 'DFA');
}

function convertToRegex() {
    controller.convertToRegex(automaton);
}

function convertRegexToNFAE() {
    let generatedAutomaton = controller.convertRegexToNFAE();

    if(!generatedAutomaton) return;

    loadAutomatonInNewTab(generatedAutomaton, 'NFAE');
}

function addAutomatonToOperandsList() {
    let operandName = '';
    let clone = null;
    let renderJson = {};

    operandName = prompt('Name for the automaton:');
    if(!operandName) return;
    clone = automaton.clone();
    if(!clone) { alert('No initial state has been set.'); return; }
    renderJson = graph.toJSON();
    regularLanguaje.operands.push({operand: clone, name: operandName, type: automaton.toString(), renderJson: renderJson});
    $('#operands').append('<a href="#!" class="collection-item">' + operandName + '</a>');
    console.log(regularLanguaje.operands);
}

function intersectAutomata() {
    let result = controller.executeRegularOperation(automaton, regularLanguaje.properties.intersect);
    if(!result) return;

    loadAutomatonInNewTab(result, 'DFA');
}

function combineAutomata() {
    let result = controller.executeRegularOperation(automaton, regularLanguaje.properties.unite, automaton);
    if(!result) return;

    loadAutomatonInNewTab(result, 'DFA');
}

function complementAutomata() {
     let result = controller.complementAutomata(automaton);
     if(!result) return;

    loadAutomatonInNewTab(result, 'DFA');
}

function clearGrammar() {
    grammarCtrl.clearGrammar();
}

function saveAutomaton(item) {
    let jsons = [];
    let automaton_json = automaton.toJSON();
    let automaton_visuals = graph.toJSON();
    automaton_json.type = automaton.toString();
    jsons.push(automaton_json);
    jsons.push(automaton_visuals);
    saveToDisk(item, jsons, "automaton.json");
}

function saveGrammar(item) {
    grammarCtrl.saveGrammar(item);
}

function saveToDisk(item, valueToSave, fileName) {
    $(item).attr("href", "data:application/octet-stream," + encodeURIComponent(JSON.stringify(valueToSave))).attr("download", fileName);
}

function importAutomaton(event) {
    importFile(event, processImportedGraph);
}

function importGrammar(event) {
    importFile(event, grammarCtrl.processImportedGrammar);
}

function processImportedGraph(json) {
    let newAutomaton = JSON.parse(json);
    let logic = newAutomaton[0];
    let visuals = newAutomaton[1];
    changeAutomaton(document.getElementById(logic.type));
    automaton.buildFromJSON(logic);
    graph.fromJSON(visuals);
}

function importFile(event, importCallback) {
    let input = event.target;
    let reader = new FileReader();
    let json = '';

    reader.onload = function() {
      importCallback(reader.result);
    };
    reader.readAsText(input.files[0]);
}

function minimize() {
     let newAutomaton = controller.minimize(automaton);

    if(!newAutomaton) return;

    loadAutomatonInNewTab(newAutomaton, 'DFA');
}

function addNewGrammarRule(e) {
    if(e.which == 13) grammarCtrl.addNewRule();    
}

function convertGrammarToPDA() {
    let pda = grammarCtrl.convertToPDA();
    loadAutomatonInNewTab(pda, 'PDA');
}

function convertToGrammar() {
    let productions = null;

    if(!controller.setAlphabet(automaton)) return;
    productions = controller.convertToGrammar(automaton);

    grammarCtrl.fillGrammarModal(productions);
}

function loadAutomatonInNewTab(newAutomaton, type) {
    automatonJson = newAutomaton.toJSON();
    automatonJson.type = type;
    dataToSend = JSON.stringify(automatonJson);
    window.open('index.html?data=' + encodeURIComponent(dataToSend));
}

function clearGraph() {
    changeAutomaton(document.getElementById(automaton.toString()));
}

function changeAutomaton(item) {
    if(!confirm('Changing the type of Automaton will erase the current graph. Are you sure about this?')) return;
    $('#' + automaton.toString()).removeClass('active');
    item.className = 'active';
    resetGraph(item);
}

function resetGraph(item) {
    let bundle = null;
    let div = '';

    $('#toolbar').hide();
    graph.clear();
    paper.remove();
    toolbarAction = 'select';
    selectedCell = null;
    insertedAlphabet = null;
    paper = null;

    bundle = switcher.getNewAutomaton(item.id);
    automaton = bundle.automaton;
    controller = bundle.controller;
    div = document.createElement('div');
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
    graph.on('remove', events.remove);
    graph.on('change:target', events.changeTarget);
    graph.on('change:source', events.changeSource);
    graph.on('change:position', events.changePosition);
}
