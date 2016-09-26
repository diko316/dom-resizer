'use strict';

var SELECTION = require("./selection.js"),
    EVENT = require("./event.js"),
    DIMENSION = require("./dimension.js"),
    CSS = require("./css.js"),
    PREFIX = 'dom-resizer',
    STATE_IDLE = 0,
    STATE_ATTACHED = 1,
    STATE_INSIDE = 2,
    STATE_RESIZE = 3,
    STATE_DESTROYED = 4;

function Resizer() {
    var me = this,
        win = window,
        doc = win.document,
        container = doc.createElement('div'),
        mask = doc.createElement('div'),
        
        originalMouseMove = me.onMouseMove,
        originalMouseDown = me.onMouseDown,
        originalMouseUp = me.onMouseUp;
    
    container.className = PREFIX + '-container';
    mask.className = PREFIX + '-mask';
    
    me.dom = container;
    me.mask = mask;
    me.status = STATE_IDLE;
    
    doc.body.appendChild(mask);
    mask.appendChild(container);
    
    container = null;
    mask = null;
    doc = null;
    win = null;
    
    me.onMouseMove = function () {
        originalMouseMove.apply(me, arguments);
    };
    
    me.onMouseDown = function () {
        originalMouseDown.apply(me, arguments);
    };
    
    me.onMouseUp = function () {
        originalMouseUp.apply(me, arguments);
    };
}

