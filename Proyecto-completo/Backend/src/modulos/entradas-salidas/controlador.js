const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const TABLA_MOV = 'movimientos_sustancia';
const TABLA_INV = 'tablas'
const TABLA_ASIG = 'inventario_sustancia'

// Registrar movimiento (entrada-salida local)
async function registrarMovimiento(data, user) {
    const { inventario_sustancia_id, tipo, cantidad, motivo, usuario, fecha } = data

    if (!inventario_sustancia_id || !tipo || !cantidad || !fecha) {
        throw error('Todos los datos son obligatorios', 400);
    }

    // Buscar asignación
    const [asignacion] = await db.query(
        `SELECT * FROM ${TABLA_ASIG} WHERE idinventario_sustancia = ?`,
        [inventario_sustancia_id]
    );

    if (!asignacion) throw error('Sustancia no encontrada en el inventario', 404);

    // Obtener inventario
    const [inventario] = await db.query(
        `SELECT * FROM ${TABLA_INV} WHERE idinventario = ?`,
        [asignacion.tabla]
    );

    if (!inventario) throw error('Inventario no encontrado', 404);

    let nuevoRemanente = asignacion.cantidadremanente;

    // Cálculo stock
    if (tipo === 'entrada') {
        nuevoRemanente += cantidad;
    } else if (tipo === 'salida') {
        if (cantidad > nuevoRemanente) {
            throw error('Cantidad insuficiente en el inventario', 404);
        }
        nuevoRemanente -= cantidad;
    } else {
        throw error('Tipo de movimiento inválido', 400);
    }

    // Actualizar remanente
    await db.query(
        `UPDATE ${TABLA_ASIG} SET cantidadremanente = ? WHERE idinventario_sustancia = ?`,
        [nuevoRemanente, inventario_sustancia_id]
    );

    // Registrar movimiento
    await db.query(
        `INSERT INTO ${TABLA_MOV} (inventario_sustancia_id, tipo, cantidad, motivo, usuario, fecha)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            inventario_sustancia_id,
            tipo,
            cantidad,
            motivo || (tipo === 'entrada' ? 'Devolución usuario' : 'Entrega usuario'),
            usuario || user.id,
            fecha
        ]
    );

    return {
        mensaje: `Movimiento ${tipo} registrado correctamente en ${inventario.nombretabla}`,
        remanente: nuevoRemanente,
    };
}

// Traslado interno (principal -> secundario)
async function trasladarSustancia(data, user) {
    const { destino_id, sustancia_id, cantidad, motivo, usuario } = data;
    const sedeId = user.sedeU;

    if (!destino_id || !sustancia_id || !cantidad) {
        throw error('El inventario destino, la sustancia y la cantidad son requeridos', 400);
    }

    // Buscar inventario principal
    const [principal] = await db.query(
        `SELECT * FROM ${TABLA_INV} WHERE principal = 1 AND sedeT = ?`,
        [sedeId]
    );
    if (!principal) throw error('No se encontró inventario principal para esta sede', 404);

    // Buscar asignación origen (principal)
    const [asigOrigen] = await db.query(
        `SELECT * FROM ${TABLA_ASIG} WHERE tabla = ? AND sustancia = ?`,
        [principal.idtablas, sustancia_id]
    );
    if (!asigOrigen) throw error('La sustancia no existe en el inventario principal', 400);

    if (asigOrigen.cantidadremanente < cantidad) {
        throw error('Cantidad insuficiente en el inventario principal', 400);
    }

    // Buscar o crear asignación destino (secundario)
    let [asigDestino] = await db.query(
        `SELECT * FROM ${TABLA_ASIG} WHERE tabla = ? AND sustancia = ?`,
        [destino_id, sustancia_id]
    );

    await db.query('START TRANSACTION');
    try {
        const cantidadNum = Number(cantidad);

        // Restar del principal
        const nuevoOrigen = Number(asigOrigen.cantidadremanente) - cantidadNum;
        await db.query(
            `UPDATE ${TABLA_ASIG} SET cantidadremanente = ? WHERE idinventario_sustancia = ?`,
            [nuevoOrigen, asigOrigen.idinventario_sustancia]
        );

        // Si no existe la asignación en el destino, crearla
        if (!asigDestino) {
            const insertResult = await db.query(
                `INSERT INTO ${TABLA_ASIG} (tabla, sustancia, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [destino_id, sustancia_id, cantidadNum, cantidadNum, 0, '']
            );

            // Recuperar el registro recién creado
            const [nuevoDestino] = await db.query(
                `SELECT * FROM ${TABLA_ASIG} WHERE idinventario_sustancia = ?`,
                [insertResult.insertId]
            );
            asigDestino = nuevoDestino;
        } else {
            // Si ya existe, solo actualizar cantidades
            const nuevoDestino = Number(asigDestino.cantidadremanente || 0) + cantidadNum;
            await db.query(
                `UPDATE ${TABLA_ASIG} SET cantidadremanente = ? WHERE idinventario_sustancia = ?`,
                [nuevoDestino, asigDestino.idinventario_sustancia]
            );

            // Actualizar objeto local para usar su ID
            asigDestino.cantidadremanente = nuevoDestino;
        }

        // Registrar movimiento de salida (principal)
        await db.query(
            `INSERT INTO ${TABLA_MOV} (inventario_sustancia_id, tipo, cantidad, motivo, usuario)
             VALUES (?, 'salida', ?, ?, ?)`,
            [asigOrigen.idinventario_sustancia, cantidadNum, motivo || 'Traslado interno', usuario || user.id]
        );

        // Registrar movimiento de entrada (secundario)
        await db.query(
            `INSERT INTO ${TABLA_MOV} (inventario_sustancia_id, tipo, cantidad, motivo, usuario)
             VALUES (?, 'entrada', ?, ?, ?)`,
            [asigDestino.idinventario_sustancia, cantidadNum, motivo || 'Traslado interno', usuario || user.id]
        );

        await db.query('COMMIT');
        return { mensaje: 'Traslado interno realizado correctamente' };
    } catch (err) {
        await db.query('ROLLBACK');
        console.error('Error en traslado interno:', err);
        throw error('Error al realizar el traslado interno', 500);
    }
}




// Movimiento local en secundario
async function registrarMovimientoSecundario(data, user) {
    const { inventario_sustancia_id, tipo, cantidad, motivo, usuario, fecha } = data;

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

    let nuevoRemanente = asignacion.cantidadremanente;

    // Cálculo del movimiento
    if (tipo === 'entrada') {
        nuevoRemanente += cantidad;
    } else if (tipo === 'salida') {
        if (cantidad > nuevoRemanente) {
            throw error('No hay suficiente cantidad de esta sustancia en el inventario', 400);
        }
        nuevoRemanente -= cantidad;
    } else {
        throw error('Tipo de movimiento inválido', 400);
    }

    // Actualizar el stock
    await db.query(
        `UPDATE ${TABLA_ASIG} SET cantidadremanente = ? WHERE idinventario_sustancia = ?`,
        [nuevoRemanente, inventario_sustancia_id]
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
            usuario || user.id,
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
        ORDER BY m.fecha DESC`, [ inventario_sustancia_id ]
    );
}

module.exports = {
    trasladarSustancia,
    registrarMovimiento,
    registrarMovimientoSecundario,
    listarMovimientos
}