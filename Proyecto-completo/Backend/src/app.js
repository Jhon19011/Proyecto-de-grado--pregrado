const express = require('express');
const morgan = require('morgan');
const config = require('./config');

const sede = require('./modulos/sustancias/rutas');

const app = express();

// Middleware
app.use(morgan('dev'));

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api/sede', sede)

module.exports = app;