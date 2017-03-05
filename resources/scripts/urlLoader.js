
var urlLoader = (function() {

function constructAutomatonFromUrl(options, renderAutomaton) {
    let data = null;
    let bundle = null;
    let automaton = null;
    let controller = null;
    let diagram = null;
    let currentAutomaton = '';

    data = window.location.search.slice(1).split('=')[1];
    data = JSON.parse(decodeURIComponent(data));
    bundle = options.switcher.getNewAutomaton(data.type);
    currentAutomaton = data.type;
    diagram = new Diagram(options.graph, options.paper, bundle.automaton);
    bundle.automaton.buildFromJSON(data);
    
    return {
        diagram: diagram,
        automaton: bundle.automaton,
        controller: bundle.controller,
        currentAutomaton: currentAutomaton
    }
}

return {
    constructAutomatonFromUrl: constructAutomatonFromUrl
}

})();