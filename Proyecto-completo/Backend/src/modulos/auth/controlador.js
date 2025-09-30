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
    const usuario = await db.query(`SELECT * FROM ${TABLA} WHERE correo = ?`, [correo]);

    if (!usuario || usuario.length === 0) {
        throw new Error('Usuario no encontrado');
    }

    console.log('Usuario encontrado:', {
        id: usuario[0].idusuario,
        correo: usuario[0].correo,
        passwordLength: usuario[0].password ? usuario[0].password.length : 0
    });
    console.log('Password recibido:', password);

    const validPassword = await bcrypt.compare(password, usuario[0].password);

    console.log('Resultado de la comparación:', validPassword);

    if (!validPassword) {
        throw new Error('Contraseña incorrecta');
    }

    // Generar token
    const token = jwt.sign(
        {
            id: usuario[0].idusuario,
            correo: usuario[0].correo
        },
        'secreto',
        { expiresIn: '1h' }
    );

    return {
        usuario: {
            id: usuario[0].idusuario,
            correo: usuario[0].correo
        },
        token
    };
}

module.exports = { login };
