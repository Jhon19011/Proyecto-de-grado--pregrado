const bcrypt = require('bcryptjs');
const db = require('../../DB/mysql');

const TABLA = 'usuarios';

async function registrar(data) {
    if (!data.correo || !data.password) {
        throw new Error('Correo y password son requeridos');
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await db.query(`SELECT * FROM ${TABLA} WHERE correo = ?`, [data.correo]);
    if (usuarioExistente && usuarioExistente.length > 0) {
        throw new Error('El usuario ya existe');
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    // Insertar el usuario
    return db.insertarDB(TABLA, data);
}

module.exports = {
    registrar
};
