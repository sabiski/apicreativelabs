const path = require('path');
const dotenv = require('dotenv');

// Charger l'environnement approprié
const loadEnv = () => {
    const env = process.env.NODE_ENV || 'development';
    const envPath = path.resolve(process.cwd(), `.env.${env}`);
    
    // Charger d'abord le fichier .env par défaut
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    
    // Puis charger les configurations spécifiques à l'environnement
    try {
        const envConfig = dotenv.config({ path: envPath });
        if (envConfig.error) {
            console.warn(`Attention: Fichier .env.${env} non trouvé`);
        }
    } catch (error) {
        console.warn(`Erreur lors du chargement de .env.${env}:`, error);
    }

    // Vérifier les variables requises
    const requiredVars = [
        'DB_HOST',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME',
        'JWT_SECRET'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        throw new Error(`Variables d'environnement manquantes: ${missingVars.join(', ')}`);
    }

    console.log(`Environnement chargé: ${env}`);
};

module.exports = { loadEnv }; 