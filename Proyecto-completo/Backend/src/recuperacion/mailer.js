const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pruebasproyectos29@gmail.com',  // Correo laboratorios
        pass: process.env.EMAIL_PASS
    }
});

async function enviarCorreo(destinatario, asunto, html) {
    await transporter.sendMail({
        from: '"Soporte Inventarios" <pruebasproyectos29@gmail.com>',
        to: destinatario,
        subject: asunto,
        html
    });
}

module.exports = enviarCorreo;
