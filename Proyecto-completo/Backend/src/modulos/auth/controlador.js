const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../DB/mysql');

const TABLA = 'usuario';

async function login(data) {
    const { correo, password } = data;

    if (!correo || !password) {
        throw new Error('Correo y contraseña son requeridos');
    }

    // Buscar usuario por correo
    console.log('Buscando usuario con correo:', correo);
    const usuario = await db.query(`
        SELECT u.*, r.nombre_rol
        FROM ${TABLA} u
        INNER JOIN rol r ON u.rol = r.idrol
        WHERE u.correo = ?
    `, [correo]);

    if (!usuario || usuario.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    // Se define el usuario
    const usuarios = usuario[0];

    const validPassword = await bcrypt.compare(password, usuario[0].password);

    if (!validPassword) {
        throw new Error('Contraseña incorrecta');
    }

    const rolNombre = usuarios.nombre_rol;

    // Generar token
    const token = jwt.sign(
        {
            id: usuarios.idusuario,
            nombres: usuarios.nombres,
            apellidos: usuarios.apellidos,
            rol: rolNombre, 
            sedeU: usuarios.sedeU
        },
        'secreto',
        { expiresIn: '16h' }
    );

    return {
        usuario: {
            id: usuarios.idusuario,
            correo: usuarios.correo,
            nombre: usuarios.nombres,
            apellido: usuarios.apellidos,
            telefono: usuarios.telefono,
            sede: usuarios.sedeU,
            rol: rolNombre
        },
        token,
        rol: rolNombre
    };

    console.log(token);
}

module.exports = { login };
