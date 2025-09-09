const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');

router.post('/registro', registro);

async function registro(req, res) {
    try {
        const usuario = await controlador.registrar(req.body);
        respuesta.success(req, res, 'Usuario registrado exitosamente', 201);
    } catch (error) {
        respuesta.error(req, res, error.message, 400);
    }
}

module.exports = router;
