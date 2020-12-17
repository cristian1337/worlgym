const { BrowserWindow } = require('electron');
//llamado conexion db
const {consulta} = require('./database');

function consultar(campos, tabla, where) {
    return consulta(campos, tabla, where);
}

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
    newWindow,
    consultar
};

//Datos y funciones de las ventanas