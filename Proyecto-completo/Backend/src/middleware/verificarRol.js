
function verificarRol(rolesPermitidos) {
    return (req, res, next) => {
        try {
            const rolUsuario = req.user.rol;

            console.log("Rol en token:", rolUsuario);
            console.log("Roles permitidos:", rolesPermitidos);

            if (!rolesPermitidos.includes(rolUsuario)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
            next();
        } catch (err) {
            return res.status(403).json({ error: 'Rol no válido' });
        }
    };
}

module.exports = verificarRol;