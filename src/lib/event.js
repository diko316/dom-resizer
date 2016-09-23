'use strict';

var INFO = {
        initialized: false,
        browser: false,
        ieEvent: false
    },
    EVENT = null;

function initialize() {
    var info = INFO;
    
    if (!info.initialized) {
        info.initialized = true;
    
        onInitialize(info);
        EVENT = {
            first: null,
            last: null
        };
        
    }
    
    if (!info.browser) {
        throw new Error("Event System is only for browsers");
    }
    
}

function onInitialize(info) {
    var win, doc;
    
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        doc = document;
        win = window;
        
        if (doc === win.document) {
            info.browser = true;
            
            if (!win.addEventListener && win.attachEvent) {
                info.ieEvent = true;
            }
            
        }
    }
    doc = null;
    win = null;
    
}

function ieWrapHandler(handler) {
    function EventHandler() {
        return handler(window.event);
    }
    return EventHandler;
}

function add(dom, name, handler) {
    var event = EVENT,
        original = handler,
        before = event.last,
        current = [dom, name, original, handler];
        
        
    if (INFO.ieEvent) {
        dom.attachEvent('on' + name,
                        current[3] = ieWrapHandler(handler));
    }
    else {
        dom.addEventListener(name, handler, false);
    }
    
    current.live = true;
    current.next = null;
    current.before = before;
    
    if (before) {
        before.next = current;
    }
    else {
        event.first = before;
    }
    
    event.last = current;
    
}

function removeNode(current) {
    var event = EVENT,
        dom = current[0],
        name = current[1];
    var before, next;

        
    if (INFO.ieEvent) {
        dom.detachEvent('on' + name, current[3]);
    }
    else {
        dom.removeEventListener(name, current[3]);
    }
    
    before = current.before;
    next = current.next;
    
    if (before) {
        before.next = next;
    }
    
    if (next) {
        next.before = before;
    }
    
    if (event.first === current) {
        event.first = next;
    }
    
    if (event.last === current) {
        event.last = before;
    }
    
    dom = null;
    current.splice(0, 4);
    current = null;

}


function remove(dom, name, handler) {
    var node = find(dom, name, handler);
    if (node) {
        removeNode(node);
    }
    
}

function filter(dom, name, handler) {
    var event = EVENT,
        current = event.first,
        found = [],
        fl = 0,
        len = arguments.length,
        HAS_DOM = 0,
        HAS_NAME = 0,
        HAS_HANDLER = 0;
        
    switch (true) {
    case len > 2: HAS_HANDLER = 1;
    /* fall through */
    case len > 1: HAS_NAME = 1;
    /* fall through */
    case len > 0: HAS_DOM = 1;
    }
    
    for (; current; current = current.next) {
        if ((HAS_DOM && current[0] !== dom) ||
            (HAS_NAME && current[1] !== name) ||
            (HAS_HANDLER && current[2] === handler)) {
            continue;
        }
        found[fl++] = current;
    }
    return found;
}

function find(dom, name, handler) {
    var event = EVENT,
        current = event.first;
    
    for (; current; current = current.next) {
        if (current[0] === dom &&
            current[1] === name &&
            current[2] === handler) {
            return current;
        }
    }
    return void(0);
}

function isObservable(dom) {
    var method;
    
    initialize();
    
    if (dom) {
    
        method = INFO.ieEvent ? 'attachEvent' : 'addEventListener';
        
        switch (typeof dom) {
        case 'object':
        case 'function':
            if (method in dom && dom[method] instanceof Function) {
                return true;
            }
        }
    }
    return false;
}


function EventManager() {
}

EventManager.prototype = {
    constructor: EventManager,

    isObservable: isObservable,
    
    on: function (dom, event, handler) {
        initialize();
        
        if (!event || typeof event !== 'string') {
            throw new Error('Invalid [event] type parameter.');
        }
        
        if (!(handler instanceof Function)) {
            throw new Error('Invalid event [handler] parameter.');
        }
        
        if (!isObservable(dom)) {
            throw new Error('Invalid observable [dom] parameter.');
        }
        
        add(dom, event, handler);
        
        return this;
    
    },
    
    un: function (dom, event, handler) {
        initialize();
        
        if (!event || typeof event !== 'string') {
            throw new Error('Invalid [event] type parameter.');
        }
        
        if (!(handler instanceof Function)) {
            throw new Error('Invalid event [handler] parameter.');
        }
        
        if (!isObservable(dom)) {
            throw new Error('Invalid observable [dom] parameter.');
        }
        
        remove(dom, event, handler);
        
        return this;
    },
    
    filterAndRemove: function () {
        var remove = removeNode;
        var l, nodes;
        
        initialize();
        
        nodes = filter.apply(null, arguments);
        l = nodes.length;
        
        for (; l--;) {
            remove(nodes[l]);
        }
        return this;
    }
};



module.exports = new EventManager();