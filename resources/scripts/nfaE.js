
var NFAE = (function() {

    function NFAE() {
        NFA.call(this);

        this.convertToDFA = convertToDFA;

        this._processWord = processWord;
        this._getEpsilonClosure = getEpsilonClosure;
        this._convert = convert;
        this._runPass = runPass;
        this._createDFAState = createDFAState;
    }

    NFAE.prototype = Object.create(NFA.prototype);
    NFAE.prototype.constructor = NFAE;

    function convertToDFA() {
        let dfa = null;
        let status = this._checkInitialState();
        if(!status.valid) return status;

        dfa = new DFA();
        dfa._states =  this._convert();
        dfa._initialState = dfa._states[0];
        dfa.resetStateInternalNames();

        return dfa;
    }

    function convert() {
        let initialState = [this.getInitialState()];
        let names = [];
        let newStates = [];
        let pendingStates = [];
        let states = [];
        let final = false;
        let initialStateName = '';
        let nfae = this;

        this._getEpsilonClosure(initialState);
        names = initialState.map(function(state) {
            return state.getInternalName(); 
        });
        initialStateName = names.join();
        initialState = new State(initialStateName, 0);
        initialState.setInternalName(initialStateName);
        states = names.map(function(name) {
            return nfae._getStateByInternalName(name);
        });
        for(let state in states) {
            if(states[state].isFinal()) {final = true; break;}
        }
        initialState.setBehavior({initial: true, final: final});
        newStates.push(initialState);

        this._runPass(newStates, pendingStates, initialState);
        for(let i = 0; i < pendingStates.length; i++) {
            this._runPass(newStates, pendingStates, pendingStates[i]);
        }

        console.log(newStates);
        return newStates;
        //return this.toJSON(newStates);
    }

    function runPass(newStates, pendingStates, currentState) {
        let names = currentState.getInternalName();
        let newStateName = [];
        let states = [];
        let constructedInternalName = '';

        names = names.split(',');

        for(let symbol in this._alphabet) {
            newStateName = this._getTargetNamesForNewState(names, this._alphabet[symbol]);
            states = [];
            
            if(!newStateName.length) continue;
            for(let name in newStateName) {
                states.push(this._getStateByInternalName(newStateName[name]));
            }

            this._getEpsilonClosure(states);
            constructedInternalName = states.map(function(state) {
                return state.getInternalName(); 
            });

            constructedInternalName = constructedInternalName.join();

            if(this._checkIfNewStateIsCurrentState(currentState, constructedInternalName, this._alphabet[symbol])) continue;
            if(this._checkIfNewStateExists(newStates, constructedInternalName, currentState, this._alphabet[symbol])) continue;

            this._createDFAState(states, constructedInternalName, pendingStates, this._alphabet[symbol], currentState, newStates);
        }
    }

    function createDFAState(states, constructedInternalName, pendingStates, symbol, currentState, newStates) {
        let displayName = [];
        let newState = null;
        let final = false;

        for(let state in states) {
            if(!final) final = states[state].isFinal();
            displayName.push(states[state].getName());
        }
        
        newState = new State(displayName.join(), 0);
        newState.setInternalName(constructedInternalName);
        newState.setBehavior({final: final});
        currentState.addTransition(newState, symbol, 0);
        newStates.push(newState);
        pendingStates.push(newState);
    }

    function processWord(word) {
        let currentStates = [this._initialState];

        for(let symbol in word) {
            this._getEpsilonClosure(currentStates);
            currentStates = this._consumeSymbol(currentStates, word[symbol]);
        }
        
        this._getEpsilonClosure(currentStates);
        return this._isWordValid(currentStates);
    }

    function getEpsilonClosure(currentStates) {
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

    return NFAE;
})();