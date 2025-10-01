const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');
const verificarToken = require('../../middleware/auth').verificarToken;
const verificarRol = require('../../middleware/verificarRol');

// listar inventarios
router.get('/', verificarToken, verificarRol(['Administrador', 'Auxiliar']), async (req, res, next) => {
  try {
    const inventarios = await controlador.listarInventarios();
    respuesta.success(req, res, inventarios, 200);
  } catch (err) {
    next(err);
  }
});

// Listar inventarios por id
router.get('/:id', verificarToken, verificarRol(['Administrador', 'Auxiliar']), async (req, res, next) => {
  try {
    const inventario = await controlador.obtenerInventario(req.params.id);
    respuesta.success(req, res, inventario, 200);
  } catch (err) {
    next(err);
  }
});

// Crear inventario
router.post('/', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
  try {
    const nuevoI = await controlador.crearInventario(req.body);
    respuesta.success(req, res, nuevoI, 201);
  } catch (err) {
    next(err.message);
  }
});

// Actualizar Inventario
router.put('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
  try {
    const actualizado = await controlador.actualizarInventario(req.params.id, req.body);
    respuesta.success(req, res, actualizado, 200);
  } catch (err) {
    next(err);
  }
});

// Eliminar inventario
router.delete('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
  try {
    const eliminado = await controlador.eliminarInventario(req.params.id);
    respuesta.success(req, res, eliminado, 200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;