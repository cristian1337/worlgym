const { BrowserWindow } = require('electron');
//llamado conexion db
const { consulta, insert, update } = require('./database');

function consultar(campos, tabla, where) {
    return consulta(campos, tabla, where);
}

function insertar(tabla, campos) {
    return insert(tabla, campos);
}

function actualizar(tabla, campos, condicion) {
    return update(tabla, campos, condicion);
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

function showNotification(message = '', title = 'Basic Notification') {
    new Notification(
        title,
        {
            body: message,
            icon: './img/gym.png'
        }
    );
}

module.exports = {
    newWindow,
    consultar,
    insertar,
    showNotification,
    actualizar
};

//Datos y funciones de las ventanas