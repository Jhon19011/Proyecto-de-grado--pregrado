const bcrypt = require('bcryptjs');
const db = require('../../DB/mysql');


const TABLA = 'usuario';

async function crearUsuario(data) {
    const { nombres, apellidos, correo, telefono, password, rol, sedeU } = data;

    if (!nombres || !apellidos || !correo || !telefono || !password || !rol || !sedeU) {
        throw new Error('Todos los campos son obligatorios');
    }

    // Ya existe el correo?
    const usuarioExistente = await db.query(`SELECT * FROM ${TABLA} WHERE correo = ?`, [correo]);

    if (usuarioExistente.length > 0) {
        throw new Error('El usuario ya existe');
    }

    //Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const contrsenahasheada = await bcrypt.hash(password, salt);

    const query = `INSERT INTO ${TABLA} (nombres, apellidos, correo, telefono, password, rol, sedeU)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const result = await db.query(query, [nombres, apellidos, correo, telefono, contrsenahasheada, rol, sedeU]);

    return { id: result.insertId, nombres, apellidos, correo, telefono, rol, sedeU };
}

async function listarUsuarios() {
    return db.query(`SELECT idusuario, nombres, apellidos, correo, telefono, rol, sedeU FROM ${TABLA}`);
}

async function obtenerUsuario(id) {
    const usuario = await db.query(`SELECT * FROM ${TABLA} WHERE idusuario = ?`, [id]);
    if (usuario.length === 0) {
        throw new Error('Usuario no encontrado');
    }
    return usuario[0];
}

async function actualizarUsuario(id, data) {
    if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
    }

    const campos = Object.keys(data).map(campo => `${campo} = ?`).join(', ');
    const valores = Object.values(data);

    const query = `UPDATE ${TABLA} SET ${campos} WHERE idusuario = ?`;
    await db.query(query, [...valores, id]);

    return { id, ...data };
}

async function eliminarUsuario(id) {
    await db.query(`DELETE FROM ${TABLA} WHERE idusuario = ?`, [id]);
    return { mensaje: 'Usuario eliminado con éxito' };
}

module.exports = {
    listarUsuarios,
    crearUsuario,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario,
};