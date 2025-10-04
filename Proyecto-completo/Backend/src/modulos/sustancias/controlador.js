const db = require('../../DB/mysql');
const TABLA = 'sustancia';

//formatear la fecha
function formatDate(fecha) {
  if (!fecha) return null;
  return fecha.split('T')[0];
}

// Crear sustancias
async function crearSustancia(data) {
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
    PDF
  } = data;

  if (!numero || !codigo || !nombreComercial) {
    throw new Error('Numero, código y nombre comercial son obligatorios');
  }

  const fechaFormateada = formatDate(fechadevencimiento);

  const query = `
    INSERT INTO ${TABLA} 
    (numero, codigo, nombreComercial, marca, lote, CAS, clasedepeligrosegunonu, categoriaIARC, estado, fechadevencimiento, presentacion, unidad, PDF) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    PDF || null
  ]);

  return { id: result.insertId, ...data };
}

// Listar Sutancias
async function listarSustancias(sedeId = null) {
  return db.query(`
    SELECT s.*, 
           IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN autorizacion_sustancia a 
      ON a.sustancia_id = s.idsustancia 
     AND a.sede_id = ?
  `, [sedeId]);
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
  return db.query(`
    SELECT s.*, 
           IFNULL(a.autorizada, 0) AS autorizada
    FROM sustancia s
    LEFT JOIN autorizacion_sustancia a 
      ON a.sustancia_id = s.idsustancia 
     AND a.sede_id = ?
    WHERE s.esControlada = 1
  `, [sedeId]);
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


module.exports = {
  crearSustancia,
  listarSustancias,
  obtenerSustancia,
  actualizarSustancia,
  eliminarSustancia, 
  listarSustanciasPorSede,
  actualizarAutorizacion
};
