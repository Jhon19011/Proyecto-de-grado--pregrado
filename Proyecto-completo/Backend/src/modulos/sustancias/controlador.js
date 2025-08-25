const db = require('../../DB/mysql');

const TABLA = 'sede';

function todosSede (){
    return db.todosSede(TABLA);
}

function unoSede (id){
    return db.unoSede(TABLA, id);
}

function agregarSede (body){
    console.log('Controller: Datos recibidos:', body);
    if (body.idsede) {
        // Si tiene ID, es una actualización
        console.log('Controller: Actualizando sede existente');
        return db.actualizar(TABLA, body);
    } else {
        // Si no tiene ID, es una inserción
        console.log('Controller: Insertando nueva sede');
        return db.insertar(TABLA, body);
    }
}

function eliminarSede (body){
    return db.eliminarSede(TABLA, body);
}

module.exports = {
    todosSede,
    unoSede,
    agregarSede,
    eliminarSede
}