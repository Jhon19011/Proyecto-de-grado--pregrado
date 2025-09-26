const express = require('express');
const router = express.Router();
const movimientos = require('./controlador');

// Registrar movimiento
router.post('/', async (req, res, next) => {
    try {
        const result = await movimientos.registrarMovimiento(req.body);
        res.status(201).json({ body: result });
    } catch (err) {
        next(err);
    }
});

// Listar movimientos de una sustancia en inventario
router.get('/:inventario_sustancia_id', async (req, res, next) => {
    try {
        const result = await movimientos.listarMovimientos(req.params.inventario_sustancia_id);
        res.json({ body:result });
    } catch (err) {
        next(err);
    }
});

module.exports = router;