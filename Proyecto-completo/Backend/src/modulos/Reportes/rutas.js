const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const { verificarToken } = require('../../middleware/auth');

router.get('/inventario', verificarToken, controlador.exportarInventario);

module.exports = router;