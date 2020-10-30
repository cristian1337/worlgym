const {newWindow} = require('./main');
const {app} = require('electron');

require('./database');

app.whenReady().then(newWindow);

