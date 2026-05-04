const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const TABLA = 'sustancia';
const fs = require('fs');
const path = require('path');

// Crear sustancias
async function crearSustancia(data, sedeId) {
  const {
    codigo,
    nombreComercial,
    marca,
    CAS,
    clasedepeligrosegunonu,
    categoriaIARC,
    estado,
    presentacion,
    unidad,
    pdf_seguridad,
    pdf_tecnico,
    PDF,
    esControlada
  } = data;

  if (!codigo || !nombreComercial) {
    throw new Error('Codigo y nombre comercial son obligatorios');
  }

  const ultimoNumero = await db.query(
    `SELECT COALESCE(MAX(CAST(numero AS UNSIGNED)), 0) + 1 AS siguienteNumero FROM ${TABLA} WHERE sede_s = ?`,
    [sedeId]
  );
  const numero = ultimoNumero[0].siguienteNumero;

  const query = `
    INSERT INTO ${TABLA} 
    (numero, codigo, nombreComercial, marca, CAS, clasedepeligrosegunonu, categoriaIARC, estado, presentacion, unidad, pdf_seguridad, pdf_tecnico, PDF, sede_s, esControlada) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await db.query(query, [
    numero,
    codigo,
    nombreComercial,
    marca || null,
    CAS || null,
    clasedepeligrosegunonu || null,
    categoriaIARC || null,
    estado || null,
    presentacion || null,
    unidad || null,
    pdf_seguridad || null,
    pdf_tecnico || null,
    PDF || null,
    sedeId || null,
    esControlada ?? 0
  ]);

  return { id: result.insertId, ...data, sede_s: sedeId };
}

function normalizarPaginado(page = 1, limit = 10) {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
  const offset = (pageNum - 1) * limitNum;

  return { pageNum, limitNum, offset };
}

// Listar Sutancias
async function listarSustancias(sedeId, page = null, limit = null) {
  const usarPaginado = (page !== null && page !== undefined) || (limit !== null && limit !== undefined);
  const { pageNum, limitNum, offset } = normalizarPaginado(page, limit);

  let sql = `
    SELECT s.*,
          u.nombre AS unidad_nombre,
          IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN unidades u ON u.idunidad = s.unidad
    LEFT JOIN autorizacion_sustancia a
      ON a.sustancia_id = s.idsustancia
     AND a.sede_id = ?
    WHERE s.sede_s = ? 
    ORDER BY s.nombreComercial ASC
  `;

  const params = [sedeId, sedeId];

  if (!usarPaginado) {
    return db.query(sql, params);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(limitNum, offset);

  const data = await db.query(sql, params);
  const totalRes = await db.query(
    `SELECT COUNT(*) AS total FROM sustancia WHERE sede_s = ?`,
    [sedeId]
  );
  const total = totalRes[0].total;

  return {
    data,
    total,
    totalPages: Math.ceil(total / limitNum),
    page: pageNum,
    limit: limitNum
  };
}



// Listar sustancia por id
async function obtenerSustancia(id) {
  const [sustancia] = await db.query(
    `SELECT * FROM ${TABLA} WHERE idsustancia = ?`,
    [id]
  );
  if (!sustancia) throw new Error('Sustancia no encontrada');
  return sustancia;
}

// Actualizar sustancia
async function actualizarSustancia(id, data) {

  // Obtener sustancia actual (para saber qué PDF tiene)
  const [actual] = await db.query(
    `SELECT pdf_seguridad, pdf_tecnico FROM ${TABLA} WHERE idsustancia = ?`,
    [id]
  );

  // Reemplazar pdf
  if (data.pdf_seguridad && actual.pdf_seguridad) {

    const ruta = path.join(__dirname, '../../../', actual.pdf_seguridad);

    if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
  }

  // Eliminar pdf seg
  if (data.eliminar_pdf_seguridad === 'true') {
    if (actual.pdf_seguridad) {
      const ruta = path.join(__dirname, '../../../', actual.pdf_seguridad);

      if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
      }
    }
    data.pdf_seguridad = null;
    delete data.eliminar_pdf_seguridad;
  }

  // Eliminar pdf tec
  if (data.eliminar_pdf_tecnico === 'true') {
    if (actual.pdf_tecnico) {
      const ruta = path.join(__dirname, '../../../', actual.pdf_tecnico);

      if (fs.existsSync(ruta)) {
        fs.unlinkSync(ruta);
      }
    }
    data.pdf_tecnico = null;
    delete data.eliminar_pdf_tecnico;
  }

  // construir query dinámico
  const campos = Object.keys(data)
    .map(campo => `${campo} = ?`)
    .join(', ');

  const valores = Object.values(data);

  const query = `UPDATE ${TABLA} SET ${campos} WHERE idsustancia = ?`;

  await db.query(query, [...valores, id]);

  return { id, ...data };
}

// Eliminar sustancia
async function eliminarSustancia(id, sedeId) {
  const [sustancia] = await db.query(
    `SELECT pdf_seguridad, pdf_tecnico FROM ${TABLA} WHERE idsustancia = ? AND sede_s = ?`,
    [id, sedeId]
  );

  if (!sustancia) {
    throw error('Sustancia no encontrada', 404);
  }

  const dependencias = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM inventario_sustancia WHERE sustancia = ?) AS inventarios,
      (SELECT COUNT(*) FROM autorizacion_sustancia WHERE sustancia_id = ?) AS autorizaciones,
      (SELECT COUNT(*) FROM alertas WHERE idsustancia = ?) AS alertas
  `, [id, id, id]);

  const { inventarios, autorizaciones, alertas } = dependencias[0];

  if (inventarios > 0 || autorizaciones > 0 || alertas > 0) {
    throw error('No se puede eliminar la sustancia porque tiene datos registrados en otras tablas del sistema', 400);
  }

  await db.query(`DELETE FROM ${TABLA} WHERE idsustancia = ? AND sede_s = ?`, [id, sedeId]);

  [sustancia.pdf_seguridad, sustancia.pdf_tecnico].forEach((archivo) => {
    if (!archivo) return;

    const ruta = path.join(__dirname, '../../../', archivo);
    if (fs.existsSync(ruta)) {
      fs.unlinkSync(ruta);
    }
  });

  return { mensaje: 'Sustancia eliminada con exito' };
}

