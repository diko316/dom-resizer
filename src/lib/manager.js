'use strict';

var EVENT = require("./event.js"),
    DIMENSION = require("./dimension.js"),
    COMPONENT = require("./component.js"),
    EXPORTS = observe,
    RESIZER = null,
    OBSERVE_COUNT = 0,
    OBSERVING = false;

function observe(element) {
    
    if (EVENT.isObservable(element)) {
        
        // create session
        if (element.__dom_resizer !== 1) {
            element.__dom_resizer = 1;
            OBSERVE_COUNT++;
        }
        
        startObserving();
        
    }
    return EXPORTS;
}

function unobserve(element) {
    
    if (EVENT.isObservable(element)) {
        
        // create session
        if (element.__dom_resizer === 1) {
            delete element.__dom_resizer;
            OBSERVE_COUNT--;
        }
        
        if (!OBSERVE_COUNT) {
            stopObserving();
        }
        
    }
    return EXPORTS;
}





function startObserving() {
    var body = window.document.body;
    
    if (!OBSERVING) {
        if (!RESIZER) {
            RESIZER = new COMPONENT();
        }
        OBSERVING = true;
        EVENT.on(body, 'mouseover', onFindAttachment);
        EVENT.on(body, 'mousemove', onFindAttachment);
    }
    body = null;
    //event.on(element, 'mouseover', onMouseOver);
}

function stopObserving() {
    var body = window.document.body,
        component = RESIZER;
    
    if (OBSERVING) {
        OBSERVING = false;
        if (component) {
            component.detach();
        }
        EVENT.un(body, 'mouseover', onFindAttachment);
        EVENT.un(body, 'mousemove', onFindAttachment);
    }
    
    body = null;
}



function onFindAttachment(evt) {
    var resizer = RESIZER,
        dimension = DIMENSION;
    var dom, offset, x, y;
    
    if (!resizer.isBusy()) {
        dom = dimension.eventTarget(evt);
        offset = dimension.eventPageOffset(evt);
        x = offset[0];
        y = offset[1];
        
        for (; dom && dom.nodeType === 1; dom = dom.parentNode) {
            if (1 === dom.__dom_resizer &&
                resizer.isInside(dom, x, y)) {
                resizer.attach(dom, evt);
                break;
            }
        }
    }
    
}





module.exports = EXPORTS;
EXPORTS.unset = unobserve;
