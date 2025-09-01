const express = require('express');
const respuesta = require('../../red/respuestas')
const controlador = require('./controlador');

const router = express.Router();

router.get('/:tabla', listarRoutes);
router.get('/:tabla/:id', listarUnoRoutes);
router.post('/:tabla', agregarRoutes);
router.put('/:tabla/:id', eliminarRoutes);

async function listarRoutes(req, res, next) {
  try {
    const tabla = req.params.tabla;
    const items = await controlador.listar(tabla);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
};

async function listarUnoRoutes(req, res, next) {
  try {
    const tabla = req.params.tabla;
    const id = req.params.id;
    const items = await controlador.listarUno(tabla, id);
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
};

async function agregarRoutes(req, res, next) {
  try {
    const tabla = req.params.tabla;
    const data = req.body;

    const items = await controlador.agregar(tabla, data);

    const primaryKey = Object.keys(data).find(key => key.startsWith('id'));
    const mensaje = (primaryKey && data[primaryKey])
      ? 'Elemento actualizado exitosamente'
      : 'Elemento guardado exitosamente';

    respuesta.success(req, res, mensaje, 201);
  } catch (err) {
    console.error('Router: Error al procesar la solicitud:', err);
    next(err);
  }
};

async function eliminarRoutes(req, res, next) {
  try {
    const tabla = req.params.tabla;
    const id = req.params.id;

    const data = {[`id${tabla}`]: id}; // Construir el objeto data con la clave primaria

    const items = await controlador.eliminar(tabla, data);
    respuesta.success(req, res, 'Elemento eliminado exitosamente', 200);
  } catch (err) {
    next(err);
  }
};

module.exports = router;