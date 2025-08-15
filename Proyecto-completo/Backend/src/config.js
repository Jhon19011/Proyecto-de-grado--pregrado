require('dotenv').config();

// Variables globales del sistema

module.exports = {
    app:{
        port: process.env.PORT || 4000,
    },
    mysql:{
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '2516262',
        database: process.env.MYSQL_DATABASE || 'proyectosustancias',
    }
}