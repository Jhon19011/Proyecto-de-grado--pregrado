const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const TABLA_ASIG = 'inventario_sustancia';
const TABLA_INV = 'tablas';
const TABLA_MOV = 'movimientos_sustancia'

// Listar sustancias de un inventario
async function listarPorInventario(tabla) {
    return db.query(`
        SELECT 
        isus.idinventario_sustancia AS idinventario_sustancia,
        isus.sustancia AS idsustancia, 
        s.numero, 
        s.codigo, 
        s.nombreComercial, 
        s.marca, 
        s.lote, 
        s.CAS, 
        s.clasedepeligrosegunonu, 
        s.categoriaIARC, 
        s.estado, 
        s.fechadevencimiento, 
        s.presentacion,
        s.unidad, 
        s.PDF, 
        isus.cantidad, 
        isus.cantidadremanente, 
        isus.gastototal, 
        isus.ubicaciondealmacenamiento,
        t.principal
        FROM ${TABLA_ASIG} isus
        JOIN sustancia s ON s.idsustancia = isus.sustancia
        JOIN tablas t ON t.idtablas = isus.tabla
        WHERE isus.tabla = ?`, [tabla]);
}

async function asignarSustancia(data) {
  const { tabla, sustancia, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento } = data;

  if (!tabla || !sustancia || !cantidad) {
    throw error('Todos los campos son obligatorios', 400);
  }

  const query = `
    INSERT INTO inventario_sustancia (tabla, sustancia, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await db.query(query, [tabla, sustancia, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento]);

  return { mensaje: 'Sustancia asignada correctamente' };
}


async function editarAsignacion(id, data) {
    const { cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento } = data;

    if (cantidad == null || cantidadremanente == null || gastototal == null || !ubicaciondealmacenamiento) {
        throw error('Todos los campos son obligatorios', 400);
    }

    const query = `
        UPDATE ${TABLA_ASIG}
        SET cantidad = ?, cantidadremanente = ?, gastototal = ?, ubicaciondealmacenamiento = ?
        WHERE idinventario_sustancia = ?`;

    await db.query(query, [cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento, id]);
    return { mensaje: 'Asignación actualizada con éxito' };
}

async function eliminarAsignacion(id) {
    await db.query(`DELETE FROM ${TABLA_ASIG} WHERE idinventario_sustancia = ?`, [id]);
    return { mensaje: 'Sustancia eliminada del inventario exitosamente' };
}

module.exports = {
    listarPorInventario,
    asignarSustancia,
    editarAsignacion,
    eliminarAsignacion
}