async function listarSustanciasPorSede(sedeId) {
  const sql = `
    SELECT 
      s.*,
      u.nombre AS unidad_nombre,
      IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN unidades u ON u.idunidad = s.unidad
    LEFT JOIN autorizacion_sustancia a
      ON a.sustancia_id = s.idsustancia
    AND a.sede_id = ?
    WHERE s.sede_s = ?
    ORDER BY s.nombreComercial ASC
  `;
  return db.query(sql, [sedeId, sedeId]);
}


async function actualizarAutorizacion(sustanciaId, sedeId, autorizada) {
  const query = `
    INSERT INTO autorizacion_sustancia (sustancia_id, sede_id, autorizada)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE autorizada = VALUES(autorizada)
  `;
  await db.query(query, [sustanciaId, sedeId, autorizada]);
  return { mensaje: 'Autorización actualizada con éxito' };
}

// Buscar sustancias con filtros
async function buscarSustancias(filtros, sedeId, page = null, limit = null) {
  const usarPaginado = (page !== null && page !== undefined) || (limit !== null && limit !== undefined);
  const { pageNum, limitNum, offset } = normalizarPaginado(page, limit);

  let sql = `
          SELECT 
        s.*,
        u.nombre AS unidad_nombre,
        IFNULL(a.autorizada, 0) AS autorizada
      FROM sustancia s
      LEFT JOIN unidades u ON u.idunidad = s.unidad
      LEFT JOIN autorizacion_sustancia a
        ON a.sustancia_id = s.idsustancia
      AND a.sede_id = ?
      WHERE s.sede_s = ?
  `;

  const params = [sedeId, sedeId];
  let countSql = `
      SELECT COUNT(*) AS total
      FROM sustancia s
      LEFT JOIN unidades u ON u.idunidad = s.unidad
      LEFT JOIN autorizacion_sustancia a
        ON a.sustancia_id = s.idsustancia
      AND a.sede_id = ?
      WHERE s.sede_s = ?
  `;

  const countParams = [sedeId, sedeId];

  const agregarFiltro = (condicion, valor) => {
    sql += condicion;
    countSql += condicion;
    params.push(valor);
    countParams.push(valor);
  };

  // Filtros exactos
  if (filtros.numero) {
    agregarFiltro(` AND s.numero = ?`, filtros.numero);
  }

  if (filtros.estado) {
    agregarFiltro(` AND s.estado = ?`, filtros.estado);
  }

  if (filtros.esControlada !== undefined && filtros.esControlada !== '') {
    agregarFiltro(` AND s.esControlada = ?`, filtros.esControlada);
  }

  if (filtros.unidad) {
    agregarFiltro(` AND s.unidad = ?`, filtros.unidad);
  }

  // Filtros parciales
  if (filtros.nombreComercial) {
    agregarFiltro(` AND s.nombreComercial LIKE ?`, `%${filtros.nombreComercial}%`);
  }

  if (filtros.codigo) {
    agregarFiltro(` AND s.codigo LIKE ?`, `%${filtros.codigo}%`);
  }

  if (filtros.CAS) {
    agregarFiltro(` AND s.CAS LIKE ?`, `%${filtros.CAS}%`);
  }

  if (filtros.marca) {
    agregarFiltro(` AND s.marca LIKE ?`, `%${filtros.marca}%`);
  }

  if (filtros.clasedepeligrosegunonu) {
    agregarFiltro(` AND s.clasedepeligrosegunonu LIKE ?`, `%${filtros.clasedepeligrosegunonu}%`);
  }

  if (filtros.categoriaIARC) {
    agregarFiltro(` AND s.categoriaIARC LIKE ?`, `%${filtros.categoriaIARC}%`);
  }

  if (filtros.presentacion) {
    agregarFiltro(` AND s.presentacion LIKE ?`, `%${filtros.presentacion}%`);
  }

  sql += ` ORDER BY s.nombreComercial ASC`;

  if (!usarPaginado) {
    return db.query(sql, params);
  }

  sql += ` LIMIT ? OFFSET ?`;
  params.push(limitNum, offset);

  const data = await db.query(sql, params);
  const totalRes = await db.query(countSql, countParams);
  const total = totalRes[0].total;

  return {
    data,
    total,
    totalPages: Math.ceil(total / limitNum),
    page: pageNum,
    limit: limitNum
  };
}

