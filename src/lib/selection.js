'use strict';


function clearSelection() {
	var win = window,
        doc = win.document;
    var selection;
    
	if ('getSelection' in win) {
		selection = win.getSelection();
        if (selection) {
            selection.removeAllRanges();
        }
	}
    else if ('selection' in doc) {
		selection = doc.selection;
        if (selection) {
            selection.empty();
        }
	}
    selection = null;
    doc = null;
    win = null;
	
}

module.exports = {
    clear: clearSelection
};
