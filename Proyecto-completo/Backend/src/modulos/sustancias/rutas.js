const express = require('express');
const router = express.Router();
const controlador = require('./controlador');
const respuesta = require('../../red/respuestas');
const verificarToken = require('../../middleware/auth').verificarToken;
const verificarRol = require('../../middleware/verificarRol');
const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento pdf
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../uploads/sustancias'));
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, nombreUnico);
  }
});

// Filtro para aceptar solo PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Crear sustancia
router.post('/', verificarToken, verificarRol(['Administrador']), upload.fields([
    { name: 'pdf_seguridad', maxCount: 1 },
    { name: 'pdf_tecnico', maxCount: 1 }
  ]), async (req, res, next) => {
    try {
      const sedeId = req.user.sedeU;

      const data = {
        ...req.body,
        pdf_seguridad: req.files?.pdf_seguridad?.[0]
          ? `/uploads/sustancias/${req.files.pdf_seguridad[0].filename}`
          : null,
        pdf_tecnico: req.files?.pdf_tecnico?.[0]
          ? `/uploads/sustancias/${req.files.pdf_tecnico[0].filename}`
          : null
      };

      const nueva = await controlador.crearSustancia(data, sedeId);
      respuesta.success(req, res, nueva, 201);
    } catch (err) {
      next(err);
    }
  }
);

// Listar Sustancias
router.get('/', verificarToken, async (req, res, next) => {
    try {
        const sedeId = req.user.sedeU;
        const { page, limit } = req.query;
        const sustancias = await controlador.listarSustancias(sedeId, page, limit);
        respuesta.success(req, res, sustancias, 200);
    } catch (err) {
        next(err);
    }
});

// Listar controladas
router.get('/controladas', verificarToken, async (req, res, next) => {
    try {
        const sedeId = req.user.sedeU;
        const sustancias = await controlador.listarSustanciasPorSede(sedeId);
        respuesta.success(req, res, sustancias, 200);
    } catch (err) {
        next(err);
    }
});

// Buscar sustancias con filtros
router.get('/buscar', verificarToken, async (req, res, next) => {
    try {
        const sedeId = req.user.sedeU;
        const { page, limit, ...filtros } = req.query;

        const sustancias = await controlador.buscarSustancias(filtros, sedeId, page, limit);
        respuesta.success(req, res, sustancias, 200);
    } catch (err) {
        next(err);
    }
});

// Buscar sustancias controladas con filtros
router.get('/controladas/buscar', verificarToken, async (req, res, next) => {
  try {
    const sedeId = req.user.sedeU;
    const filtros = req.query;

    const sustancias = await controlador.buscarSustanciasControladas(filtros, sedeId);
    respuesta.success(req, res, sustancias, 200);
  } catch (err) {
    next(err);
  }
});

// Listar sustancia por id
router.get('/:id', async (req, res, next) => {
    try {
        const sustancia = await controlador.obtenerSustancia(req.params.id);
        respuesta.success(req, res, sustancia, 200);
    } catch (err) {
        next(err);
    }
});

// Actualizar sustancia
router.put('/:id', verificarToken, verificarRol(['Administrador']), upload.fields([
    { name: 'pdf_seguridad', maxCount: 1 },
    { name: 'pdf_tecnico', maxCount: 1 }
  ]), async (req, res, next) => {
    try {
      const data = { ...req.body };

      if (req.files?.pdf_seguridad?.[0]) {
        data.pdf_seguridad = `/uploads/sustancias/${req.files.pdf_seguridad[0].filename}`;
      }

      if (req.files?.pdf_tecnico?.[0]) {
        data.pdf_tecnico = `/uploads/sustancias/${req.files.pdf_tecnico[0].filename}`;
      }

      const resultado = await controlador.actualizarSustancia(req.params.id, data);
      respuesta.success(req, res, resultado, 200);
    } catch (err) {
      next(err);
    }
  }
);

// Eliminar sustancia 
router.delete('/:id', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
    try {
        const resultado = await controlador.eliminarSustancia(req.params.id, req.user.sedeU);
        respuesta.success(req, res, resultado, 200);
    } catch (err) {
        next(err);
    }
});

router.post('/:id/autorizacion', verificarToken, verificarRol(['Administrador']), async (req, res, next) => {
    try {
        const { autorizada } = req.body;
        const sedeId = req.user.sedeU;
        console.log("sede detectada:", sedeId);
        const result = await controlador.actualizarAutorizacion(req.params.id, sedeId, autorizada);
        respuesta.success(req, res, result, 200);
    } catch (err) {
        next(err);
    }
});


module.exports = router;