// Buscar sustancias controladas con filtros
async function buscarSustanciasControladas(filtros, sedeId) {
  let sql = `
    SELECT s.*,
          u.nombre AS unidad_nombre,
          IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN unidades u ON u.idunidad = s.unidad
    LEFT JOIN autorizacion_sustancia a
      ON a.sustancia_id = s.idsustancia
     AND a.sede_id = ?
    WHERE s.esControlada = 1
      AND s.sede_s = ?
  `;

  const params = [sedeId, sedeId];

  // Código
  if (filtros.codigo) {
    sql += ` AND s.codigo LIKE ?`;
    params.push(`%${filtros.codigo}%`);
  }

  // Nombre
  if (filtros.nombreComercial) {
    sql += ` AND s.nombreComercial LIKE ?`;
    params.push(`%${filtros.nombreComercial}%`);
  }

  // Unidad
  if (filtros.unidad) {
    sql += ` AND s.unidad = ?`;
    params.push(filtros.unidad);
  }

  // Autorización
  if (filtros.autorizada !== undefined && filtros.autorizada !== '') {
    sql += ` AND IFNULL(a.autorizada, 0) = ?`;
    params.push(filtros.autorizada);
  }

  sql += ` ORDER BY s.nombreComercial ASC`;

  return db.query(sql, params);
}


module.exports = {
  crearSustancia,
  listarSustancias,
  obtenerSustancia,
  actualizarSustancia,
  eliminarSustancia,
  listarSustanciasPorSede,
  actualizarAutorizacion,
  buscarSustancias,
  buscarSustanciasControladas
};
