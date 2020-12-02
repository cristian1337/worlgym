const mysql = require('promise-mysql');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jvargas1996*',
    database: 'worldgym'
});

function conectarme() {
    return conexion;
};

module.exports = {
    conectarme
}

//Configuracion y conexion a la db