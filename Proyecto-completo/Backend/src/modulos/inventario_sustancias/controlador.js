const db = require('../../DB/mysql');
const error = require('../../middleware/errors');
const TABLA = 'inventario_sustancia'

// Asignar sustancia a inventario
async function asgnarSustancia(data){
    const { sustancia, tabla, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento } = data;

    if(sustancia == null || cantidad == null || cantidadremanente == null || gastototal == null || !ubicaciondealmacenamiento){
        throw error('Todos los campos son obligatorios', 400);
    }

    // Validacion de existencia previa
    const existe = await db.query(`SELECT * FROM ${TABLA} WHERE tabla = ? AND sustancia = ?`, [tabla, sustancia]);
    if(existe.length > 0){
        throw error('La sustancia ya está asignada a este inventario', 400);
    }

    const query = `INSERT INTO ${TABLA} (sustancia, tabla, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = await db.query(query, [sustancia, tabla, cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento]);

    return {id: result.insertId, ...data};
}

// Listar sustancias de un inventario
async function listarPorInventario(tabla){
    return db.query(`
        SELECT 
        isus.idinventario_sustancia AS idinventario_sustancia, 
        s.numero, 
        s.codigo, 
        s.nombreComercial, 
        s.marca, 
        s.lote, 
        s.CAS, 
        s.clasedepeligrosegunonu, 
        s.categoriaIARC, 
        s.estado, 
        s.fechadevencimiento, 
        s.presentacion, 
        s.PDF, 
        isus.cantidad, 
        isus.cantidadremanente, 
        isus.gastototal, 
        isus.ubicaciondealmacenamiento
        FROM ${TABLA} isus
        JOIN sustancia s ON s.idsustancia = isus.sustancia
        WHERE isus.tabla = ?`, [tabla]);
}

async function editarAsignacion(id, data){
    const {cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento} = data;

    if(cantidad == null || cantidadremanente == null || gastototal == null || !ubicaciondealmacenamiento){
        throw error('Todos los campos son obligatorios', 400);
    }

    const query =`
        UPDATE ${TABLA}
        SET cantidad = ?, cantidadremanente = ?, gastototal = ?, ubicaciondealmacenamiento = ?
        WHERE idinventario_sustancia = ?`;
    
    await db.query(query, [cantidad, cantidadremanente, gastototal, ubicaciondealmacenamiento, id]);
    return {mensaje: 'Asignación actualizada con éxito'};
}

async function eliminarAsignacion(id){
    await db.query(`DELETE FROM ${TABLA} WHERE idinventario_sustancia = ?`, [id]);
    return {mensaje: 'Sustancia eliminada del inventario exitosamente'};
}

module.exports = {
    asgnarSustancia,
    listarPorInventario,
    editarAsignacion,
    eliminarAsignacion
}