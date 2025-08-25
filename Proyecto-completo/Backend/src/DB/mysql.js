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

function todosSede(tabla) {
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

function unoSede(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE idsede=${id}`, (error, results) => {
            if (error) {
                return reject(error);
            } else{
                resolve(results[0]);
            }
        });
    });

}

function insertar(tabla, data) {
    return new Promise((resolve, reject) => {
        console.log('Intentando insertar datos:', { tabla, data });
        if (!data.nombre_sede) {
            console.error('Falta el campo obligatorio nombre_sede');
            return reject(new Error('Es requerido el campo nombre_sede'));
        }
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (error, results) => {
            if (error) {
                console.error('Error al insertar:', error);
                return reject(error);
            } else {
                console.log('Inserción exitosa:', results);
                resolve(results);
            }
        });
    });
}

function actualizar(tabla, data) {
    return new Promise((resolve, reject) => {
        if (!data.idsede || !data.nombre_sede) {
            return reject(new Error('Se requieren idsede y nombre_sede para actualizar'));
        }
        
        const query = 'UPDATE ?? SET nombre_sede = ? WHERE idsede = ?';
        const values = [tabla, data.nombre_sede, data.idsede];


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

function agregarSede(tabla, data) {
    console.log('Datos recibidos en agregarSede:', data);
    
    // Verificar si existe el idsede
    if(data.idsede) {
        console.log('Actualizando sede existente');
        const updateData = {
            nombre_sede: data.nombre_sede
        };
        return actualizar(tabla, updateData);
    } else {
        console.log('Insertando nueva sede');
        return insertar(tabla, data);
    }
}

function eliminarSede(tabla, data) {
    return new Promise((resolve, reject) => {
        console.log('Intentando eliminar sede:', { tabla, data });
        if (!data.idsede) {
            return reject(new Error('Se requiere el campo idsede'));
        }
        
        conexion.query(`DELETE FROM ${tabla} WHERE idsede = ?`, [data.idsede], (error, results) => {
            if (error) {
                console.error('Error al eliminar:', error);
                return reject(error);
            } else {
                console.log('Eliminación exitosa:', results);
                resolve(results);
            }
        });
    });
}

module.exports = {
    todosSede,
    unoSede,
    agregarSede,
    eliminarSede,
    insertar,
    actualizar,
};