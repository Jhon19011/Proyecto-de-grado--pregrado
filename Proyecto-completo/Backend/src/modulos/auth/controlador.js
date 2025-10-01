const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../DB/mysql');

const TABLA = 'usuario';

const rolesMap = {
    1: 'Administrador',
    4: 'Auxiliar'
};

async function login(data) {
    const { correo, password } = data;

    if (!correo || !password) {
        throw new Error('Correo y contraseña son requeridos');
    }

    // Buscar usuario por correo
    console.log('Buscando usuario con correo:', correo);
    const usuario = await db.query(`SELECT * FROM ${TABLA} WHERE correo = ?`, [correo]);

    if (!usuario || usuario.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    // Se define el usuario
    const usuarios = usuario[0];

    const validPassword = await bcrypt.compare(password, usuario[0].password);

    if (!validPassword) {
        throw new Error('Contraseña incorrecta');
    }

    // Mapear rol de usuario
    const rolNombre = rolesMap[Number(usuarios.rol)];

    // Generar token
    const token = jwt.sign(
        {
            id: usuarios.idusuario,
            correo: usuarios.correo,
            nombre: usuarios.nombres,
            apellidos: usuarios.apellidos,
            rol: rolNombre
        },
        'secreto',
        { expiresIn: '1h' }
    );

    return {
        usuario: {
            id: usuarios.idusuario,
            correo: usuarios.correo,
            nombre: usuarios.nombres,
            apellido: usuarios.apellidos,
            rol: rolNombre
        },
        token,
        rol: rolNombre
    };
}

module.exports = { login };
