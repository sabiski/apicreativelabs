const db = require('../config/database');

class EntrepriseConfigService {
    async getConfig(entrepriseId, type) {
        try {
            const [rows] = await db.query(
                'SELECT config_key, config_value FROM entreprise_config WHERE entreprise_id = ? AND type = ?',
                [entrepriseId, type]
            );
            
            return rows.reduce((config, row) => {
                config[row.config_key] = row.config_value;
                return config;
            }, {});
        } catch (error) {
            console.error('Erreur lors de la récupération de la configuration:', error);
            throw error;
        }
    }

    async updateConfig(entrepriseId, type, configs) {
        try {
            for (const [key, value] of Object.entries(configs)) {
                await db.query(
                    `INSERT INTO entreprise_config (entreprise_id, type, config_key, config_value) 
                     VALUES (?, ?, ?, ?) 
                     ON DUPLICATE KEY UPDATE config_value = ?`,
                    [entrepriseId, type, key, value, value]
                );
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la configuration:', error);
            throw error;
        }
    }
}

module.exports = new EntrepriseConfigService(); 