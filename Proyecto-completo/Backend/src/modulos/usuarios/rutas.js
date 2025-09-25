const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');

// Crear usuario
router.post('/', async (req, res, next) => {
    try {
        const nuevo = await controlador.crearUsuario(req.body);
        respuesta.success(req, res, nuevo, 201);
    } catch (err) {
        next(err);
    }
});

// Listar usuarios
router.get('/', async (req, res, next) => {
    try {
        const usuarios = await controlador.listarUsuarios();
        respuesta.success(req, res, usuarios, 200);
    } catch (err) {
        next(err);
    }
});

//Listar usuario por id
router.get('/:id', async (req, res, next) => {
    try {
        const usuario = await controlador.obtenerUsuario(req.params.id);
        respuesta.success(req, res, usuario, 200);
    } catch (err) {
        next(err);
    }
});

//Actualizar Usuario
router.put('/:id', async (req, res, next) => {
    try {
        const actualizado = await controlador.actualizarUsuario(req.params.id, req.body);
        respuesta.success(req, res, actualizado, 200);
    } catch (err) {
        next(err);
    }
});

//Eliminar usuario
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await controlador.eliminarUsuario(req.params.id);
        respuesta.success(req, res, result, 200);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
