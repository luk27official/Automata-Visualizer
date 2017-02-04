
joint.shapes.basic.initialSymbol = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable"><g class="scalable"><polygon/></g></g>',

    defaults: joint.util.deepSupplement({

        type: 'basic.Rect',
        attrs: {
            'polygon': {
                fill: '#FFFFFF',
                stroke: 'black',
                width: 1, height: 1,
                transform: 'rotate(-90)',
                points:'0,0 100,0 50,100' }
        }

    }, joint.shapes.basic.Generic.prototype.defaults)
});