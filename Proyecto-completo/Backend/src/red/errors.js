const respuesta = require('./respuestas');

function errors(err, req, res, next){
    console.error('Objeto error completo:', err);

    let message = err.message || 'Error interno';
    let status = err.statusCode || 500;

    if(err instanceof Error){
        message = err.message || message;
        status = err.statusCode || status;
    }

    if(typeof err === 'string'){
        message = err;
    }

    res.status(status).json({
        error: true,
        status,
        body: message,
    });
}

module.exports = errors;