const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const crud = require('../CRUD/controlador');
const respuesta = require('../../red/respuestas');

router.post('/registro', registro);

router.get('', async (req, res) =>{
    try{
        const usuarios = await crud.listar();
        respuesta.success(req, res, usuarios, 200);
    }catch(error){
        respuesta.error(req, res, error.message, 500);
    }
});

async function registro(req, res) {
    try {
        const usuario = await controlador.registrar(req.body);
        respuesta.success(req, res, 'Usuario registrado exitosamente', 201);
    } catch (error) {
        respuesta.error(req, res, error.message, 400);
    }
}

module.exports = router;
