const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');
const { verificarToken } = require('../../middleware/auth');

router.get('/:tabla', verificarToken, async (req, res, next) => {
    try {
        const sustancias = await controlador.listarPorInventario(req.params.tabla);
        respuesta.success(req, res, sustancias, 200);
    } catch (err){
        next(err);
    }
});

router.post('/', verificarToken, async (req, res, next) => {
  try {
    console.log('📥 Datos recibidos para nueva asignación:', req.body);
    const nueva = await controlador.asignarSustancia(req.body);
    respuesta.success(req, res, nueva, 201);
  } catch (err) {
    next(err);
  }
});


router.put('/:id', verificarToken, async (req,res, next) => {
    try {
        const editado = await controlador.editarAsignacion(req.params.id, req.body);
        respuesta.success(req, res, editado, 200);
    } catch (err){
        next(err);
    }
});

router.delete('/:id', verificarToken, async (req, res, next) =>{
    try {
        const eliminado = await controlador.eliminarAsignacion(req.params.id);
        respuesta.success(req, res, eliminado, 200);
    } catch (err) {
        next(err);
    }
});

module.exports = router;