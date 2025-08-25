const express = require('express');
const morgan = require('morgan');
const config = require('./config');

const sede = require('./modulos/sustancias/rutas');
const error = require('./red/errors');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api/sede', sede)
app.use(error)

module.exports = app;