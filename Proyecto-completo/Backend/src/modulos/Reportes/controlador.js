const ExcelJS = require('exceljs');
const path = require('path');
const db = require('../../DB/mysql');

function construirConsultaInventario({ tabla, sedeId, filtros = {}, page = 1, limit = 10 }) {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const offset = (pageNum - 1) * limitNum;
    const mostrarAgotadas = filtros.estado_uso === 'Agotado';
    const condicionVisibilidad = mostrarAgotadas
        ? `AND (isus.estado_uso = 'Agotado' OR isus.cantidadremanente <= 0)`
        : `AND isus.estado = 1 AND isus.estado_uso <> 'Agotado' AND isus.cantidadremanente > 0`;

    let sql = `
      SELECT 
        isus.idinventario_sustancia,
        isus.cedula_principal,
        isus.cantidad,
        isus.cantidadremanente,
        isus.gastototal,
        isus.ubicaciondealmacenamiento,
        isus.estado_uso,
        isus.lote,
        isus.fechadevencimiento,
        isus.observaciones,
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
        t.nombretabla,
        (
          SELECT MAX(m.fecha)
          FROM movimientos_sustancia m
          WHERE m.inventario_sustancia_id = isus.idinventario_sustancia
            AND m.tipo = 'salida'
        ) AS fecha_agotado
      FROM inventario_sustancia isus
      JOIN sustancia s ON s.idsustancia = isus.sustancia
      LEFT JOIN unidades u ON u.idunidad = s.unidad
      JOIN tablas t ON t.idtablas = isus.tabla
      WHERE isus.tabla = ?
        ${condicionVisibilidad}
        AND t.sedeT = ?
    `;

    const params = [tabla, sedeId];

    if (filtros.sustancia) {
        sql += ` AND s.nombreComercial LIKE ?`;
        params.push(`%${filtros.sustancia}%`);
    }

    if (filtros.cedula) {
        sql += ` AND isus.cedula_principal LIKE ?`;
        params.push(`%${filtros.cedula}%`);
    }

    if (filtros.codigo) {
        sql += ` AND s.codigo LIKE ?`;
        params.push(`%${filtros.codigo}%`);
    }

    if (filtros.estado_uso && !mostrarAgotadas) {
        sql += ` AND isus.estado_uso = ?`;
        params.push(filtros.estado_uso);
    }

    if (filtros.unidad) {
        sql += ` AND u.nombre LIKE ?`;
        params.push(`%${filtros.unidad}%`);
    }

    if (filtros.lote) {
        sql += ` AND isus.lote LIKE ?`;
        params.push(`%${filtros.lote}%`);
    }

    if (filtros.fecha_vencimiento) {
        sql += ` AND DATE(isus.fechadevencimiento) = ?`;
        params.push(filtros.fecha_vencimiento);
    }

    if (filtros.ubicacion) {
        sql += ` AND isus.ubicaciondealmacenamiento LIKE ?`;
        params.push(`%${filtros.ubicacion}%`);
    }

    if (
        filtros.esControlada !== undefined &&
        filtros.esControlada !== null &&
        filtros.esControlada !== ''
    ) {
        sql += ` AND s.esControlada = ?`;
        params.push(Number(filtros.esControlada));
    }

    if (mostrarAgotadas) {
        sql += ` ORDER BY fecha_agotado DESC, isus.idinventario_sustancia DESC LIMIT ? OFFSET ?`;
    } else {
        sql += ` ORDER BY isus.cedula_principal ASC, isus.idinventario_sustancia ASC LIMIT ? OFFSET ?`;
    }
    params.push(limitNum, offset);

    return { sql, params };
}

async function exportarInventario(req, res) {
    try {
        const { tabla, page, limit, ...filtros } = req.query;
        const sedeId = req.user.sedeU;

        if (!tabla) {
            return res.status(400).json({
                error: true,
                message: 'El inventario es obligatorio para exportar'
            });
        }

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

        const { sql, params } = construirConsultaInventario({
            tabla,
            sedeId,
            filtros,
            page,
            limit
        });

        const data = await db.query(sql, params);

        const columnas = [
            { columna: 'C', valor: (item) => item.numero || '' },
            { columna: 'D', valor: (item) => item.codigo || '' },
            { columna: 'E', valor: (item) => item.nombreComercial || '' },
            { columna: 'F', valor: (item) => item.marca || '' },
            { columna: 'G', valor: (item) => item.lote || '' },
            { columna: 'H', valor: (item) => item.CAS || '' },
            { columna: 'I', valor: (item) => item.clasedepeligrosegunonu || '' },
            { columna: 'J', valor: (item) => item.categoriaIARC || '' },
            { columna: 'K', valor: (item) => item.estado || '' },
            { columna: 'L', valor: (item) => item.fechadevencimiento ? new Date(item.fechadevencimiento) : null },
            { columna: 'M', valor: (item) => item.presentacion || '' },
            { columna: 'N', valor: (item) => item.ubicaciondealmacenamiento || '' },
            { columna: 'O', valor: (item) => Number(item.cantidad ?? 0) },
            { columna: 'P', valor: (item) => Number(item.cantidadremanente ?? 0) },
            { columna: 'Q', valor: (item) => Number(item.gastototal ?? 0) }
        ];

        let fila = 5;

        data.forEach((item) => {
            columnas.forEach(({ columna, valor }) => {
                sheet.getCell(`${columna}${fila}`).value = valor(item);
            });

            fila++;
        });

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
