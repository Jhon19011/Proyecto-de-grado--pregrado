const db = require('../../DB/mysql');
const { insertarAlerta } = require('../alertas/controlador');

async function generarAlertas(sedeId) {

  const datos = await db.query(`
    SELECT 
      isus.idinventario_sustancia,
      s.idsustancia,
      s.nombreComercial,
      t.nombretabla,
      isus.cantidadremanente,
      isus.fechadevencimiento
    FROM inventario_sustancia isus
    JOIN sustancia s ON s.idsustancia = isus.sustancia
    JOIN tablas t ON t.idtablas = isus.tabla
    WHERE s.sede_s = ?
  `, [sedeId]);

  for (const item of datos) {

    // 🔴 AGOTADO
    if (item.cantidadremanente <= 0) {
      await insertarAlerta({
        mensaje: `La sustancia ${item.nombreComercial} está agotada`,
        tipo: 'agotado',
        sedeId,
        idsustancia: item.idsustancia,
        idinventario: item.idinventario_sustancia
      });
    }

    // 🔴 VENCIDO
    if (item.fechadevencimiento < new Date()) {
      await insertarAlerta({
        mensaje: `La sustancia ${item.nombreComercial} está vencida`,
        tipo: 'vencido',
        sedeId,
        idsustancia: item.idsustancia,
        idinventario: item.idinventario_sustancia
      });
    }

    // 🟡 PRÓXIMO (30 días)
    const hoy = new Date();
    const proximo = new Date();
    proximo.setDate(hoy.getDate() + 30);

    if (item.fechadevencimiento <= proximo && item.fechadevencimiento >= hoy) {
      await insertarAlerta({
        mensaje: `La sustancia ${item.nombreComercial} está próxima a vencer`,
        tipo: 'proximo',
        sedeId,
        idsustancia: item.idsustancia,
        idinventario: item.idinventario_sustancia
      });
    }
  }
}

module.exports = {
  generarAlertas
};