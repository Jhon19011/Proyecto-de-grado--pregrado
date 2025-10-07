const db = require('../../DB/mysql');
const error = require('../../middleware/errors')
const TABLA = 'tablas'

// Crear inventario
async function crearInventario(data, sedeId) {
    const { nombretabla, principal } = data;

    if (!nombretabla) {
        throw error('El nombre del inventario es obligatorio', 400);
    }

    // Validar que no exista otro inventario con el mismo nombre en la misma sede
    const existente = await db.query(`SELECT * FROM ${TABLA} WHERE nombretabla = ? AND sedeT = ?`, [nombretabla, sedeId]);

    if (existente.length > 0) {
        throw error(`El inventario "${nombretabla}" ya existe en la sede ${sedeId}`, 400);
    }

    // Validar que no exista otro inventario principal en la misma sede
    if (principal) {
        const existePrincipal = await db.query(`SELECT * FROM ${TABLA} WHERE sedeT = ? AND principal = 1`, [sedeId]);

        if (existePrincipal.length > 0) {
            throw error(`Ya existe un inventario principal en la sede ${sedeId}`, 400);
        }
    }

    const query = `INSERT INTO ${TABLA} (nombretabla, sedeT, principal) VALUES (?, ?, ?)`;
    const result = await db.query(query, [nombretabla, sedeId, principal || 0]);

    return { id: result.insertId, nombretabla, sedeT: sedeId, principal: principal || 0 };
}

// Listar inventarios
async function listarInventarios(sedeId) {
    const query = `
    SELECT i.*
    FROM  tablas i
    WHERE i.sedeT = ?
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
    await db.query(`DELETE FROM ${TABLA} WHERE idtablas = ?`, [id]);
    return { mensaje: 'Inventario eliminado con éxito' };
}

module.exports = {
    crearInventario,
    listarInventarios,
    obtenerInventario,
    actualizarInventario,
    eliminarInventario
}