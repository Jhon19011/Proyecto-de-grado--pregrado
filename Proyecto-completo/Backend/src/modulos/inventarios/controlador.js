const db = require('../../DB/mysql');
const error = require('../../middleware/errors')
const TABLA = 'tablas'

// Crear inventario
async function crearInventario(data, sedeId) {
    const { nombretabla, principal } = data;

    if (!nombretabla) {
        throw error('El nombre del inventario es obligatorio', 400);
    }

    // Buscar inventario existente
    const existente = await db.query(
        `SELECT * FROM ${TABLA} WHERE nombretabla = ? AND sedeT = ?`,
        [nombretabla, sedeId]
    );

    if (existente.length > 0 && existente[0].estado === 0) {

        if (principal) {
            const existePrincipal = await db.query(
                `SELECT * FROM ${TABLA} 
                 WHERE sedeT = ? AND principal = 1 AND estado = 1`,
                [sedeId]
            );

            if (existePrincipal.length > 0) {
                throw error(`Ya existe un inventario principal en la sede ${sedeId}`, 400);
            }
        }

        await db.query(
            `UPDATE ${TABLA}
             SET estado = 1,
                 principal = ?,
                 nombretabla = ?
             WHERE idtablas = ?`,
            [principal || 0, nombretabla, existente[0].idtablas]
        );

        return {
            mensaje: `Inventario "${nombretabla}" reactivado correctamente`
        };
    }

    if (existente.length > 0 && existente[0].estado === 1) {
        throw error(`El inventario "${nombretabla}" ya existe en la sede ${sedeId}`, 400);
    }

    if (principal) {
        const existePrincipal = await db.query(
            `SELECT * FROM ${TABLA} 
             WHERE sedeT = ? AND principal = 1 AND estado = 1`,
            [sedeId]
        );

        if (existePrincipal.length > 0) {
            throw error(`Ya existe un inventario principal en la sede ${sedeId}`, 400);
        }
    }

    const query = `INSERT INTO ${TABLA} (nombretabla, sedeT, principal, estado) VALUES (?, ?, ?, 1)`;
    const result = await db.query(query, [nombretabla, sedeId, principal || 0]);

    return { id: result.insertId, nombretabla, sedeT: sedeId, principal: principal || 0 };
}

// Listar inventarios
async function listarInventarios(sedeId) {
    const query = `
    SELECT i.*
    FROM  tablas i
    WHERE i.sedeT = ? AND i.estado = 1
    ORDER BY i.nombretabla
    `;
    return db.query(query, [sedeId]);
}

// Listar inventarios secundarios de una sede
async function listarInventariosSecundarios(sedeId) {
    const query = `
    SELECT i.*
    FROM ${TABLA} i
    WHERE i.sedeT = ? AND i.principal = 0 AND i.estado = 1
    ORDER BY i.nombretabla
    `;
    return db.query(query, [sedeId]);
}


//  Listar inventario por id
async function obtenerInventario(id) {
    const [inventario] = await db.query(`SELECT * FROM ${TABLA} WHERE idtablas = ?`, [id]);
    if (!inventario) throw new Error('Inventario no encontrado');
    return inventario;
}

// Actualizar inventario
async function actualizarInventario(id, data) {
    const campos = Object.keys(data).map(campo => `${campo} = ?`).join(', ');
    const valores = Object.values(data);

    await db.query(`UPDATE ${TABLA} SET ${campos} WHERE idtablas = ?`, [...valores, id]);
    return { id, ...data };
}

// Eliminar inventario
async function eliminarInventario(id) {

    const sustancias = await db.query(
        `SELECT idinventario_sustancia 
         FROM inventario_sustancia
         WHERE tabla = ? AND estado = 1`,
        [id]
    );

    if (sustancias.length > 0) {
        throw error('No se puede eliminar el inventario porque aún contiene sustancias', 400);
    }

    const result = await db.query(
        `UPDATE tablas SET estado = 0 WHERE idtablas = ?`,
        [id]
    );

    if (result.affectedRows === 0) {
        throw error('Inventario no encontrado', 404);
    }

    return { mensaje: 'Inventario eliminado correctamente' };
}

module.exports = {
    crearInventario,
    listarInventarios,
    listarInventariosSecundarios,
    obtenerInventario,
    actualizarInventario,
    eliminarInventario
}