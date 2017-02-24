
var Loader = (function() {

function Loader() {
    this.checkSource = checkSource;

    this._startNormal = startNormal;
    this._renderAutomaton = renderAutomaton;
    this._generateVisualStates = generateVisualStates;
    this._generateVisualLinks = generateVisualLinks;
}

function checkSource(options) {
    let data = window.location.search;
    let config = null;

    if(data) {
        config = urlLoader.constructAutomatonFromUrl(options, this._renderAutomaton);
        return this._renderAutomaton(config.diagram, config.automaton, config.currentAutomaton);
    }

    return this._startNormal(options);
}

function startNormal(options) {
    let automaton = new DFA();
    let currentAutomaton = 'DFA';
    let diagram = new Diagram(graph, paper, automaton);

    return {
        automaton: automaton,
        currentAutomaton: currentAutomaton,
        diagram: diagram
    }
}

function renderAutomaton(diagram, automaton, currentAutomaton) {
    let states = automaton.getStates(); 

    this._generateVisualStates(states, diagram);
    this._generateVisualLinks(states, diagram);

    return {
        automaton: automaton,
        diagram: diagram,
        currentAutomaton: currentAutomaton
    };
}

function generateVisualStates(states, diagram) {
    let element = null;
    let x = y = 0;

    for(let state in states) {
        x = Math.floor((Math.random() * 1900) + 1);
        y = Math.floor((Math.random() * 900) + 1);
        element = diagram.generateVisualElement(x, y, states[state].getName());
        states[state]._id = element.id;
        if(states[state].isInitial()) {
            diagram.setInitialSymbol(element);
        }
        
        if(states[state].isFinal()) element.attr({circle: {'stroke-width': 4}});

        // x += 100;
        // if(x >= width - 200) { x = 100; y += 100; }
    }
}

function generateVisualLinks(states, diagram) {
    let transitions = [];
    let sourceId = targetId = symbol = 0;
    let link = null;

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
}

return Loader;

})();