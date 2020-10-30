const {BrowserWindow} = require('electron');

let window;

function newWindow() {
    window = new BrowserWindow({
        width: 1200,
        height: 1000,
        webPreferences: {
            nodeIntegration: true
        }
    })
    window.loadFile('src/ui/index.html');
};

module.exports = {
    newWindow
};