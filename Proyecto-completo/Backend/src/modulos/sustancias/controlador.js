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
    PDF
  } = data;

  if (!numero || !codigo || !nombreComercial) {
    throw new Error('Numero, código y nombre comercial son obligatorios');
  }

  const fechaFormateada = formatDate(fechadevencimiento);

  const query = `
    INSERT INTO ${TABLA} 
    (numero, codigo, nombreComercial, marca, lote, CAS, clasedepeligrosegunonu, categoriaIARC, estado, fechadevencimiento, presentacion, PDF) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    PDF || null
  ]);

  return { id: result.insertId, ...data };
}


// Listar sustancias
async function listarSustancias() {
  return db.query(`SELECT * FROM ${TABLA}`);
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

module.exports = {
  crearSustancia,
  listarSustancias,
  obtenerSustancia,
  actualizarSustancia,
  eliminarSustancia
};
