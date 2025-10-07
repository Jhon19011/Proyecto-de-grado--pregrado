const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');
const verificarToken = require('../../middleware/auth').verificarToken;
const verificarRol = require('../../middleware/verificarRol');

// Crear sustancia
router.post('/', verificarToken, async (req, res, next) => {
    try {
        const sedeId = req.user.sedeU;
        const nueva = await controlador.crearSustancia(req.body, sedeId);
        respuesta.success(req, res, nueva, 201);
    } catch (err) {
        next(err);
    }
});

// Listar Sustancias
router.get('/', verificarToken, async (req, res, next) => {
    try {
        const sedeId = req.user.sedeU;
        const sustancias = await controlador.listarSustancias(sedeId);
        respuesta.success(req, res, sustancias, 200);
    } catch (err) {
        next(err);
    }
});

// Listar controladas
router.get('/controladas', verificarToken, async (req, res, next) => {
  try {
    const sedeId = req.user.sedeU;
    const sustancias = await controlador.listarSustanciasPorSede(sedeId);
    respuesta.success(req, res, sustancias, 200);
  } catch (err) {
    next(err);
  }
});

// Listar sustancia por id
router.get('/:id', async (req, res, next) => {
    try {
        const sustancia = await controlador.obtenerSustancia(req.params.id);
        respuesta.success(req, res, sustancia, 200);
    } catch (err) {
        next(err);
    }
});

// Actualizar sustancia
router.put('/:id', async (req, res, next) => {
    try {
        const resultado = await controlador.actualizarSustancia(req.params.id, req.body);
        respuesta.success(req, res, resultado, 200)    
    } catch (err) {
        next(err);
    }
});

// Eliminar sustancia 
router.delete('/:id', async (req, res, next) => {
    try {
        const resultado = await controlador.eliminarSustancia(req.params.id);
        respuesta.success(req, res, resultado, 200);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/autorizacion', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
  try {
    const { autorizada } = req.body;
    const sedeId = req.user.sedeU;
    console.log("sede detectada:", sedeId);
    const result = await controlador.actualizarAutorizacion(req.params.id, sedeId, autorizada);
    respuesta.success(req, res, result, 200);
  } catch (err) {
    next(err);
  }
});


module.exports = router;