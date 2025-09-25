const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');

// Crear sustancia
router.post('/', async (req, res, next) => {
    try {
        const nueva = await controlador.crearSustancia(req.body);
        respuesta.success(req, res, nueva, 201);
    } catch (err) {
        next(err);
    }
});

// Listar Sustancias
router.get('/', async (req, res, next) => {
    try {
        const sustancias = await controlador.listarSustancias();
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

module.exports = router;