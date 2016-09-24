'use strict';

//var TRIM_RE = /^[^ \r\n\t]*(.+)[^ \r\n\t]*$/;
var SEPARATE_RE = /[ \r\n\t]*[ \r\n\t]+[ \r\n\t]*/,
    EM_OR_PERCENT_RE = /%|em/,
    WIDTH_RE = /width/i,
    NUMBER_RE = /\d/,
    CAMEL_RE = /[^a-z]+([a-z])/ig,
    DIMENSION_RE = /width|height|(margin|padding).*|border.+(Width|Radius)/,
    EXPORTS = {};



function addClass(element) {
    var classes = element.className,
        args = arguments,
        c = -1,
        l = args.length;
    var cl, name;
    
    classes = classes && typeof classes === 'string'?
                    classes.split(SEPARATE_RE) : [];
    
    cl = classes.length;
    for (; l--;) {
        name = args[++c];
        if (name && typeof name === 'string' &&
            classes.indexOf(name) === -1) {
            classes[cl++] = name;
        }
    }
    
    element.className = classes.join(' ');
    
    return EXPORTS;
}

function removeClass(element) {
    var classes = element.className,
        args = arguments,
        c = -1,
        l = args.length;
    var cl, total, name;
    
    classes = classes && typeof classes === 'string'?
                    classes.split(SEPARATE_RE) : [];
                    
    total = classes.length;
    
    for (; l--;) {
        name = args[++c];
        for (cl = total; cl--;) {
            if (name === classes[cl]) {
                classes.splice(cl, 1);
                total--;
            }
        }
    }
    
    element.className = classes.join(' ');
    return EXPORTS;
}

function getCurrentStyle(element) {
    var win = window,
        dimensionRe = DIMENSION_RE,
        args = arguments,
        c = -1,
        l = args.length,
        camel = camelize,
        pixelSize = getPixelSize,
        isW3c = true;
    var style, property, access, values, value, fontSize;
    
    if ('getComputedStyle' in win) {
        style = win.getComputedStyle(element);
    }
    else if ('currentStyle' in element) {
        style = element.currentStyle;
        isW3c = false;
    }
    else {
        throw new Error("Unable to retrieve style of [element].");
    }
    
    values = {};
    fontSize = false;
    
    for (; l--;) {
        property = args[++c];
        if (property && typeof property === 'string') {
            access = camel(property);
            if (!isW3c) {
                if (dimensionRe.test(access) && style[access] !== 'auto') {
                    if (fontSize === false) {
                        fontSize = pixelSize(element, style, 'fontSize', null);
                    }
                    value = pixelSize(element, style, access, fontSize) + 'px';
                }
                else if (access === 'float') {
                    value = style.styleFloat;
                }
                else {
                    value = style[access];
                }
            }
            else {
                value = style[access];
            }
            values[property] = value;
        }
    }
    
    style = null;
    win = null;
    return values;

}




function getPixelSize(element, style, property, fontSize) {
    var sizeWithSuffix = style[property],
        size = parseFloat(sizeWithSuffix),
        suffix = sizeWithSuffix.split(NUMBER_RE)[0],
        isEm = suffix === 'em';

    switch (suffix) {
    case 'in': return size * 96;
    case 'pt': return size * 96 / 72;
    case 'em': 
    case '%':
        fontSize = fontSize !== null ?
                fontSize :
                EM_OR_PERCENT_RE.test(suffix) && element.parentElement ?
                    getPixelSize(element.parentElement,
                        element.parentElement.currentStyle,
                        'fontSize',
                        null) :
                    16;
        if (isEm) {
            return size * fontSize;
        }
        return size / 100 * (property == 'fontSize' ?
                                    fontSize :
                                    WIDTH_RE.test(property) ?
                                        element.clientWidth :
                                        element.clientHeight);
    default: return size;
    }
}







function camelize(str) {
    return str.replace(CAMEL_RE, camelizeCallback);
}

function camelizeCallback(all, chr) {
    return chr.toUpperCase();
}










module.exports = {
    add: addClass,
    remove: removeClass,
    styles: getCurrentStyle
};