const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');

// listar inventarios
router.get('/', async (req, res, next) => {
  try {
    const inventarios = await controlador.listarInventarios();
    respuesta.success(req, res, inventarios, 200);
  } catch (err) {
    next(err);
  }
});

// Listar inventarios por id
router.get('/:id', async (req, res, next) => {
  try {
    const inventario = await controlador.obtenerInventario(req.params.id);
    respuesta.success(req, res, inventario, 200);
  } catch (err) {
    next(err);
  }
});

// Crear inventario
router.post('/', async (req, res, next) => {
  try {
    const nuevoI = await controlador.crearInventario(req.body);
    respuesta.success(req, res, nuevoI, 201);
  } catch (err) {
    next(err.message);
  }
});

// Actualizar Inventario
router.put('/:id', async (req, res, next) => {
  try {
    const actualizado = await controlador.actualizarInventario(req.params.id, req.body);
    respuesta.success(req, res, actualizado, 200);
  } catch (err) {
    next(err);
  }
});

// Eliminar inventario
router.delete('/:id', async (req, res, next) => {
  try {
    const eliminado = await controlador.eliminarInventario(req.params.id);
    respuesta.success(req, res, eliminado, 200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;