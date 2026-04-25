const db = require('../../DB/mysql');

const TABLA = 'unidades';

async function listar() {
    return db.query(`SELECT * FROM ${TABLA} ORDER BY nombre ASC`);
}

async function crear(data) {
    const { nombre } = data;

    if (!nombre) {
        throw new Error('Nombre de unidad requerido');
    }

    const result = await db.query(
        `INSERT INTO ${TABLA} (nombre) VALUES (?)`,
        [nombre]
    );

    return { id: result.insertId, nombre };
}

async function eliminar(id) {

  // validar si está en uso
  const enUso = await db.query(
    'SELECT * FROM sustancia WHERE unidad = ? LIMIT 1',
    [id]
  );

  if (enUso.length > 0) {
    throw new Error('No se puede eliminar, está en uso');
  }

  return db.query(
    'DELETE FROM unidades WHERE idunidad = ?',
    [id]
  );
}

module.exports = {
    listar,
    crear,
    eliminar
};