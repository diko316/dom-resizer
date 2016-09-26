'use strict';


var MGR = require("./lib/manager.js");


MGR(document.getElementById('buang'));
MGR(document.getElementById('buang1'));


document.getElementById('buang1').
    addEventListener('domresize', function (event) {
        console.log(event);
    }, false);
