const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');
const { verificarToken } = require('../../middleware/auth');
const verificarRol = require('../../middleware/verificarRol');

router.post('/', verificarToken, async (req, res, next) => {
  try {
    const nueva = await controlador.asignarSustancia(req.body);
    respuesta.success(req, res, nueva, 201);
  } catch (err) {
    next(err);
  }
});

router.get('/:tabla', verificarToken, async (req, res, next) => {
  try {

    console.log("QUERY:", req.query);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // EXTRAER FILTROS
    const { page: _, limit: __, ...filtros } = req.query;

    const data = await controlador.listarPorInventario(
      req.params.tabla,
      req.user.sedeU,
      filtros,  
      page,
      limit
    );

    res.json(data);

  } catch (err) {
    next(err);
  }
});


router.put('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
  try {
    const editado = await controlador.editarAsignacion(req.params.id, req.body);
    respuesta.success(req, res, editado, 200);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
  try {
    const eliminado = await controlador.eliminarAsignacion(req.params.id);
    respuesta.success(req, res, eliminado, 200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
