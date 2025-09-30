const bcrypt = require('bcryptjs');
const db = require('../../DB/mysql');
const jwt = require('jsonwebtoken');
const error = require('../../middleware/errors');
const enviarCorreo = require('../../recuperacion/mailer');
const FRONT_URL = 'http://localhost:4200';

const TABLA = 'usuario';

async function solicitarRecuperacion(correo) {
    const usuario = await db.query(`SELECT * FROM ${TABLA} WHERE correo = ?`, [correo]);
    if (!usuario.length) {
        throw error('Correo no registrado', 404);
    }

    const token = jwt.sign(
        { id: usuario[0].idusuario, correo },
        'secreto_reset',
        { expiresIn: '15m' }
    );

    // Enviar correo
    const enlace = `${FRONT_URL}/restablecer?token=${token}`;
    await enviarCorreo(
        correo,
        'Recuperación de contraseña',
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #2f2c79;">Recuperación de Contraseña</h2>
      <p>Hola <b>${usuario[0].nombres}</b>, hemos recibido una solicitud para restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente botón (válido 15 minutos):</p>
      <a href="${enlace}" style="background: #2f2c79; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display:inline-block;">
        Restablecer contraseña
      </a>
      <p style="font-size: 12px; color: #888;">Si no solicitaste esto, ignora este correo.</p>
    </div>
    `
    );

    return { mensaje: 'Se envió un correo de recuperación'};
}

// Restablecer contraseña
async function restablecerContrasena(token, nuevaContrasena){
    try {
        const decoded = jwt.verify(token, 'secreto_reset');
        const salt = await bcrypt.genSalt(10);
        const conhasheada = await bcrypt.hash(nuevaContrasena, salt);

        await db.query(`UPDATE ${TABLA} SET password = ? WHERE idusuario = ?`, [conhasheada, decoded.id]);

        return {mensaje: 'Contraseña actualizada con éxito'};
    } catch (err) {
        throw error('Token invalido o expirado')
    }
}

module.exports = {
    solicitarRecuperacion,
    restablecerContrasena
}