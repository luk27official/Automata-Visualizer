
function Transition(source, target, symbol, id) {
    this._source = source;
    this._target = target;
    this._symbol = symbol;
    this._id = id;

    this.getSource = getSource;
    this.setSource = setSource;
    this.getTarget = getTarget;
    this.setTarget = setTarget;
    this.getSymbol = getSymbol;
    this.setSymbol = setSymbol;
    this.getId = getId;
}

function getSource() {
    return this._source;
}

function setSource(state) {
    this._source = state;
}

function getTarget() {
    return this._target;
}

function setTarget(state) {
    this._target = state;
}

function getSymbol() {
    return this._symbol;
}

function setSymbol(symbol) {
    this._symbol = symbol;
}

function getId() {
    return this._id;
}