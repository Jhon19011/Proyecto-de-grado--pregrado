const express = require('express');
const router = express.Router();
const controlador = require('./controlador');

router.post('/login', login);

async function login(req, res) {
    try {
        const { token, usuario, rol } = await controlador.login(req.body);
        // Enviamos directamente el token, el usuario y el rol, sin envolverlo en body
        res.json({ token, usuario, rol, sedeU: usuario.sede });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = router;
