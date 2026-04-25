const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const verificarToken = require('../../middleware/auth').verificarToken;

router.get('/', verificarToken, async (req, res, next) => {
  try {
    const data = await controlador.listar();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.post('/', verificarToken, async (req, res, next) => {
  try {
    const data = await controlador.crear(req.body);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', verificarToken, async (req, res, next) => {
  try {
    await controlador.eliminar(req.params.id);
    res.json({ mensaje: 'Unidad eliminada' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;