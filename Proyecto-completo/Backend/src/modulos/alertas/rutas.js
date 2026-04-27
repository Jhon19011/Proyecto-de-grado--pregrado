const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const { verificarToken } = require('../../middleware/auth');

router.get('/', verificarToken, async (req, res) => {
    const data = await controlador.listar(req.user.sedeU);
    res.json(data);
});

router.put('/:id/leida', verificarToken, controlador.marcarLeida);

module.exports = router;