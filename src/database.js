const mysql = require('promise-mysql');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'ingresoGym'
});

function conectarme() {
    return conexion;
};

module.exports = {
    conectarme
}