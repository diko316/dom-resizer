'use strict';

var EVENT = require("./event.js"),
    DIMENSION = require("./dimension.js"),
    CSS = require("./css.js"),
    PREFIX = 'dom-resizer',
    HANDLE_SIZE = 20,
    MARKUP = [
            '<div class="', PREFIX, '-tl" handle="tl"></div>',
            '<div class="', PREFIX, '-tm" handle="tm"></div>',
            '<div class="', PREFIX, '-tr" handle="tm"></div>',
            '<div class="', PREFIX, '-ml" handle="ml"></div>',
            '<div class="', PREFIX, '-mr" handle="mr"></div>',
            '<div class="', PREFIX, '-bl" handle="bl"></div>',
            '<div class="', PREFIX, '-bm" handle="bm"></div>',
            '<div class="', PREFIX, '-br" handle="br"></div>'
        ];
    
function isInbound(element, ex, ey) {
    var dimension = DIMENSION.box(element),
        handleSize = HANDLE_SIZE;
        
    var t, b, l, r, it, ib, il, ir;
    
    if (dimension) {
        l = dimension[0];
        t = dimension[1];
        r = dimension[2];
        b = dimension[3];

        // check if cursor is inside the outer dimensions
        if (l < ex && r > ex && t < ey && b > ey) {
        
            il = Math.min(l + handleSize, r);
            ir = Math.max(l, r - handleSize);
            it = Math.min(t + handleSize, b);
            ib = Math.max(t, b - handleSize);
            
            // check if cursor is outside the inner dimensions
            return !(il < ex && ir > ex && it < ey && ib > ey);
        
        }
        
    }
    
    
    return false;
}

    

function Resizer() {
    var me = this,
        win = window,
        doc = win.document,
        div = doc.createElement('div'),
        originalMouseMove = me.onMouseMove,
        originalMouseOut = me.onMouseOut;
    
    div.className = PREFIX + '-container';
    div.innerHTML = MARKUP.join('');
    
    me.dom = div;
    
    doc.body.appendChild(div);
    
    div = null;
    doc = null;
    win = null;
    
    me.onMouseMove = function () {
        originalMouseMove.apply(me, arguments);
    };
    me.onMouseOut = function () {
        originalMouseOut.apply(me, arguments);
    };
}

Resizer.prototype = {
    
    attached: void(0),
    handler: void(0),
    showClass: PREFIX + '-show',
    
    constructor: Resizer,
    
    onMouseMove: function (evt) {
        var me = this,
            element = me.attached,
            pageOffset = DIMENSION.eventPageOffset(evt);
            
        if (element) {
            if (me.isInside(element, pageOffset[0], pageOffset[1])) {
                me.onShowHandles(element);
            }
            else {
                me.onHideHandles(element);
            }
        }
        
    },
    
    onMouseOut: function (evt) {
        var me = this,
            element = me.attached,
            pageOffset = DIMENSION.eventPageOffset(evt);
            
        if (element) {
            if (me.isInside(element, pageOffset[0], pageOffset[1])) {
                me.onShowHandles(element);
            }
            else {
                me.onHideHandles(element);
            }
        }
    },
    
    onShowHandles: function (element) {
        var container = this.dom,
            dim = DIMENSION,
            box = dim.box(element);
        
        CSS.add(container, this.showClass);
        
        dim.setBox(container, box);
        
        //console.log('show! ', container.className);
    },
    
    onHideHandles: function (element) {
        var container = this.dom;
        
        CSS.remove(container, this.showClass);
        
    },
    
    isInside: function (element, ex, ey) {
        var dimension = DIMENSION.box(element),
            handleSize = HANDLE_SIZE;
            
        var t, b, l, r, it, ib, il, ir;
        
        if (dimension) {
            l = dimension[0];
            t = dimension[1];
            r = dimension[2];
            b = dimension[3];
    
            // check if cursor is inside the outer dimensions
            if (l < ex && r > ex && t < ey && b > ey) {
            
                il = Math.min(l + handleSize, r);
                ir = Math.max(l, r - handleSize);
                it = Math.min(t + handleSize, b);
                ib = Math.max(t, b - handleSize);
                
                // check if cursor is outside the inner dimensions
                return !(il < ex && ir > ex && it < ey && ib > ey);
            
            }
            
        }

        return false;
    },
    
    attach: function (element) {
        var last = this.attached;
        
        if (last !== element) {
            // detach
            if (last) {
                this.detach();
            }
            
            this.attached = element;
            EVENT.on(element.ownerDocument.body, 'mousemove', this.onMouseMove);
            EVENT.on(element.ownerDocument.body, 'mouseout', this.onMouseOut);
            
        }
        return this;
        
    },
    
    detach: function () {
        var last = this.attached;
        if (last) {
            EVENT.un(last.ownerDocument.body, 'mousemove', this.onMouseMove);
            EVENT.on(last.ownerDocument.body, 'mouseout', this.onMouseOut);
            delete this.attached;
        }
    },
    
    destroy: function () {
        
    }
};


module.exports = Resizer;