Resizer.prototype = {
    dom: void(0),
    mask: void(0),
    attached: void(0),
    handlerAttribute: PREFIX + '-handler',
    handlerSize: 10,
    status: STATE_DESTROYED,
    selectionDisabled: false,
    showClass: PREFIX + '-show',
    
    startOffset: null,
    handlerPosition: null,
    
    constructor: Resizer,
    
    onMouseMove: function (event) {
        var me = this,
            InsideState = STATE_INSIDE,
            AttachedState = STATE_ATTACHED,
            element = me.attached,
            pageOffset = DIMENSION.eventPageOffset(event),
            info = me.getCursorInfo(element,
                                    pageOffset[0],
                                    pageOffset[1]),
            updateCursor = true;

        switch (me.status) {
        case AttachedState:
            if (info.inside) {
                me.status = InsideState;
            }
            break;
        
        case InsideState:
            if (!info.inside) {
                me.status = AttachedState;
            }
            break;
        case STATE_RESIZE:
            updateCursor = false;
            SELECTION.clear();
            me.onSyncSize(event);
            
            break;
        }
        
        if (updateCursor) {
            me.applyCursor(info);
        }
        
    },
    
    onMouseDown: function (event) {
        var me = this,
            dim = DIMENSION;
            
        var container, info, offset, subject;
            
        if (me.status === STATE_INSIDE) {
            subject = me.attached;
            offset = DIMENSION.eventPageOffset(event);
            info = me.getCursorInfo(subject, offset[0], offset[1]);
            
            me.applyCursor(info);
            
            container = me.dom;
            CSS.add(me.mask, me.showClass);
            dim.setBox(container,
                    dim.box(subject)
                );
            offset = dim.eventPageOffset(event);
            offset[2] = info.left;
            offset[3] = info.top;
            offset[4] = info.width;
            offset[5] = info.height;
            
            me.startDimension = offset;
            
            me.handlerPosition = info.handler;
            me.status = STATE_RESIZE;
            
        }
    },
    
    onMouseUp: function () {
        var me = this,
            dim = DIMENSION;
        var box;
        
        if (me.status === STATE_RESIZE) {
            box = dim.box(me.dom);
            CSS.remove(me.mask, me.showClass);
            delete me.startOffset;
            me.status = STATE_ATTACHED;

            EVENT.dispatch(me.attached, 'domresize', {
                'resizeLeft': box[0],
                'resizeTop': box[1],
                'resizeWidth': box[4],
                'resizeHeight': box[5]
            });
        }
    },
    
    applyCursor: function (info) {
        var me = this,
            dim = DIMENSION,
            attr = me.handlerAttribute,
            dom = me.dom,
            subject = me.attached;
        var body;
        
        if (dom) {
            body = me.dom.ownerDocument.body;
        
            if (info.inside) {
                body.setAttribute(attr, info.handler);
                // sync size
                dim.setBox(me.dom,
                        dim.box(subject)
                    );
            }
            else {
                body.removeAttribute(attr);
            }
            
            
            
        }
        body = null;
        dom = null;
    },
    
    onSyncSize: function (event) {
        var me = this,
            dim = DIMENSION,
            M = Math,
            start = me.startDimension,
            handler = me.handlerPosition,
            container = me.dom,
            current = dim.eventPageOffset(event);
            
        var diffX, diffY, bt, bl, bw, bh, l, t, w, h, x, y;
        
        if (start && handler) {
            
            bl = start[2];
            bt = start[3];
            bw = start[4];
            bh = start[5];
            
            diffX = current[0] - start[0];
            diffY = current[1] - start[1];
            
            l = t = w = h = null;
            x = handler.charAt(0);
            y = handler.charAt(1);

            switch (x) {
            case 'l':
                l = M.min(bl + diffX, bl + bw);
                w = bw - diffX;
                break;
            case 'c':
                h = y === 't' ?
                        bh - diffY : bh + diffY;
                break;
            case 'r':
                w = bw + diffX;
            }
            
            switch (y) {
            case 't':
                t = M.min(bt + diffY, bt + bh);
                h = bh - diffY;
                break;
            case 'm':
                w = x === 'l' ?
                        bw - diffX : bw + diffX;
                break;
            case 'b':
                h = bh + diffY;
            }
            
            if (l !== null || t !== null) {
                dim.setOffset(container, l, t);
            }
            if (w !== null || h !== null) {
                dim.setSize(container, w, h);
            }
            
        }
        
    },
    
    isInside: function (element, ex, ey) {
        return this.getCursorInfo(element, ex, ey).inside;
    },
    
    getCursorInfo: function (element, ex, ey) {
        var dimension = DIMENSION.box(element),
            handleSize = this.handlerSize,
            M = Math,
            info = {
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                width: 0,
                height: 0,
                handleSize: handleSize,
                handler: null,
                inside: false
            };
            
        var t, b, l, r, it, ib, il, ir,
            gl, lr, gt, lb, lil, gir, lit, gib;
        
        if (dimension) {
            l = info.left = dimension[0];
            t = info.top = dimension[1];
            r = info.right = dimension[2];
            b = info.bottom = dimension[3];
            
            info.width = dimension[4];
            info.height = dimension[5];
            
            
            gl = ex > l;
            lr = ex < r;
            gt = ey > t;
            lb = ey < b;
            
    
            // check if cursor is inside the outer dimensions
            if (gl && lr && gt && lb) {
            
                il = M.min(l + handleSize, r);
                ir = M.max(l, r - handleSize);
                it = M.min(t + handleSize, b);
                ib = M.max(t, b - handleSize);
                
                lil = ex < il;
                gir = ex > ir;
                lit = ey < it;
                gib = ey > ib;
                
                if (lil || gir || lit || gib) {
                    
                    info.inside = true;
                    info.handler = (gl && lil ?
                                        'l' :
                                        lr && gir ?
                                            'r' : 'c') +
                                    (gt && lit ?
                                        't' :
                                        lb && gib ?
                                            'b' : 'm');
                }
            
            }
            
        }

        return info;
    },
    
    isBusy: function () {
        switch (this.status) {
        case STATE_RESIZE:
        /* falls through */
        case STATE_DESTROYED:
            return true;
        }
        return false;
    },
    
    attach: function (element, event) {
        var me = this,
            eventMgr = EVENT,
            attachedState = STATE_ATTACHED;
        var last;
        
        switch (me.status) {
        case attachedState:
            last = me.attached;
            if (last === element) {
                break;
            }
            me.detach();
            
        /* falls through */
        case STATE_IDLE:
            me.attached = element;
            me.status = attachedState;
            last = element.ownerDocument;
            eventMgr.on(last, 'mousemove', me.onMouseMove);
            eventMgr.on(last, 'mousedown', me.onMouseDown);
            eventMgr.on(last, 'mouseup', me.onMouseUp);
            me.onMouseMove(event);
        }
        last = null;
        return me;
        
    },
    
    detach: function () {
        var me = this,
            eventMgr = EVENT;
        var dom;
        if (me.status === STATE_ATTACHED) {
            dom = me.attached.ownerDocument;
            eventMgr.un(dom, 'mousemove', me.onMouseMove);
            eventMgr.un(dom, 'mousedown', me.onMouseDown);
            eventMgr.un(dom, 'mouseup', me.onMouseUp);
            delete me.attached;
            me.status = STATE_IDLE;
        }
        dom = null;
        return me;
    },
    
    destroy: function () {
        var me = this,
            mask = this.mask;
            
        me.detach();
        mask.parentNode.removeChild(mask);
        mask = null;
        delete me.status;
        delete me.dom;
        delete me.mask;
        return me;
        
    }
};


module.exports = Resizer;
