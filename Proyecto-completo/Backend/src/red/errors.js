const respuesta = require('./respuestas');

function errors(err, req, res, next){
    console.error('[error]',err);

    const mensaje = err.message || 'Error interno';
    const status = err.statusCode || 500;

    res.status(status).send({
        error: true,
        status,
        body: message,
    });
}

module.exports = errors;