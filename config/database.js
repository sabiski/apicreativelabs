const mysql = require('mysql2');

// Configuration avec le nouvel utilisateur et SSL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'nodeuser',
    password: 'node123',
    database: 'erp_database',
    ssl: {
        rejectUnauthorized: false
    }
});

// Test de connexion
connection.connect((err) => {
    if (err) {
        console.error('Erreur de connexion:', {
            code: err.code,
            message: err.message,
            state: err.sqlState
        });
        process.exit(1);
    }
    console.log('MySQL connecté!');
});

// Export avec promesses
module.exports = connection.promise();
