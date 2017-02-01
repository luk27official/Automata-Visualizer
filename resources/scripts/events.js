
var events = {
    blankPointerClick: blankPointerClick,
    cellPointerDown: cellPointerDown,
    cellPointerClick: cellPointerClick,
    changeSourceChangeTarget:changeSourceChangeTarget
};

function blankPointerClick(evt, x, y) {
    if(selectedCell && !selectedCell.initial) selectedCell.attr({circle: {fill: '#5755a1'}});
    selectedCell = null;
    $('#toolbar').hide();
    if(toolbarAction === 'insert') {
        automaton.insertState({
            position: { x: x, y: y },
            size: { width: 60, height: 60 }
        });
    }
}

function cellPointerDown(cellView, evt, x, y) {
    if(toolbarAction === 'remove') {
        automaton.removeState(cellView.model);
        $('#toolbar').hide();
        selectedCell = null;
    }
}

function cellPointerClick(cellView, evt, x, y) {
    if(toolbarAction === 'select') {
        if(cellView.model.isElement()) {
            if(selectedCell && !selectedCell.initial) selectedCell.attr({circle: {fill: '#5755a1'}});
            selectedCell = cellView.model;
            selectedCell.attr({circle: {fill: 'green'}});
            document.getElementById('initialCheckbox').checked = selectedCell.initial;
            document.getElementById('finalCheckbox').checked = selectedCell.final;
            $('#toolbar').show();
        }
    }
}

function changeSourceChangeTarget(link) {
    if(link.get('source').id && link.get('target').id && !link.attributes.labels) {
        setTransitionSymbol(link);
    }
}