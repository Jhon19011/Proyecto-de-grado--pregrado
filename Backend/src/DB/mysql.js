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
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            conMysql();
        } else {
            throw err;
        }
    })
}

conMysql();

function todos(tabla) {
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

function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE id_sede=${id}`, (error, results) => {
            if (error) {
                return reject(error);
            } else{
                resolve(results[0]);
            }
        });
    });

}

function agregar(tabla, datos) {

}

function eliminar(tabla, id) {

}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
};