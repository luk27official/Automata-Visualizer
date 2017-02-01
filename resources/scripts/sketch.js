
var toolbarAction = 'select';
var currentAutomaton = 'NFA';
var selectedCell = null;
var insertedAlphabet = null;

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 1800,
    height: 1000,
    gridSize: 1,
    model: automaton,
    defaultLink: new joint.shapes.fsa.Arrow,
    clickThreshold: 1
});

$('#toolbar').hide();

$('#set-name').click(function() {
    if(!selectedCell) return;
    setStateName();
});

paper.on('blank:pointerclick', function(evt, x, y) {
    if(selectedCell && !selectedCell.initial) selectedCell.attr({circle: {fill: '#5755a1'}});
    selectedCell = null;
    $('#toolbar').hide();
    if(toolbarAction === 'insert') {
        automaton.insertState({
            position: { x: x, y: y },
            size: { width: 60, height: 60 }
        });
    }
});

paper.on('cell:pointerdown', function(cellView, evt, x, y) {
    if(toolbarAction === 'remove') {
        automaton.removeState(cellView.model);
        $('#toolbar').hide();
        selectedCell = null;
    }
});

paper.on('cell:pointerclick', function(cellView, evt, x, y) {
    console.log('click');
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
});

automaton.on('change:source change:target', function(link) {
    if(link.get('source').id && link.get('target').id && !link.attributes.labels) {
        setTransitionSymbol(link);
    }
});

function setStateName() {
    let name = prompt('New name for state:');
    let result = automaton.updateStateName(selectedCell, name);
    //if(!result) alert('A state with that name already exists!');
}

function setTransitionSymbol(link) {
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
}

function setInitial(checkbox) {
    console.log('initial - ', checkbox.checked);
    automaton.updateStateType(selectedCell, {initial: checkbox.checked});
}

function setFinal(checkbox) {
    console.log('final - ', checkbox.checked);
    automaton.updateStateType(selectedCell, {final: checkbox.checked});
}

function evaluateWord() {
    let status;
    if(!insertedAlphabet) insertedAlphabet = prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.');
    else prompt('Insert the alphabet supported by the automaton. Separate each symbol with a space.', insertedAlphabet);

    if(!insertedAlphabet) return
    automaton.alphabet = insertedAlphabet.split(" ");
    let word = prompt('Insert the word to evaluate:');
    if(!word) return;

    status = automaton.run(word);
    console.log(status.msg);
    alert(status.msg);
}

function saveAutomaton() {
    let json = JSON.stringify(automaton.toJson());
}

function changeAutomaton(item) {
    // $('#' + currentAutomaton).removeClass('active');
    // currentAutomaton = item.id;
    // item.className = 'active';
    // automaton.clear();
    // paper.remove();
    // setNewAutomaton(item.id);
}

function setNewAutomaton(name) {
    // switch(name) {
    //     case 'DFA':
    //         automaton = new DFA();
    //         console.log('DFA');
    //         break;
        
    //     case 'NFA':
    //         automaton = new NFA();
    //         console.log('NFA');
    //         break;
    // }
    // paper = null;
    // let div = document.createElement('paper');
    // document.body.appendChild(div);
    // console.log(document.getElementById('paper'));

    // paper = new joint.dia.Paper({
    // el: $('#paper'),
    // width: 1800,
    // height: 1000,
    // gridSize: 1,
    // model: automaton,
    // defaultLink: new joint.shapes.fsa.Arrow
    // });
    // console.log(document.getElementById('paper'));
}