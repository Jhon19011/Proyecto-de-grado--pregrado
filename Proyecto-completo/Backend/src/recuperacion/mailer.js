const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.office365.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'TLSv1.2'
    }
});

async function enviarCorreo(destinatario, asunto, html) {
    await transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'Soporte Inventarios'}" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: asunto,
        html
    });
}

module.exports = enviarCorreo;
