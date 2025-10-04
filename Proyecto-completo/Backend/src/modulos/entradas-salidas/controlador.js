const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const TABLA = 'movimientos_sustancia';

// Registrar movimiento (entrada-salida)
async function registrarMovimiento(data) {
    const { inventario_sustancia_id, tipo, cantidad, motivo, usuario } = data

    if (!inventario_sustancia_id || !tipo || !cantidad) {
        throw error('Todos los datos son obligatorios', 400);
    }

    // Traer asignación actual
    const asignacion = await db.query(
        `SELECT cantidadremanente FROM inventario_sustancia WHERE idinventario_sustancia = ?`,
        [inventario_sustancia_id]
    );

    if(!asignacion.length) {
        throw error('La sustancia no existe en el inventario', 404);
    }

    let nuevoRemanente = asignacion[0].cantidadremanente;

    if(tipo === 'entrada') {
        nuevoRemanente += cantidad;
    } else if (tipo === 'salida') {
        if(cantidad > nuevoRemanente) {
            throw error('No hay suficiente cantidad para la salida', 400);
        }
        nuevoRemanente -= cantidad;
    } else {
        throw error('Tipo de movimiento inválido', 400);
    }

    // Actualizar cantidad remanente
    await db.query(
        `UPDATE inventario_sustancia SET cantidadremanente = ? WHERE idinventario_sustancia = ?`,
        [nuevoRemanente, inventario_sustancia_id]
    );

    // Insertar movimiento
    const result = await db.query(
        `INSERT INTO ${TABLA} (inventario_sustancia_id, tipo, cantidad, motivo, usuario)
        VALUES (?, ?, ?, ?, ?)`,
        [inventario_sustancia_id, tipo, cantidad, motivo || null, usuario || null]
    );

    return { idmovimiento: result.insertId, ...data, cantidadremanente: nuevoRemanente };
}

// Listar movimientos de sustancia
async function listarMovimientos(inventario_sustancia_id) {
    return db.query(` 
        SELECT m.idmovimiento, m.fecha, m.tipo, m.cantidad, m.motivo, m.usuario, s.unidad
        FROM movimientos_sustancia m
        INNER JOIN inventario_sustancia i ON m.inventario_sustancia_id = i.idinventario_sustancia
        INNER JOIN sustancia s ON i.sustancia = s.idsustancia
        WHERE m.inventario_sustancia_id = ?
        ORDER BY m.fecha DESC`, {inventario_sustancia_id}
    );
}

module.exports = {
    registrarMovimiento,
    listarMovimientos
}