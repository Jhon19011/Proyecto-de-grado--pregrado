const db = require('../../DB/mysql');
const error = require('../../middleware/errors'); // ajusta la ruta

async function insertarAlerta({ mensaje, tipo, sedeId, idsustancia, idinventario }) {

  // evitar duplicados correctamente
  const existe = await db.query(`
    SELECT idalerta FROM alertas
    WHERE tipo = ?
    AND idsustancia = ?
    AND idinventario_sustancia = ?
    AND leida = 0
  `, [tipo, idsustancia, idinventario]);

  if (existe.length > 0) return;

  await db.query(`
    INSERT INTO alertas 
    (mensaje, tipo, sede_id, idsustancia, idinventario_sustancia)
    VALUES (?, ?, ?, ?, ?)
  `, [mensaje, tipo, sedeId, idsustancia, idinventario]);
}

async function listar(sedeId) {
  return db.query(`
    SELECT 
      a.*,
      s.nombreComercial,
      t.nombretabla
    FROM alertas a
    LEFT JOIN sustancia s ON s.idsustancia = a.idsustancia
    LEFT JOIN inventario_sustancia i ON i.idinventario_sustancia = a.idinventario_sustancia
    LEFT JOIN tablas t ON t.idtablas = i.tabla
    WHERE a.sede_id = ?
    ORDER BY a.fecha DESC
  `, [sedeId]);
}

async function marcarLeida(req, res) {
  try {
    console.log("PARAMS:", req.params);

    const id = req.params?.id;

    if (!id) {
      throw error("ID de alerta no recibido", 400);
    }

    await db.query(
      "UPDATE alertas SET leida = 1 WHERE idalerta = ?",
      [id]
    );

    res.status(200).json({ ok: true });

  } catch (err) {
    console.error("ERROR:", err);

    res.status(err.statusCode || 500).json({
      error: true,
      message: err.message
    });
  }
}

module.exports = {
  insertarAlerta,
  listar,
  marcarLeida
};