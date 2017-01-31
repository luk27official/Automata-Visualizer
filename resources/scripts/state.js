
var State = joint.shapes.fsa.State.extend({
    initial: false,
    final: false,
    getName: getName,
    setName: setName,
    setBehavior: setBehavior
});

function getName() {
    return this.attributes.attrs.text.text;
}

function setName(name) {
    this.attr({ text: { text: name } });
}

function setBehavior(behavior) {
    if(!behavior.initial && behavior.initial !== undefined) {
        this.attr({circle: {fill: '#5755a1'}});
        this.initial = false;
        return;
    }
    if(!behavior.final && behavior.final !== undefined) {
        this.final = false;
        //change style
        this.attr({
            circle: {'stroke-width': 2}
        });
    }

    if(behavior.initial) {
        this.initial = true;
        makeInitial.call(this);
    }
    if(behavior.final) {
        this.final = true;
        makeFinal.call(this);
    }
}

// function makeNormal() {
//     this.markup = '<circle/>';
//     this.attr({
//         circle: { 'stroke-width': 2, fill: '#5755a1' },
//         text: { 'font-weight': '600', fill: 'white' }
//     });
// }

function makeInitial() {
    //this.markup = '<g class="rotatable"><g class="scalable"><circle/></g></g>';
    this.attr({
        circle: {
            //transform: 'translate(10, 10)',
            //r: 10,
            fill: '#000000'
        }
    });
}

function makeFinal() {
    this.attr({
        circle: {'stroke-width': 4}
    });
}