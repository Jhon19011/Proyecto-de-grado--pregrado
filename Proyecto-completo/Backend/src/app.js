const { verificarToken } = require('./middleware/auth');
const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./modulos/CRUD/rutas');
const authRoutes = require('./modulos/auth/rutas');
const userRoutes = require('./modulos/usuarios/rutas');
const error = require('./red/errors');
const cors = require('cors');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Ruta sede protegida
app.get('/api/sede', verificarToken, async(req, res) => {
    const [rows] = await db.query('SELECT * FROM sede');
  res.json(rows);
});

// Configuración
app.set('port', config.app.port);

// Rutas
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/usuario', userRoutes);
app.use(error);

module.exports = app;