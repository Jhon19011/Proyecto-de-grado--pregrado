const express = require('express');
const respuesta = require('../../red/respuestas')
const controlador = require('./controlador');

const router = express.Router();

router.get('/', async function (req, res){
  try{
    const items = await controlador.todos();
    respuesta.success(req, res, items, 200);
  }catch (err) {
    respuesta.error(req, res, err, 500);
  }});

router.get('/:id', async function (req, res){
  try{
    const items = await controlador.uno(req.params.id);
    respuesta.success(req, res, items, 200);
  }catch (err) {
    respuesta.error(req, res, err, 500);
  }});

module.exports = router;