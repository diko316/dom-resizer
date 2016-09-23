'use strict';

var EVENT = require("./event.js"),
    DIMENSION = require("./dimension.js"),
    PREFIX = 'dom-resizer',
    HANDLE_SIZE = 20,
    POSITION_INSIDE = 1,
    POSITION_INSIDE_HANDLER = 2,
    POSITION_OUTSIDE = 3,
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
            if (!(il < ex && ir > ex && it < ey && ib > ey)) {
                return POSITION_INSIDE_HANDLER;
            }
            
            return POSITION_INSIDE;
        
        }
        else {
            return POSITION_OUTSIDE;
        }
        
    }
    
    
    return false;
}

    

function Resizer() {
    var me = this,
        win = window,
        doc = win.document,
        div = doc.createElement('div'),
        originalMouseMove = me.onMouseMove;
    
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
}

Resizer.prototype = {
    
    attached: void(0),
    handler: void(0),
    showClass: PREFIX + '-show',
    
    constructor: Resizer,
    
    onMouseMove: function (evt) {
        var element = this.attached,
            pageOffset = DIMENSION.eventPageOffset(evt),
            status = isInbound(element, pageOffset[0], pageOffset[1]);

        switch (status) {
        case POSITION_INSIDE_HANDLER:
            this.onShowHandles(element);
            console.log('inside!');
            break;
        
        default:
            this.onHideHandles(element);
            console.log('outside!');
        }
        
    },
    
    onShowHandles: function (element) {
        var container = this.dom,
            str = container.className,
            dim = DIMENSION,
            showClass = this.showClass,
            box = dim.box(element);
        
        if (str.indexOf(showClass) === -1) {
            container.className = str + ' ' + showClass;
        }
        
        dim.setBox(container, box);
        
        //console.log('show! ', container.className);
    },
    
    onHideHandles: function (element) {
        var container = this.dom,
            str = container.className,
            showClass = this.showClass,
            index = str.indexOf(showClass),
            len = str.length;
        var trail;
            
        if (index !== -1) {
            trail = index + showClass.length;
            container.className = str.substring(0, index -1) + (
                                    len > trail ?
                                        str.substring(trail, len) : ''
                                );
        }
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
            
        }
        return this;
        
    },
    
    detach: function () {
        var last = this.attached;
        if (last) {
            EVENT.un(last.ownerDocument.body, 'mousemove', this.onMouseMove);
            delete this.attached;
        }
    },
    
    destroy: function () {
        
    }
};


module.exports = Resizer;
