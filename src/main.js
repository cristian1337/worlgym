const { BrowserWindow } = require('electron');

let window;

function newWindow(location, wt = 1200, ht = 1000) {
    window = new BrowserWindow({
        width: wt,
        height: ht,
        webPreferences: {
            nodeIntegration: true
        }
    })
    window.loadFile(location);
};

module.exports = {
    newWindow
};

//Datos y funciones de las ventanas