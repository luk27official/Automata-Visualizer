
function State(name) {
    this.getName = getName;
    this.setName = setName;
    this.setBehavior = setBehavior;
    this.addTransition = addTransition;
    this.removeTransition = removeTransition;
    this.isInitial = isInitial;
    this.isFinal = isFinal;

    this._name = name;
    this._transitions = [];
    this._initial = false;
    this._final = false;
    this._makeInitial = makeInitial;
    this._makeFinal = makeFinal;
}

function getName() {
    return this._name;
}

function setName(name) {
    this._name = name;
}

function setBehavior(behavior) {
    if(!behavior.initial && behavior.initial !== undefined) {
        this._initial = false;
        return {circle: {fill: '#5755a1'}};
    }
    if(!behavior.final && behavior.final !== undefined) {
        this._final = false;
        return {circle: {'stroke-width': 2}};
    }

    if(behavior.initial) {
        this._initial = true;
        return {circle: {fill: '#000000'}};
    }
    if(behavior.final) {
        this._final = true;
        return {circle: {'stroke-width': 4}};
    }
}

function addTransition(target, symbol, id) {
    let transition = new Transition(this, target, symbol, id);
    this._transitions.push(transition);
}

function removeTransition(id) {
    for(let i = 0; i < this._transitions.length; i++) {
        if(this._transitions[i].getId() === id) {
            this._transitions.splice(i, 1);
            break;
        }
    }
}

function isInitial() {
    return this._initial;
}

function isFinal() {
    return this._final;
}

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