const entrepriseConfigService = require('../services/entrepriseConfigService');

const entrepriseConfigController = {
    async getConfig(req, res) {
        try {
            const { entrepriseId } = req.params;
            const { type } = req.query;
            
            const config = await entrepriseConfigService.getConfig(entrepriseId, type);
            
            res.json({
                success: true,
                data: config
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la configuration",
                error: error.message
            });
        }
    },

    async updateConfig(req, res) {
        try {
            const { entrepriseId } = req.params;
            const { type, configs } = req.body;
            
            await entrepriseConfigService.updateConfig(entrepriseId, type, configs);
            
            res.json({
                success: true,
                message: "Configuration mise à jour avec succès"
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de la configuration",
                error: error.message
            });
        }
    }
};

module.exports = entrepriseConfigController; 