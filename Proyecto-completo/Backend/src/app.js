const { verificarToken } = require('./middleware/auth');
const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./modulos/auth/rutas');
const userRoutes = require('./modulos/usuarios/rutas');
const sustanciasRoutes = require('./modulos/sustancias/rutas');
const inventariosRoutes = require('./modulos/inventarios/rutas');
const inventarioSustancias = require('./modulos/inventario_sustancias/rutas');
const movimientos = require('./modulos/entradas-salidas/rutas');
const unidadesRoutes = require('./modulos/unidades/rutas');
const alertasRoutes = require('./modulos/alertas/rutas');
const reportes = require('./modulos/reportes/rutas');
const error = require('./red/errors');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/movimientos', movimientos);
app.use('/api/unidades', unidadesRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/reportes', reportes);

app.use(error);

module.exports = app;