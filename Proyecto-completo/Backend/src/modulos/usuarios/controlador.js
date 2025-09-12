const bcrypt = require('bcryptjs');
const db = require('../../DB/mysql');

const TABLA = 'usuario';

async function registrar(data) {
    if (!data.correo || !data.password) {
        throw new Error('Correo y contraseña requeridos');
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await db.query(`SELECT * FROM ${TABLA} WHERE correo = ?`, [data.correo]);
    if (usuarioExistente && usuarioExistente.length > 0) {
        throw new Error('El usuario ya existe');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    // Insertar en BD
    return db.insertarDB(TABLA, data);
}

module.exports = {
    registrar
};