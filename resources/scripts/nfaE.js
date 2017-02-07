
var NFAE = (function() {

    function NFAE() {
        NFA.call(this);

        this.run = run;

        this._processWord = processWord;
        this._setEpsilonClosure = setEpsilonClosure;
        this._checkIfStateAlreadyExists = checkIfStateAlreadyExists;
    }

    NFAE.prototype = Object.create(NFA.prototype);
    NFAE.prototype.constructor = NFAE;

    function run(word) {
        let status = this._runValidations(word);
        if(!status.valid) return status;

        return this._processWord(word);
    }

    function processWord(word) {
        let currentStates = [this._initialState];

        for(let symbol in word) {
            this._setEpsilonClosure(currentStates);
            currentStates = this._consumeSymbol(currentStates, word[symbol]);
        }
        
        this._setEpsilonClosure(currentStates);
        return this._isWordValid(currentStates);
    }

    function setEpsilonClosure(currentStates) {
        let transitions = [];

        for(let i = 0; i < currentStates.length; i++) {
            transitions = currentStates[i]._getTransitions();
            for(let transition in transitions) {
                if(transitions[transition].getSymbol() !== 'E' && transitions[transition].getSymbol() !== 'e') continue;
                if(this._checkIfStateAlreadyExists(currentStates, transitions[transition].getTarget())) continue;
                currentStates.push(transitions[transition].getTarget());
            }
        }
    }

    function checkIfStateAlreadyExists(currentStates, state) {
        for(let visited in currentStates) {
            if(currentStates[visited].getId() === state.getId()) return true;
        }

        return false;
    }

    return NFAE;
})();