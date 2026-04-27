const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const { generarAlertas } = require('../alertas/generador');
const TABLA_ASIG = 'inventario_sustancia';
const TABLA_INV = 'tablas';
const TABLA_MOV = 'movimientos_sustancia'

// Listar sustancias de un inventario
async function listarPorInventario(tabla, sedeId, filtros = {}, page = 1, limit = 10) {

  await generarAlertas(sedeId);

  console.log("FILTROS BACK:", filtros);

  const offset = (page - 1) * limit;

  let query = `
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
      s.esControlada,
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
      isus.observaciones,
      t.principal,
      t.nombretabla
    FROM inventario_sustancia isus
    JOIN sustancia s ON s.idsustancia = isus.sustancia
    LEFT JOIN unidades u ON u.idunidad = s.unidad 
    JOIN tablas t ON t.idtablas = isus.tabla
    WHERE isus.tabla = ? AND isus.estado = 1
  `;

  let params = [tabla];

  // FILTROS

  if (filtros.sustancia) {
    query += ` AND s.nombreComercial LIKE ?`;
    params.push(`%${filtros.sustancia}%`);
  }

  if (filtros.cedula) {
    query += ` AND isus.cedula_principal LIKE ?`;
    params.push(`%${filtros.cedula}%`);
  }

  if (filtros.codigo) {
    query += ` AND s.codigo LIKE ?`;
    params.push(`%${filtros.codigo}%`);
  }

  if (filtros.estado_uso) {
    query += ` AND isus.estado_uso = ?`;
    params.push(filtros.estado_uso);
  }

  if (filtros.unidad) {
    query += ` AND u.nombre LIKE ?`;
    params.push(`%${filtros.unidad}%`);
  }

  if (filtros.lote) {
    query += ` AND isus.lote LIKE ?`;
    params.push(`%${filtros.lote}%`);
  }

  if (filtros.fecha_vencimiento) {
    query += ` AND DATE(isus.fechadevencimiento) = ?`;
    params.push(filtros.fecha_vencimiento);
  }

  if (filtros.ubicacion) {
    query += ` AND isus.ubicaciondealmacenamiento LIKE ?`;
    params.push(`%${filtros.ubicacion}%`);
  }

  if (
    filtros.esControlada !== undefined &&
    filtros.esControlada !== null &&
    filtros.esControlada !== ''
  ) {
    query += ` AND s.esControlada = ?`;
    params.push(Number(filtros.esControlada));
  }

  let sumQuery = `
  SELECT COALESCE(SUM(isus.cantidadremanente), 0) AS totalRemanente
  FROM inventario_sustancia isus
  JOIN sustancia s ON s.idsustancia = isus.sustancia
  LEFT JOIN unidades u ON u.idunidad = s.unidad
  WHERE isus.tabla = ? AND isus.estado = 1
`;

  //Suma Remanente Total

  let sumParams = [tabla];

  if (filtros.sustancia) {
    sumQuery += ` AND s.nombreComercial LIKE ?`;
    sumParams.push(`%${filtros.sustancia}%`);
  }

  if (filtros.cedula) {
    sumQuery += ` AND isus.cedula_principal LIKE ?`;
    sumParams.push(`%${filtros.cedula}%`);
  }

  if (filtros.codigo) {
    sumQuery += ` AND s.codigo LIKE ?`;
    sumParams.push(`%${filtros.codigo}%`);
  }

  if (filtros.estado_uso) {
    sumQuery += ` AND isus.estado_uso = ?`;
    sumParams.push(filtros.estado_uso);
  }

  if (filtros.unidad) {
    sumQuery += ` AND u.nombre LIKE ?`;
    sumParams.push(`%${filtros.unidad}%`);
  }

  if (filtros.lote) {
    sumQuery += ` AND isus.lote LIKE ?`;
    sumParams.push(`%${filtros.lote}%`);
  }

  if (filtros.fecha_vencimiento) {
    sumQuery += ` AND DATE(isus.fechadevencimiento) = ?`;
    sumParams.push(filtros.fecha_vencimiento);
  }

  if (filtros.ubicacion) {
    sumQuery += ` AND isus.ubicaciondealmacenamiento LIKE ?`;
    sumParams.push(`%${filtros.ubicacion}%`);
  }

  if (
    filtros.esControlada !== undefined &&
    filtros.esControlada !== null &&
    filtros.esControlada !== ''
  ) {
    sumQuery += ` AND s.esControlada = ?`;
    sumParams.push(Number(filtros.esControlada));
  }

  const sumRes = await db.query(sumQuery, sumParams);
  const totalRemanente = Number(sumRes[0].totalRemanente || 0);

  // PAGINADO
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const data = await db.query(query, params);

  // TOTAL CON LOS MISMOS FILTROS
  let countQuery = `
    SELECT COUNT(*) as total
    FROM inventario_sustancia isus
    JOIN sustancia s ON s.idsustancia = isus.sustancia
    LEFT JOIN unidades u ON u.idunidad = s.unidad
    WHERE isus.tabla = ? AND isus.estado = 1
  `;

  let countParams = [tabla];

  if (filtros.sustancia) {
    countQuery += ` AND s.nombreComercial LIKE ?`;
    countParams.push(`%${filtros.sustancia}%`);
  }

  if (filtros.codigo) {
    countQuery += ` AND s.codigo LIKE ?`;
    countParams.push(`%${filtros.codigo}%`);
  }

  if (filtros.ubicacion) {
    countQuery += ` AND isus.ubicaciondealmacenamiento LIKE ?`;
    countParams.push(`%${filtros.ubicacion}%`);
  }

  if (filtros.cedula) {
    countQuery += ` AND isus.cedula_principal LIKE ?`;
    countParams.push(`%${filtros.cedula}%`);
  }

  if (filtros.estado_uso) {
    countQuery += ` AND isus.estado_uso = ?`;
    countParams.push(filtros.estado_uso);
  }

  if (filtros.unidad) {
    countQuery += ` AND u.nombre LIKE ?`;
    countParams.push(`%${filtros.unidad}%`);
  }

  if (filtros.lote) {
    countQuery += ` AND isus.lote LIKE ?`;
    countParams.push(`%${filtros.lote}%`);
  }

  if (filtros.fecha_vencimiento) {
    countQuery += ` AND DATE(isus.fechadevencimiento) = ?`;
    countParams.push(filtros.fecha_vencimiento);
  }

  if (
    filtros.esControlada !== undefined &&
    filtros.esControlada !== null &&
    filtros.esControlada !== ''
  ) {
    countQuery += ` AND s.esControlada = ?`;
    countParams.push(Number(filtros.esControlada));
  }

  const totalRes = await db.query(countQuery, countParams);
  const total = totalRes[0].total;

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    page,
    limit,
    totalRemanente
  };
}

