const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const { generarAlertas } = require('../alertas/generador');
const TABLA_ASIG = 'inventario_sustancia';
const TABLA_INV = 'tablas';
const TABLA_MOV = 'movimientos_sustancia'

// Listar sustancias de un inventario
async function listarPorInventario(tabla, sedeId) {

  await generarAlertas(sedeId);

  return db.query(`
    SELECT 
      isus.idinventario_sustancia AS idinventario_sustancia,
      isus.sustancia AS idsustancia, 
      s.numero, 
      s.codigo, 
      s.nombreComercial, 
      s.marca, 
      s.CAS, 
      s.clasedepeligrosegunonu, 
      s.categoriaIARC, 
      s.estado,
      s.presentacion,
      s.unidad,
      u.nombre AS unidad_nombre, 
      s.PDF, 
      isus.cantidad, 
      isus.cantidadremanente, 
      isus.gastototal, 
      isus.ubicaciondealmacenamiento,
      isus.cedula_principal,
      isus.estado_uso,
      isus.lote,
      isus.fechadevencimiento,
      t.principal,
      t.nombretabla
    FROM ${TABLA_ASIG} isus
    JOIN sustancia s ON s.idsustancia = isus.sustancia
    LEFT JOIN unidades u ON u.idunidad = s.unidad 
    JOIN tablas t ON t.idtablas = isus.tabla
    WHERE isus.tabla = ? AND isus.estado = 1
  `, [tabla]);
}

async function asignarSustancia(data) {
  const { tabla, sustancia, cantidad, ubicaciondealmacenamiento, lote, fechadevencimiento } = data;

  if (!tabla || !sustancia || !cantidad || !lote || !fechadevencimiento) {
    throw error('Todos los campos son obligatorios', 400);
  }

  const cantidadNum = Number(cantidad);

  const query = `
    INSERT INTO ${TABLA_ASIG} (
      tabla, 
      sustancia, 
      cantidad, 
      cantidadremanente, 
      gastototal, 
      ubicaciondealmacenamiento, 
      estado,
      lote,
      fechadevencimiento
    )
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
  `;

  const insertResult = await db.query(query, [
    tabla,
    sustancia,
    cantidadNum,
    cantidadNum,
    0,
    ubicaciondealmacenamiento || '',
    lote,
    fechadevencimiento
  ]);

  const idNuevo = insertResult.insertId;

  // asignar cédula principal
  await db.query(
    `UPDATE ${TABLA_ASIG} 
     SET cedula_principal = ? 
     WHERE idinventario_sustancia = ?`,
    [idNuevo, idNuevo]
  );

  return { mensaje: 'Sustancia registrada' };
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

  // 1. Verificar remanente
  const resultado = await db.query(`
    SELECT cantidadremanente 
    FROM ${TABLA_ASIG} 
    WHERE idinventario_sustancia = ?
  `, [id]);

  const remanente = resultado[0].cantidadremanente;

  if (remanente > 0) {
    throw error('Debe trasladar o consumir todo el remanente antes de eliminar la sustancia', 400);
  }

  // 2. Eliminación lógica
  await db.query(`
    UPDATE ${TABLA_ASIG}
    SET estado = 0
    WHERE idinventario_sustancia = ?
  `, [id]);

  return { mensaje: 'Sustancia desactivada correctamente' };
}

async function buscarSustanciasInventario(filtros) {
  let query = `
    SELECT 
      i.*,
      s.nombreComercial,
      s.unidad,
      u.nombre AS unidad_nombre
    FROM inventario_sustancia i
    INNER JOIN sustancia s 
      ON s.idsustancia = i.sustancia
    LEFT JOIN unidades u ON u.idunidad = s.unidad
    WHERE i.tabla = ? AND i.estado = 1
  `;

  let params = [filtros.inventarioId];

  if (filtros.sustancia) {
    query += ` AND s.nombreComercial LIKE ?`;
    params.push(`%${filtros.sustancia}%`);
  }

  if (filtros.unidad) {
    query += ` AND s.unidad LIKE ?`;
    params.push(`%${filtros.unidad}%`);
  }

  if (filtros.ubicacion) {
    query += ` AND i.ubicaciondealmacenamiento LIKE ?`;
    params.push(`%${filtros.ubicacion}%`);
  }

  query += ` ORDER BY s.nombreComercial ASC`;

  const filas = await db.query(query, params);
  return filas;
}

module.exports = {
  listarPorInventario,
  asignarSustancia,
  editarAsignacion,
  eliminarAsignacion,
  buscarSustanciasInventario
}