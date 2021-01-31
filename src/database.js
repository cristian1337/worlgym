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
        const result = (await conn).query('INSERT INTO ' + tabla + ' SET ?', campos);
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

async function update(tabla, campos, condicion) {
    //Los campos deben venir parseados según el tipo de dato que sean
    try {
        const conn = await conectarme();
        const result = (await conn).query('UPDATE ' + tabla + ' SET ? WHERE ' + condicion, campos);
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = {
    insert,
    consulta,
    update
}

//Configuracion y conexion a la db