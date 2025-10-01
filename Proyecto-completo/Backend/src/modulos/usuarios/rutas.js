const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const recuperar = require('./recuperar')
const respuesta = require('../../red/respuestas');
const verificarToken = require('../../middleware/auth').verificarToken;
const verificarRol = require('../../middleware/verificarRol');

// Crear usuario
router.post('/', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
    try {
        const nuevo = await controlador.crearUsuario(req.body);
        respuesta.success(req, res, nuevo, 201);
    } catch (err) {
        next(err);
    }
});

// Listar usuarios
router.get('/', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
    try {
        const usuarios = await controlador.listarUsuarios();
        respuesta.success(req, res, usuarios, 200);
    } catch (err) {
        next(err);
    }
});

//Listar usuario por id
router.get('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
    try {
        const usuario = await controlador.obtenerUsuario(req.params.id);
        respuesta.success(req, res, usuario, 200);
    } catch (err) {
        next(err);
    }
});

//Actualizar Usuario
router.put('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
    try {
        const actualizado = await controlador.actualizarUsuario(req.params.id, req.body);
        respuesta.success(req, res, actualizado, 200);
    } catch (err) {
        next(err);
    }
});

//Eliminar usuario
router.delete('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
    try {
        const result = await controlador.eliminarUsuario(req.params.id);
        respuesta.success(req, res, result, 200);
    } catch (err) {
        next(err);
    }
});

//Solicitar recuperación
router.post('/recuperar', async (req, res, next) => {
    try {
        const { correo } = req.body;
        const result = await recuperar.solicitarRecuperacion(correo);
        respuesta.success(req, res, result, 200);
    } catch (err) {
        next(err);
    }
});

router.post('/restablecer', async (req, res, next) => {
    try {
        const { token, nuevaContrasena } = req.body;
        const result = await recuperar.restablecerContrasena(token, nuevaContrasena);
        respuesta.success(req, res, result, 200);
    } catch (err){
        next(err);
    }
});

module.exports = router;
