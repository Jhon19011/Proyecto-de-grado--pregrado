const express = require('express');
const respuesta = require('../../red/respuestas')
const controlador = require('./controlador');

const router = express.Router();

router.get('/', todosSede);
router.get('/:id', unoSede);
router.post('/', agregarSedeHandler);
router.put('/', eliminarSedeHandler);

async function todosSede(req, res, next) {
  try {
    const items = await controlador.todosSede();
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
};

async function unoSede(req, res, next) {
  try {
    const items = await controlador.unoSede(req.params.id);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
};

async function agregarSedeHandler(req, res, next) {
  try {
    // Convertir idsede a número si existe
    const sedeData = {
      idsede: req.body.idsede,
      nombre_sede: req.body.nombre_sede
    };
    
    const items = await controlador.agregarSede(sedeData);
    const mensaje = sedeData.idsede ? 'sede actualizada exitosamente' : 'sede guardada exitosamente';
    respuesta.success(req, res, mensaje, 201);
  } catch (err) {
    console.error('Router: Error al procesar la solicitud:', err);
    next(err);
  }
};

async function eliminarSedeHandler(req, res, next) {
  try {
    const items = await controlador.eliminarSede(req.body);
    respuesta.success(req, res, 'Sede eliminada exitosamente', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = router;