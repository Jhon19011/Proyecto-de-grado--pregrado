const express = require('express');
const morgan = require('morgan');
const config = require('./config');

const routes = require('./modulos/sustancias/rutas');
const error = require('./red/errors');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api', routes)
app.use(error)

module.exports = app;