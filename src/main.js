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
            nodeIntegration: true,
            enableRemoteModule: true
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

function convertToInteger(value) {
    var i = value.replace(/\./g, '').indexOf(',');
    value = value.replace(/[^0-9]/g, '');
    return i != -1 ? value.slice(0, i) + ',' + value.slice(i) : value;
}

function coin(value) {
    value = convertToInteger(value);

    var parts = value.split(',');
    var integer = parts[0].replace(/\./g, '');
    var finish = new Array();

    for (var i = parts[0].length - 1; i >= 0; i--)
        finish.unshift((!((finish.length + 1) % 3) && i ? '.' : '') + parts[0][i]);

    integer = finish.join('');

    return value.indexOf(',') != -1 ? integer + ',' + parts[1] : integer;
}

module.exports = {
    newWindow,
    consultar,
    insertar,
    showNotification,
    actualizar,
    coin
};

//Datos y funciones de las ventanas