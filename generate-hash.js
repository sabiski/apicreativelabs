const bcrypt = require('bcrypt');

async function generateHash() {
    try {
        const password = 'Admin123!';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('Mot de passe:', password);
        console.log('Hash:', hash);
        console.log('\nRequête SQL à exécuter:');
        console.log(`UPDATE employe SET password = '${hash}' WHERE email = 'admin@gmail.com';`);
    } catch (error) {
        console.error('Erreur:', error);
    }
}

generateHash(); 