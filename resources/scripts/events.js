
var events = {
    blankPointerClick: blankPointerClick,
    cellPointerDown: cellPointerDown,
    cellPointerClick: cellPointerClick,
    changeSourceChangeTarget:changeSourceChangeTarget,
    changeTarget: changeTarget,
    changeSource: changeSource,
    changePosition: changePosition,
    remove: remove
};

function blankPointerClick(evt, x, y) {
    if(selectedState) selectedCell.attr({circle: {fill: '#5755a1'}});
    selectedCell = null;
    selectedState = null;
    $('#toolbar').hide();
    if(toolbarAction === 'insert') {
        let element = diagram.generateVisualElement(x, y, 'q' + automaton.getCounter());

        graph.addCell(element);
        automaton.insertState(element.id);
        console.log(automaton);
    }
}

function cellPointerDown(cellView, evt, x, y) {
    if(toolbarAction === 'remove') {
        cellView.model.remove();
        automaton.removeState(cellView.model.attributes.attrs.text.text);
        $('#toolbar').hide();
        selectedCell = null;
        selectedState = null;
        console.log(automaton);
    }
}

function cellPointerClick(cellView, evt, x, y) {
    if(toolbarAction === 'select') {
        if(cellView.model.isElement()) {
            if(selectedState) selectedCell.attr({circle: {fill: '#5755a1'}});

            selectedState = automaton.getState(cellView.model.id);
            selectedCell = cellView.model;
            selectedCell.attr({circle: {fill: 'green'}});
            document.getElementById('initialCheckbox').checked = selectedState.isInitial();
            document.getElementById('finalCheckbox').checked = selectedState.isFinal();
            $('#toolbar').show();
        }
    }
}

function changeSourceChangeTarget(link) {
    if(link.get('source').id && link.get('target').id && !link.attributes.labels) {
        newTransition = link;
        if(currentAutomaton === 'PDA') $('#modal-pda').modal('open');
        else setTransition();
    }
}

function changeTarget(link) {
    if(link.get('target').id) {
        console.log('cambio');
    }
}

function changeSource(link) {
    if(link.get('source').id) {
        console.log('cambio');
    }
}

function changePosition(element) {
    let links = graph.getConnectedLinks(element, {outbound: true});
    let posX = element.get('position').x;
    let posY = element.get('position').y;
    let counterX = 20;
    let counterY = 20;

     _.each(links, function(link) {
        if(link.hasLoop()) {
            let vertices = link.get('vertices');
            if (vertices && vertices.length) {
                let newVertices = [];
                _.each(vertices, function(vertex) {
                    newVertices.push({ x: (posX-vertex.x)+vertex.x+counterX, y: posY-40 });
                    counterX += 20;
                });
                link.set('vertices', newVertices);
            }
        }
    });
}

function remove(cell) {
    if(cell.isLink()) diagram.removeLink(cell);
}