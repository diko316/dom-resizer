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
        EVENT.on(body, 'mouseover', onMouseOver);
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
        EVENT.un(body, 'mouseover', onMouseOver);
    }
    
    body = null;
}



function onMouseOver(evt) {
    var resizer = RESIZER,
        dimension = DIMENSION,
        target = resizer.attached;
    var element, offset, x, y;
    
    if (!target) {
        element = dimension.eventTarget(evt);
        offset = dimension.eventPageOffset(evt);
        x = offset[0];
        y = offset[1];
        
        for (; element; element = element.parentNode) {
            console.log(x, y,'? ', 1 === element.__dom_resizer && resizer.isInside(element, x, y));
            if (1 === element.__dom_resizer &&
                resizer.isInside(element, x, y)) {
                resizer.attach(element);
                break;
            }
        }
    }
    
}







module.exports = EXPORTS;