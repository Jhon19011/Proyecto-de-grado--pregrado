const express = require('express');
const router = express.Router();
const respuesta = require('../../red/respuestas');
const controlador = require('./controlador');
const { verificarToken } = require('../../middleware/auth');

// Registrar movimiento local
router.post('/', verificarToken, async (req, res, next) => {
    try {
        const user = req.user;
        const data = req.body;

        if(data.destino_id) {
            const resultado = await controlador.trasladarSustancia(data.user);
            res.json(resultado);
        } else {
            const resultado = await controlador.registrarMovimiento(data, user);
            res.json(resultado);
        }
    } catch (err) {
        next(err);
    }
});
router.post('/trasladar', verificarToken, async (req, res, next) => {
    try {
        console.log('Datos recibidos para traslado:', req.body);
        const asignacion = await controlador.trasladarSustancia(req.body, req.user);
        respuesta.success(req, res, asignacion, 201);
    } catch (err) {
        next(err);
    }
});

// Movimiento local de secundario
router.post('/secundario', verificarToken, async (req, res, next) => {
    try {
        const resultado = await controlador.registrarMovimientoSecundario(req.body, req.user);
        res.json(resultado);
    } catch (err) {
        next(err);
    }
});

// Listar movimientos de una sustancia en inventario
router.get('/:inventario_sustancia_id', async (req, res, next) => {
    try {
        const result = await controlador.listarMovimientos(req.params.inventario_sustancia_id);
        res.json({ body:result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;