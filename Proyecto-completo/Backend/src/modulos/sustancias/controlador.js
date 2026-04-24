const db = require('../../DB/mysql');
const TABLA = 'sustancia';
const fs = require('fs');
const path = require('path');

//formatear la fecha
function formatDate(fecha) {
  if (!fecha) return null;
  return fecha.split('T')[0];
}

// Crear sustancias
async function crearSustancia(data, sedeId) {
  const {
    numero,
    codigo,
    nombreComercial,
    marca,
    lote,
    CAS,
    clasedepeligrosegunonu,
    categoriaIARC,
    estado,
    fechadevencimiento,
    presentacion,
    unidad,
    pdf_seguridad,
    pdf_tecnico,
    PDF,
    esControlada
  } = data;

  if (!numero || !codigo || !nombreComercial) {
    throw new Error('Numero, código y nombre comercial son obligatorios');
  }

  const fechaFormateada = formatDate(fechadevencimiento);

  const query = `
    INSERT INTO ${TABLA} 
    (numero, codigo, nombreComercial, marca, lote, CAS, clasedepeligrosegunonu, categoriaIARC, estado, fechadevencimiento, presentacion, unidad, pdf_seguridad, pdf_tecnico, PDF, sede_s, esControlada) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await db.query(query, [
    numero,
    codigo,
    nombreComercial,
    marca || null,
    lote || null,
    CAS || null,
    clasedepeligrosegunonu || null,
    categoriaIARC || null,
    estado || null,
    fechaFormateada,
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

// Listar Sutancias
async function listarSustancias(sedeId) {
  const sql = `
    SELECT s.*,
           IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN autorizacion_sustancia a
      ON a.sustancia_id = s.idsustancia
     AND a.sede_id = ?
    WHERE s.sede_s = ? 
    ORDER BY s.nombreComercial ASC
  `;

  return db.query(sql, [sedeId, sedeId]);
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

  if (data.fechadevencimiento) {
    data.fechadevencimiento = formatDate(data.fechadevencimiento);
  }

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
async function eliminarSustancia(id) {
  await db.query(`DELETE FROM ${TABLA} WHERE idsustancia = ?`, [id]);
  return { mensaje: 'Sustancia eliminada con éxito' };
}

async function listarSustanciasPorSede(sedeId) {
  const sql = `
    SELECT s.*,
           IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN autorizacion_sustancia a
      ON a.sustancia_id = s.idsustancia
     AND a.sede_id = ?
    WHERE s.esControlada = 1
      AND s.sede_s = ? 
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
async function buscarSustancias(filtros, sedeId) {
  let sql = `
    SELECT s.*,
           IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN autorizacion_sustancia a
      ON a.sustancia_id = s.idsustancia
     AND a.sede_id = ?
    WHERE s.sede_s = ?
  `;

  const params = [sedeId, sedeId];

  // Filtros exactos
  if (filtros.numero) {
    sql += ` AND s.numero = ?`;
    params.push(filtros.numero);
  }

  if (filtros.estado) {
    sql += ` AND s.estado = ?`;
    params.push(filtros.estado);
  }

  if (filtros.esControlada !== undefined && filtros.esControlada !== '') {
    sql += ` AND s.esControlada = ?`;
    params.push(filtros.esControlada);
  }

  if (filtros.fechadevencimiento) {
    sql += ` AND DATE(s.fechadevencimiento) = ?`;
    params.push(filtros.fechadevencimiento);
  }

  if (filtros.unidad) {
    sql += ` AND s.unidad = ?`;
    params.push(filtros.unidad);
  }

  // Filtros parciales
  if (filtros.nombreComercial) {
    sql += ` AND s.nombreComercial LIKE ?`;
    params.push(`%${filtros.nombreComercial}%`);
  }

  if (filtros.codigo) {
    sql += ` AND s.codigo LIKE ?`;
    params.push(`%${filtros.codigo}%`);
  }

  if (filtros.CAS) {
    sql += ` AND s.CAS LIKE ?`;
    params.push(`%${filtros.CAS}%`);
  }

  if (filtros.marca) {
    sql += ` AND s.marca LIKE ?`;
    params.push(`%${filtros.marca}%`);
  }

  if (filtros.lote) {
    sql += ` AND s.lote LIKE ?`;
    params.push(`%${filtros.lote}%`);
  }

  if (filtros.clasedepeligrosegunonu) {
    sql += ` AND s.clasedepeligrosegunonu LIKE ?`;
    params.push(`%${filtros.clasedepeligrosegunonu}%`);
  }

  if (filtros.categoriaIARC) {
    sql += ` AND s.categoriaIARC LIKE ?`;
    params.push(`%${filtros.categoriaIARC}%`);
  }

  if (filtros.presentacion) {
    sql += ` AND s.presentacion LIKE ?`;
    params.push(`%${filtros.presentacion}%`);
  }

  sql += ` ORDER BY s.nombreComercial ASC`;

  return db.query(sql, params);
}

// Buscar sustancias controladas con filtros
async function buscarSustanciasControladas(filtros, sedeId) {
  let sql = `
    SELECT s.*,
           IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
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