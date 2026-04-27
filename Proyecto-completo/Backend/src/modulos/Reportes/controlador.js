const ExcelJS = require('exceljs');
const path = require('path');
const db = require('../../DB/mysql');

async function exportarInventario(req, res) {
    try {

        const workbook = new ExcelJS.Workbook();

        const filePath = path.resolve(
            __dirname,
            '../../../plantillas/SUSTANCIAS_QUIMICAS.xlsx'
        );

        await workbook.xlsx.readFile(filePath);

        const sheet = workbook.getWorksheet('INVENTARIO');

        if (!sheet) {
            throw new Error('No se encontró la hoja INVENTARIO en la plantilla');
        }

        const data = await db.query(`
      SELECT * FROM inventario_sustancia
    `);

        let fila = 5;

        data.forEach((item, index) => {

            sheet.getCell(`C${fila}`).value = index + 1;
            sheet.getCell(`D${fila}`).value = item.codigo || '';

            // E-F-G merge
            sheet.getCell(`E${fila}`).value = item.nombre_comercial || '';

            sheet.getCell(`H${fila}`).value = item.marca || '';
            sheet.getCell(`I${fila}`).value = item.lote || '';
            sheet.getCell(`J${fila}`).value = item.cas || '';

            // K-L merge
            sheet.getCell(`K${fila}`).value = item.clase_onu || '';

            sheet.getCell(`M${fila}`).value = item.iarc || '';
            sheet.getCell(`N${fila}`).value = item.estado || '';

            // fecha segura
            sheet.getCell(`O${fila}`).value = item.fecha_vencimiento
                ? new Date(item.fecha_vencimiento)
                : null;

            // P-Q merge
            sheet.getCell(`P${fila}`).value = item.presentacion || '';

            sheet.getCell(`R${fila}`).value = item.ubicacion || '';

            sheet.getCell(`S${fila}`).value = Number(item.cantidad ?? 0);
            sheet.getCell(`T${fila}`).value = Number(item.cantidad_remanente ?? 0);
            sheet.getCell(`U${fila}`).value = Number(item.gasto_total ?? 0);

            fila++;
        });

        // 🔥 IMPORTANTE: usar buffer (NO res.end)
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=inventario.xlsx'
        );

        return res.send(buffer);

    } catch (err) {
        console.error("ERROR EXPORTANDO:", err);

        return res.status(500).json({
            error: true,
            message: err.message
        });
    }
}

module.exports = { exportarInventario };