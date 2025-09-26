const { verificarToken } = require('./middleware/auth');
const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./modulos/auth/rutas');
const userRoutes = require('./modulos/usuarios/rutas');
const sustanciasRoutes = require('./modulos/sustancias/rutas');
const inventariosRoutes = require('./modulos/inventarios/rutas');
const inventarioSustancias = require('./modulos/inventario_sustancias/rutas')
const error = require('./red/errors');
const cors = require('cors');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Configuración
app.set('port', config.app.port);

// Rutas Públicas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);


app.use(verificarToken);

// Rutas Privadas
app.use('/api/sustancias', sustanciasRoutes);
app.use('/api/inventarios', inventariosRoutes);
app.use('/api/inventario_sustancias', inventarioSustancias);

app.use(error);

module.exports = app;