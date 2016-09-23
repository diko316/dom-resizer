'use strict';

function getBox(element) {
    var offset = getOffset(element),
        size = getSize(element),
        x = offset[0],
        y = offset[1],
        w = size[0],
        h = size[1];
    return [x, y, x + w, y + h, w, h];
}

function getOffset(element) {
    var bound = 'getBoundingClientRect';
    var raw, scrolled;
    
    if (bound in element) {
        raw = element[bound]();
        scrolled = getScrollFromChrome();
        return [raw.left + scrolled[0], raw.top + scrolled[1]];
    }
}

function getSize(element) {
    var bound = 'getBoundingClientRect';
    var raw;
    
    if (bound in element) {
        raw = element[bound]();
        return [raw.width, raw.height];
    }
    else {
        return [parseInt(element.offsetWidth, 10) || 0,
                parseInt(element.offsetHeight, 10) || 0];
    }
}

function setOffset(element, x, y) {
    var parent = element.offsetParent;
    var parentOffset;
    
    if (parent) {
        parentOffset = getOffset(parent);
        x -= parentOffset[0];
        y -= parentOffset[1];
    }
    
    element.style.top = y + 'px';
    element.style.left = x + 'px';
}

function setSize(element, width, height) {
    element.style.width = width + 'px';
    element.style.height = height + 'px';
}

function setBox(element, box) {
    var w = false,
        x = false;
    var x, y, h, len;
    
    if (box instanceof Array) {
        len = box.length;
        
        if (len > 5) {
            w = box[4];
            h = box[5];
        }
        else if (len > 3) {
            w = box[2] - x;
            h = box[3] - y;
        }
        
        if (len > 1) {
            x = box[0];
            y = box[1];
        }
        
        
        if (w !== false) {
            setSize(element, w, h);
        }
        
        if (x !== false) {
            setOffset(element, x, y);
        }
        
    }
}


function getScrollFromChrome() {
    var win = window,
        found = [0,0],
        doc = win.document,
        root = doc.documentElement,
        body = doc.body;
    
    
    if ('pageXOffset' in win) {
        found[0] = win.pageXOffset || 0;
        found[1] = win.pageYOffset || 0;
    }
    else {
        found[0] = root.scrollLeft || 0;
        found[1] = root.scrollTop || 0;
    }
    
    found[0] -= root.clientLeft || body.clientLeft || 0;
    found[1] -= root.clientTop || body.clientTop || 0;
    
    body = null;
    doc = null;
    win = null;
    return found;
    
}

function getEventObjectPageOffset(evt) {
    var scrolled = getScrollFromChrome();
    return [scrolled[0] + (parseInt(evt.clientX, 10) || 0),
            scrolled[1] + (parseInt(evt.clientY, 10) || 0)];
}

function getEventObjectTarget(evt) {
    return evt.target || evt.srcElement;
}

module.exports = {
    offset: getOffset,
    size: getSize,
    box: getBox,
    setOffset: setOffset,
    setSize: setSize,
    setBox: setBox,
    pageScroll: getScrollFromChrome,
    eventPageOffset: getEventObjectPageOffset,
    eventTarget: getEventObjectTarget
};