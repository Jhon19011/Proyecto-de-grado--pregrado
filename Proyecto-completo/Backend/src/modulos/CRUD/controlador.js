const db = require('../../DB/mysql');

function listar(tabla) {
    return db.listarDB(tabla);
}

function listarUno(tabla, id) {
    return db.listarUnoDB(tabla, id);
}

function agregar(tabla, data) {
    console.log(`Controlador (${tabla}): Datos recibidos`, data);

    const primaryKey = Object.keys(data).find(key => key.startsWith('id'));
    if (primaryKey && data[primaryKey]) {
        // Si tiene ID, es una actualización
        console.log('Controlador: Actualizando elemento existente');
        return db.actualizarDB(tabla, data);
    } else {
        // Si no tiene ID, es una inserción
        console.log('Controlador: Insertando nuevo elemento');
        return db.insertarDB(tabla, data);
    }
}

function eliminar(tabla, data) {
    console.log(`Controlador: Eliminando en ${tabla}`, data);
        return db.eliminarDB(tabla, data);
}

module.exports = {
    listar,
    listarUno,
    agregar,
    eliminar
}