const mysql = require('mysql2');
const config = require('../config');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
}

let conexion;

function conMysql() {
    conexion = mysql.createConnection(dbconfig);

    conexion.connect((err) => {
        if (err) {
            console.log('[db err]', err);
            setTimeout(conMysql, 200);
        } else {
            console.log('DB Conectada!!!')
        }
    });

    conexion.on('error', err => {
        console.log('[db err]', err);
        if (err.code === 'Conexión perdida') {
            conMysql();
        } else {
            throw err;
        }
    })
}

conMysql();

function listarDB(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (error, results) => {
            if (error) {
                return reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

function listarUnoDB(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE id${tabla}=${id}`, (error, results) => {
            if (error) {
                return reject(error);
            } else {
                resolve(results[0]);
            }
        });
    });

}

function insertarDB(tabla, data) {
    return new Promise((resolve, reject) => {

        const query = 'INSERT INTO ?? SET ?';

        conexion.query(query, [tabla, data], (error, results) => {
            if (error) {
                console.error('Error al insertar:', error);
                return reject(error);
            } else {
                console.log('Inserción exitosa en ${tabla}', results);
                resolve(results);
            }
        });
    });
}

function actualizarDB(tabla, data) {
    return new Promise((resolve, reject) => {
        const primaryKey = Object.keys(data).find(key => key.startsWith('id')); // Se toma la llave primaria que comienza con 'id'

        if (!primaryKey) {
            return reject(new Error('Clave primaria no encontrada en los datos para actualización'));
        }

        const idValue = data[primaryKey]; // Se toma el valor de la clave primaria

        const campos = Object.keys(data).filter(key => key !== primaryKey); // Toma los campos a actualizar excluyendo la llave primaria 

        const setValues = campos.map(key => `\`${key}\` = ?`).join(', '); // Se construye el SET de la consulta

        const query = `UPDATE ?? SET ${setValues} WHERE ?? = ?`; // Se hace la consulta completa

        const values = [
            tabla, 
            ...campos.map(key => data[key]),
            primaryKey,
            idValue
        ];

        conexion.query(query, values, (error, results) => {
            if (error) {
                console.error('Error en actualización:', error);
                return reject(error);
            }

            console.log('Actualización exitosa:', results);
            resolve(results);
        });
    });
}

function agregarDB(tabla, data) {
    console.log('Datos recibidos en agregar:', data);

    const primaryKey = Object.keys(data).find(key => key.startsWith('id'));

    // Verificar si existe el idsede
    if (primaryKey && data[primaryKey]) {
        console.log('Actualizando elemento existente en ${tabla}');
        return actualizarDB(tabla, data);
    } else {
        console.log('Insertando nuevo elemento en ${tabla}');
        return insertarDB(tabla, data);
    }
}

function eliminarDB(tabla, data) {
    return new Promise((resolve, reject) => {

        const primaryKey = Object.keys(data).find(key => key.startsWith('id'));
        
        if (!primaryKey) {
            return reject(new Error('Clave primaria no encontrada en los datos para eliminación'));
        }

        const idValue = data[primaryKey];

        const query = 'DELETE FROM ?? WHERE ?? = ?';
        const values =  [tabla, primaryKey, idValue];

        conexion.query(query, values, (error, results) => {
            if (error) {
                console.error('Error al eliminar:', error);
                return reject(error);
            } else {
                console.log(`Eliminación exitosa en ${tabla}`, results);
                resolve(results);
            }
        });
    });
}

function query(sql, params) {
    return new Promise((resolve, reject) => {
        conexion.query(sql, params, (error, results) => {
            if (error) {
                console.error('Error en consulta:', error);
                return reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = {
    listarDB,
    listarUnoDB,
    agregarDB,
    eliminarDB,
    insertarDB,
    actualizarDB,
    query,
};