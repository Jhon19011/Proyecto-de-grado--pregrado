const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');

router.post('/login', login);

async function login(req, res) {
    try {
        const { token, usuario } = await controlador.login(req.body);
        // Enviamos directamente el token y el usuario, sin envolverlo en body
        res.json({ token, usuario });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = router;
