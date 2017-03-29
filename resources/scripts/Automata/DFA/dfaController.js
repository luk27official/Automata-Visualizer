
var dfaCtrl = (function() {

function dfaCtrl() {
    automatonCtrl.call(this);
}

dfaCtrl.prototype = Object.create(automatonCtrl.prototype);

return dfaCtrl;

})();