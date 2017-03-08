
var grammarCtrl = (function() {

function addNewRule(e) {
    let tr = null;

    if(e.which != 13) return;
    tr = $('#grammar-rules tbody tr:last-child td:last-child');
    if(!tr.find('input').val()) return;


    $('#grammar-rules > tbody:last-child').append('<tr><td><div class="input-field inline"><input placeholder="Production" type="text" autofocus></div></td><td><div class="input-field "><input type="text" value="&#x2192" disabled></div></td><td><div class="input-field inline"><input class="terminal" placeholder="Terminal" type="text"></div></td></tr>');
    $('.terminal').keypress(addNewGrammarRule);
}

return {
    addNewRule: addNewRule
}

})();