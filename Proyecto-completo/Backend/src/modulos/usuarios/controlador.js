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
    return db.query(`
        SELECT 
            u.idusuario, 
            u.nombres, 
            u.apellidos, 
            u.correo, 
            u.telefono, 
            CASE WHEN r.nombre_rol = 'Auxiliar' THEN 'Laboratorista' ELSE r.nombre_rol END AS nombreRol, 
            s.nombre_sede AS nombreSede 
        FROM ${TABLA} u
        INNER JOIN rol r ON u.rol = r.idrol
        INNER JOIN sede s ON u.sedeU = s.idsede
        `);
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

async function actualizarPerfil(id, data) {
    const { nombres, apellidos, correo, telefono } = data;
    const query = `
    UPDATE usuario
    SET nombres = ?, apellidos = ?, correo = ?, telefono = ?
    WHERE idusuario = ?`;

    await db.query(query, [nombres, apellidos, correo, telefono, id]);
    return { mensaje: 'Perfil actualizado con éxito' };
}

async function buscarUsuarios(filtros) {
    let query = `
    SELECT 
        u.idusuario,
        u.nombres,
        u.apellidos,
        u.correo,
        u.telefono,
        u.rol,
        u.sedeU,
        CASE WHEN r.nombre_rol = 'Auxiliar' THEN 'Laboratorista' ELSE r.nombre_rol END AS nombreRol,
        s.nombre_sede AS nombreSede
    FROM usuario u
    LEFT JOIN rol r ON u.rol = r.idrol
    LEFT JOIN sede s ON u.sedeU = s.idsede
    WHERE 1=1
  `;

    let params = [];

    const parciales = {
        nombres: filtros.nombres,
        apellidos: filtros.apellidos,
        correo: filtros.correo,
        telefono: filtros.telefono
    };

    for (const [columna, valor] of Object.entries(parciales)) {
        if (valor !== undefined && valor !== null && valor !== '') {
            query += ` AND u.${columna} LIKE ?`;
            params.push(`%${valor}%`);
        }
    }

    if (filtros.sede !== undefined && filtros.sede !== null && filtros.sede !== '') {
        query += ` AND s.nombre_sede LIKE ?`;
        params.push(`%${filtros.sede}%`);
    }

    if (filtros.rol !== undefined && filtros.rol !== null && filtros.rol !== '') {
        query += ` AND CASE WHEN r.nombre_rol = 'Auxiliar' THEN 'Laboratorista' ELSE r.nombre_rol END LIKE ?`;
        params.push(`%${filtros.rol}%`);
    }

    query += ` ORDER BY u.nombres ASC`;

    return await db.query(query, params);
}

module.exports = {
    listarUsuarios,
    crearUsuario,
    obtenerUsuario,
    actualizarUsuario,
    eliminarUsuario,
    actualizarPerfil,
    buscarUsuarios
};
