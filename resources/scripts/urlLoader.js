
var urlLoader = (function() {

function constructAutomatonFromUrl(options, renderAutomaton) {
    let data = null;
    let automaton = null;
    let diagram = null;
    let currentAutomaton = '';

    data = window.location.search.slice(1).split('=')[1];
    data = JSON.parse(decodeURIComponent(data));
    console.log(data);
    automaton = options.switcher.getNewAutomaton(data.type);
    currentAutomaton = data.type;
    diagram = new Diagram(options.graph, options.paper, automaton);
    automaton.buildFromJSON(data);
    console.log(automaton);
    
    return {
        diagram: diagram,
        automaton: automaton,
        currentAutomaton: currentAutomaton
    }
}

return {
    constructAutomatonFromUrl: constructAutomatonFromUrl
}

})();