async function asignarSustancia(data) {
  const { tabla, sustancia, cantidad, ubicaciondealmacenamiento, lote, fechadevencimiento, observaciones } = data;

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
      fechadevencimiento,
      observaciones
    )
    VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `;

  const insertResult = await db.query(query, [
    tabla,
    sustancia,
    cantidadNum,
    cantidadNum,
    0,
    ubicaciondealmacenamiento || '',
    lote,
    fechadevencimiento,
    observaciones || ''
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
  const { ubicaciondealmacenamiento, observaciones } = data;

  if (!ubicaciondealmacenamiento || !observaciones) {
    throw error('Todos los campos son obligatorios', 400);
  }

  const query = `
        UPDATE ${TABLA_ASIG}
        SET ubicaciondealmacenamiento = ?, observaciones = ?
        WHERE idinventario_sustancia = ?`;

  await db.query(query, [ubicaciondealmacenamiento, observaciones, id]);
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
    LEFT JOIN unidades u 
      ON u.idunidad = s.unidad
    WHERE i.tabla = ? AND i.estado = 1
  `;

  let params = [filtros.inventarioId];

  // Nombre
  if (filtros.sustancia) {
    query += ` AND s.nombreComercial LIKE ?`;
    params.push(`%${filtros.sustancia}%`);
  }

  // ID (cédula)
  if (filtros.cedula) {
    query += ` AND i.cedula_principal LIKE ?`;
    params.push(`%${filtros.cedula}%`);
  }

  // Código
  if (filtros.codigo) {
    query += ` AND s.codigo LIKE ?`;
    params.push(`%${filtros.codigo}%`);
  }

  // Estado (Nuevo, En uso, Agotado)
  if (filtros.estado_uso) {
    query += ` AND i.estado_uso = ?`;
    params.push(filtros.estado_uso);
  }

  // Unidad (CORREGIDO)
  if (filtros.unidad) {
    query += ` AND u.nombre LIKE ?`;
    params.push(`%${filtros.unidad}%`);
  }

  // Lote
  if (filtros.lote) {
    query += ` AND i.lote LIKE ?`;
    params.push(`%${filtros.lote}%`);
  }

  // Fecha de vencimiento
  if (filtros.fecha_vencimiento) {
    query += ` AND DATE(i.fechadevencimiento) = ?`;
    params.push(filtros.fecha_vencimiento);
  }

  // Ubicación
  if (filtros.ubicacion) {
    query += ` AND i.ubicaciondealmacenamiento LIKE ?`;
    params.push(`%${filtros.ubicacion}%`);
  }

  query += ` ORDER BY s.nombreComercial ASC`;

  const filas = await db.query(query, params);
  return filas;
}

async function paginado(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const data = await db.query(`
      SELECT * FROM inventario_sustancia
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const totalRes = await db.query(`
      SELECT COUNT(*) as total FROM inventario_sustancia
    `);

    const total = totalRes[0].total;

    res.json({
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({
      error: true,
      message: err.message
    });
  }
}

module.exports = {
  listarPorInventario,
  asignarSustancia,
  editarAsignacion,
  eliminarAsignacion,
  buscarSustanciasInventario,
  paginado
}