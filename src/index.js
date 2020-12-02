//Librerias para crear ventana
const {newWindow} = require('./main');
const {app} = require('electron');

//llamado conexion db
require('./database');

//Librerias
require('electron-reload')(__dirname);


app.allowRendererProcessReuse = false;
app.whenReady().then(createWindow);

function createWindow() {
    newWindow('src/ui/index.html', 1200, 1000);
}