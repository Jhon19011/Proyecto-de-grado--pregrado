const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');

router.post('/', async (req, res, next) => {
    try {
        const asignacion = await controlador.asgnarSustancia(req.body);
        respuesta.success(req, res, asignacion, 201);
    } catch (err) {
        next(err);
    }
});

router.get('/:tabla', async (req, res, next) => {
    try {
        const sustancias = await controlador.listarPorInventario(req.params.tabla);
        respuesta.success(req, res, sustancias, 200);
    } catch (err){
        next(err);
    }
});

router.put('/:id', async (req,res, next) => {
    try {
        const editado = await controlador.editarAsignacion(req.params.id, req.body);
        respuesta.success(req, res, editado, 200);
    } catch (err){
        next(err);
    }
});

router.delete('/:id', async (req, res, next) =>{
    try {
        const eliminado = await controlador.eliminarAsignacion(req.params.id);
        respuesta.success(req, res, eliminado, 200);
    } catch (err) {
        next(err);
    }
});

module.exports = router;