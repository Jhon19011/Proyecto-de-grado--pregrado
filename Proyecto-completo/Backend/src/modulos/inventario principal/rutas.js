const express = require('express');
const router = express.Router();
const crud = require('../CRUD/controlador');
const respuesta = require('../../red/respuestas');

router.get('', async (req, res) =>{
    try{
        const sustancia = await crud.listar();
        respuesta.success(req, res, sustancia, 200);
    }catch(error){
        respuesta.error(req, res, error.message, 500);
    }
});