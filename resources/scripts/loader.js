
var Loader = (function() {

function Loader() {
    this.constructAutomatonFromUrl = constructAutomatonFromUrl;
}

function constructAutomatonFromUrl(switcher, graph, paper) {
    let data = null;
    let automaton = null;
    let diagram = null;
    let currentAutomaton = '';

    data = window.location.search.slice(1).split('=')[1];
    data = JSON.parse(decodeURIComponent(data));
    console.log(data);
    automaton = switcher.getNewAutomaton(data.type);
    currentAutomaton = data.type;
    diagram = new Diagram(graph, paper, automaton);
    automaton.buildFromJSON(data);
    console.log(automaton);
    return renderAutomaton(diagram, automaton, currentAutomaton);
}

function renderAutomaton(diagram, automaton, currentAutomaton) {
    let states = automaton.getStates();
    let transitions = [];
    let element = null;
    let link = null;
    let sourceId = targetId = symbol = 0;
    let x = y = 100;

    for(let state in states) {
        element = diagram.generateVisualElement(x, y, states[state].getName());
        states[state]._id = element.id;
        if(states[state].isInitial()) {
            diagram.setInitialSymbol(element);
        }
        
        if(states[state].isFinal()) element.attr({circle: {'stroke-width': 4}});

        x += 100;
        if(x >= width - 200) { x = 100; y += 100; }
    }

    for(let state in states) {
        transitions = states[state]._getTransitions();
        for(let transition in transitions) {
            sourceId =  transitions[transition].getSource().getId();
            targetId = transitions[transition].getTarget().getId();
            symbol = transitions[transition].getSymbol();

            link = diagram.generateVisualLink(sourceId, targetId, symbol, states[state]);
            transitions[transition]._id = link.id;
        }
    }

    return {
        automaton: automaton,
        diagram: diagram,
        currentAutomaton: currentAutomaton
    };
}

return Loader;

})();