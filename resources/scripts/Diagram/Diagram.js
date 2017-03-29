
var Diagram = (function() {

function Diagram(graph, paper, automaton) {
    this.graph = graph;
    this.paper = paper;
    this.automaton = automaton;

    this.removeInitialSymbol = removeInitialSymbol;
    this.removeLink = removeLink;
    this.setInitialSymbol = setInitialSymbol;
    this.generateVisualElement = generateVisualElement;
    this.generateVisualLink = generateVisualLink;
    this.curveTransition = curveTransition;
}

function removeInitialSymbol() {
    this.graph.getCell(this.automaton.getInitialState().getId()).getEmbeddedCells()[0].remove();
}

function removeLink(link) {
    if(!link.get('target').id) return;
    let source = this.graph.getCell(link.attributes.source.id);
    let state = this.automaton.getState(source.id);
    state.removeTransition(link.id);
    console.log(this.automaton);
}

function setInitialSymbol(selectedCell) {
    let initialSymbol =  new joint.shapes.basic.initialSymbol({
        position: { x: selectedCell.get('position').x - 40, y: selectedCell.get('position').y + 50 },
        size: { width: 40, height: 40 }
    }); 

    initialSymbol.attr({
        polygon: { fill: '#000000', 'stroke-width': 2, stroke: 'black' }
    });
    this.graph.addCell(initialSymbol);
    selectedCell.embed(initialSymbol);
}

function generateVisualElement(x, y, text) {
    let element = new joint.shapes.fsa.State({
        position: { x: x, y: y },
        attrs: {
            text: {text: text}
        }
    });

    this.graph.addCell(element);
    return element;
}

function generateVisualLink(sourceId, targetId, symbol, state) {    
    let link = new joint.shapes.fsa.Arrow({
        source: { id: sourceId },
        target: { id: targetId },
        labels: [{ position: .5, attrs: { text: { text: symbol || '', 'font-weight': 'bold' } } }],
        vertices: []
    });

    this.graph.addCell(link);
    this.curveTransition(sourceId, targetId, link, state);
    return link;
}

function curveTransition(sourceId, targetId, link, state) {
    if(sourceId === targetId) {
        let leftX = 0;
        let rightX = 0;
        let vertexY = 0;
        let posX = link.getSourceElement().get('position').x;
        let posY = link.getSourceElement().get('position').y;
        
        state.transitionY += 30;
        state.transitionX += 30;
        leftX = posX-state.transitionX;
        rightX = posX+(state.transitionX*2);
        vertexY = posY-state.transitionY;
        link.set('vertices', (link.get('vertices') || []).concat([{ x: leftX, y: vertexY}, {x: rightX, y: vertexY}]));
    }
}

return Diagram;

})();