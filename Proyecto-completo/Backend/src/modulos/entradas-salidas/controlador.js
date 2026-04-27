const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const TABLA_MOV = 'movimientos_sustancia';
const TABLA_INV = 'tablas';
const TABLA_ASIG = 'inventario_sustancia';

function calcularEstadoUso(cantidad, remanente) {
  if (remanente === 0) return 'Agotado';
  if (cantidad === remanente) return 'Nuevo';
  return 'En uso';
}

// Registrar movimiento (entrada-salida local)
async function registrarMovimiento(data, user) {
  const { inventario_sustancia_id, tipo, cantidad, motivo, usuario, fecha } = data;
  const nombreUsuario = `${user.nombres} ${user.apellidos}`;

  if (!inventario_sustancia_id || !tipo || !cantidad || !fecha) {
    throw error('Todos los datos son obligatorios', 400);
  }

  const [asignacion] = await db.query(
    `SELECT * FROM ${TABLA_ASIG} WHERE idinventario_sustancia = ?`,
    [inventario_sustancia_id]
  );

  if (!asignacion) throw error('Sustancia no encontrada', 404);

  const [inventario] = await db.query(
    `SELECT * FROM ${TABLA_INV} WHERE idtablas = ?`,
    [asignacion.tabla]
  );

  const cantidadNum = Number(cantidad);
  let nuevoRemanente = Number(asignacion.cantidadremanente);
  let nuevaCantidad = Number(asignacion.cantidad);
  let nuevoGastoTotal = Number(asignacion.gastototal || 0);

  if (tipo === 'entrada') {
    nuevoRemanente += cantidadNum;
    nuevaCantidad += cantidadNum;

  } else if (tipo === 'salida') {

    if (cantidadNum > nuevoRemanente) {
      throw error('Cantidad insuficiente', 400);
    }

    nuevoRemanente -= cantidadNum;
    nuevoGastoTotal += cantidadNum;
  }

  const estadoUso = calcularEstadoUso(nuevaCantidad, nuevoRemanente);

  await db.query(
    `UPDATE ${TABLA_ASIG} 
     SET cantidadremanente = ?, cantidad = ?, gastototal = ?, estado_uso = ?
     WHERE idinventario_sustancia = ?`,
    [nuevoRemanente, nuevaCantidad, nuevoGastoTotal, estadoUso, inventario_sustancia_id]
  );

  await db.query(
    `INSERT INTO ${TABLA_MOV} 
    (inventario_sustancia_id, tipo, cantidad, motivo, usuario, fecha)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      inventario_sustancia_id,
      tipo,
      cantidad,
      motivo || (tipo === 'entrada' ? 'Devolución usuario' : 'Entrega usuario'),
      usuario || nombreUsuario,
      fecha
    ]
  );

  return {
    mensaje: `Movimiento ${tipo} en ${inventario.nombretabla}`,
    remanente: nuevoRemanente,
  };
}

// Traslado interno (principal -> secundario)
async function trasladarSustancia(data, user) {
  const { destino_id, asignacion_id, cantidad, motivo, usuario, origen_id, ubicaciondealmacenamiento, observaciones } = data;
  const sedeId = user.sedeU;
  const nombreUsuario = `${user.nombres} ${user.apellidos}`;
  const { inventario_sustancia_id } = data;

  if (!destino_id || !asignacion_id || !cantidad || !origen_id) {
    throw error('Datos incompletos', 400);
  }

  if (origen_id === destino_id) {
    throw error('Origen y destino no pueden ser iguales', 400);
  }

  const [invOrigen] = await db.query(
    `SELECT * FROM ${TABLA_INV} WHERE idtablas = ?`,
    [origen_id]
  );

  const [invDestino] = await db.query(
    `SELECT * FROM ${TABLA_INV} WHERE idtablas = ?`,
    [destino_id]
  );

  if (!invOrigen || !invDestino) throw error('Inventario inválido', 404);

  const [asigOrigen] = await db.query(
    `SELECT * FROM ${TABLA_ASIG} 
   WHERE idinventario_sustancia = ? AND estado = 1`,
    [asignacion_id]
  );

  if (!asigOrigen) throw error('No existe en origen', 400);

  const cantidadNum = Number(cantidad);

  if (asigOrigen.cantidadremanente < cantidadNum) {
    throw error('Cantidad insuficiente', 400);
  }

  const cedula = asigOrigen.cedula_principal || asigOrigen.idinventario_sustancia;

  await db.query('START TRANSACTION');

  try {

    // 🔻 ORIGEN
    const nuevoRemanente = asigOrigen.cantidadremanente - cantidadNum;
    const nuevoGasto = Number(asigOrigen.gastototal || 0) + cantidadNum;

    const estadoOrigen = calcularEstadoUso(
      asigOrigen.cantidad,
      nuevoRemanente
    );

    await db.query(
      `UPDATE ${TABLA_ASIG}
       SET cantidadremanente = ?, gastototal = ?, estado_uso = ?
       WHERE idinventario_sustancia = ?`,
      [nuevoRemanente, nuevoGasto, estadoOrigen, asigOrigen.idinventario_sustancia]
    );

    // 🔺 DESTINO (SIEMPRE NUEVO)
    const insert = await db.query(
      `INSERT INTO ${TABLA_ASIG}
      (tabla, sustancia, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento, estado, cedula_principal, estado_uso, lote, fechadevencimiento, observaciones)
      VALUES (?, ?, ?, ?, 0, ?, 1, ?, 'Nuevo', ?, ?, ?)`,
      [
        destino_id,
        asigOrigen.sustancia,
        cantidadNum,
        cantidadNum,
        ubicaciondealmacenamiento || '',
        cedula,
        asigOrigen.lote,
        asigOrigen.fechadevencimiento,
        observaciones || ''
      ]
    );

    const [asigDestino] = await db.query(
      `SELECT * FROM ${TABLA_ASIG} WHERE idinventario_sustancia = ?`,
      [insert.insertId]
    );

    const motivoSalida = `Traslado hacia ${invDestino.nombretabla}`;
    const motivoEntrada = `Traslado desde ${invOrigen.nombretabla}`;

    // MOVIMIENTOS
    await db.query(
      `INSERT INTO ${TABLA_MOV}
      (inventario_sustancia_id, tipo, cantidad, motivo, usuario, inventario_origen_id, inventario_destino_id)
      VALUES (?, 'salida', ?, ?, ?, ?, ?)`,
      [
        asigOrigen.idinventario_sustancia,
        cantidadNum,
        motivo || motivoSalida,
        usuario || nombreUsuario,
        origen_id,
        destino_id
      ]
    );

    await db.query(
      `INSERT INTO ${TABLA_MOV}
      (inventario_sustancia_id, tipo, cantidad, motivo, usuario, inventario_origen_id, inventario_destino_id)
      VALUES (?, 'entrada', ?, ?, ?, ?, ?)`,
      [
        asigDestino.idinventario_sustancia,
        cantidadNum,
        motivo || motivoEntrada,
        usuario || nombreUsuario,
        origen_id,
        destino_id
      ]
    );

    await db.query('COMMIT');

    return {
      mensaje: `Traslado a ${invDestino.nombretabla}`
    };

  } catch (err) {
    await db.query('ROLLBACK');
    throw error('Error en traslado', 500);
  }
}




// Movimiento local en secundario
async function registrarMovimientoSecundario(data, user) {
  const { inventario_sustancia_id, tipo, cantidad, motivo, usuario, fecha } = data;
  const nombreUsuario = `${user.nombres} ${user.apellidos}`;
  

  if (!inventario_sustancia_id || !tipo || !cantidad || !fecha) {
    throw error('Inventario, tipo y cantidad son requeridos', 400);
  }

  // Verificar asignación
  const [asignacion] = await db.query(
    `SELECT * FROM ${TABLA_ASIG} WHERE idinventario_sustancia = ?`,
    [inventario_sustancia_id]
  );

  if (!asignacion) throw error('Sustancia no encontrada en este inventario', 404);

  // Obtener info del inventario
  const [inventario] = await db.query(
    `SELECT * FROM ${TABLA_INV} WHERE idtablas = ?`,
    [asignacion.tabla]
  );

  if (!inventario) throw error('Inventario no encontrado', 404);

  if (inventario.principal === 1) {
    throw error('Este método es exclusivo para inventario secundarios', 400);
  }

  let nuevoRemanente = Number(asignacion.cantidadremanente);
  let nuevaCantidad = Number(asignacion.cantidad);
  let nuevoGastoTotal = Number(asignacion.gastototal || 0);

  const cantidadNum = Number(cantidad);

  // Cálculo del movimiento
  if (tipo === 'entrada') {
    nuevoRemanente += cantidadNum;
    nuevaCantidad += cantidadNum;

  } else if (tipo === 'salida') {

    if (cantidadNum > nuevoRemanente) {
      throw error('No hay suficiente cantidad de esta sustancia en el inventario', 400);
    }

    nuevoRemanente -= cantidadNum;
    nuevoGastoTotal += cantidadNum;

  } else {
    throw error('Tipo de movimiento inválido', 400);
  }

  const estadoUso = calcularEstadoUso(nuevaCantidad, nuevoRemanente);

  // Actualizar el stock
  await db.query(
    `UPDATE ${TABLA_ASIG} 
   SET cantidadremanente = ?, cantidad = ?, gastototal = ?, estado_uso = ?
   WHERE idinventario_sustancia = ?`,
    [nuevoRemanente, nuevaCantidad, nuevoGastoTotal, estadoUso, inventario_sustancia_id]
  );

  // Registrar movimiento en historial
  await db.query(
    `INSERT INTO ${TABLA_MOV}
        (inventario_sustancia_id, tipo, cantidad, motivo, usuario, fecha)
        VALUES (?, ?, ?, ?, ?, ?)`,
    [
      inventario_sustancia_id,
      tipo,
      cantidad,
      motivo || (tipo === 'salida' ? 'Uso en práctica' : 'Devolución interna'),
      usuario || nombreUsuario,
      fecha
    ]
  );

  return {
    mensaje: `Movimiento ${tipo} registrado en el inventario ${inventario.nombretabla}`,
    remanente: nuevoRemanente,
  };
}

// Listar movimientos de sustancia
async function listarMovimientos(inventario_sustancia_id) {

  return db.query(` 
        SELECT m.idmovimiento, m.fecha, m.tipo, m.cantidad, m.motivo, m.usuario, s.unidad
        FROM movimientos_sustancia m
        INNER JOIN inventario_sustancia i ON m.inventario_sustancia_id = i.idinventario_sustancia
        INNER JOIN sustancia s ON i.sustancia = s.idsustancia
        WHERE m.inventario_sustancia_id = ?
        ORDER BY m.fecha DESC`, [inventario_sustancia_id]
  );
}

module.exports = {
  trasladarSustancia,
  registrarMovimiento,
  registrarMovimientoSecundario,
  listarMovimientos
}