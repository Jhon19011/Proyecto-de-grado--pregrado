const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'Token requerido' });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ error: 'Token invalido' });

    try {
        const decoded = jwt.verify(token, 'secreto');
        console.log("Playload del token:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token no válido o expirado' });
    }
}
module.exports = { verificarToken };