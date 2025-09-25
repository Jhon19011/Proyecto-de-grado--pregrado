
function error(mensaje, code) {
    const e = new Error(mensaje);
    e.statusCode = code || 500;
    return e;
}

module.exports = error;