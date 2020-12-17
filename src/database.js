const mysql = require('promise-mysql');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Jvargas1996*',
    database: 'worldgym',
    insecureAuth : true
});

function conectarme() {
    return conexion;
};

async function insert(tabla, campos) {
    //Los campos deben venir parseados según el tipo de dato que sean
    try {
        const conn = await conectarme();
        const result = (await conn).query('INSERT INTO ' + tabla + ' ?', campos);
        return result;
    } catch (error) {
        return error;
    }
}

async function consulta(campos, tabla, where = '') {
    if (where != '') {
        where = ' WHERE ' + where;
    }
    try {
        const conn = await conectarme();
        const result = await conn.query("SELECT " + campos + " FROM " + tabla + where);
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = {
    conectarme,
    consulta
}

//Configuracion y conexion a la db