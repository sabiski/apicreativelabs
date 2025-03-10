const paieModel = require('../models/paieModel');

const paieController = {
    // Obtenir toutes les paies
    getAllPaie: async (req, res) => {
        try {
            const paies = await paieModel.getAllPaie();
            res.json({
                success: true,
                data: paies
            });
        } catch (error) {
            console.error('Erreur getAllPaie:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des paies",
                error: error.message
            });
        }
    },

    // Obtenir une paie spécifique
    getPaieById: async (req, res) => {
        try {
            const id = req.params.id;
            const paie = await paieModel.getPaieById(id);
            
            if (!paie) {
                return res.status(404).json({
                    success: false,
                    message: "Paie non trouvée"
                });
            }

            res.json({
                success: true,
                data: paie
            });
        } catch (error) {
            console.error('Erreur getPaieById:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la paie",
                error: error.message
            });
        }
    },

    // Créer une nouvelle paie
    createPaie: async (req, res) => {
        try {
            const newPaieId = await paieModel.createPaie(req.body);
            const newPaie = await paieModel.getPaieById(newPaieId);
            
            res.status(201).json({
                success: true,
                message: "Paie créée avec succès",
                data: newPaie
            });
        } catch (error) {
            console.error('Erreur createPaie:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de la paie",
                error: error.message
            });
        }
    },

    // Mettre à jour une paie
    updatePaie: async (req, res) => {
        try {
            const id = req.params.id;
            const success = await paieModel.updatePaie(id, req.body);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Paie non trouvée"
                });
            }

            const updatedPaie = await paieModel.getPaieById(id);
            res.json({
                success: true,
                message: "Paie mise à jour avec succès",
                data: updatedPaie
            });
        } catch (error) {
            console.error('Erreur updatePaie:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de la paie",
                error: error.message
            });
        }
    },

    // Supprimer une paie
    deletePaie: async (req, res) => {
        try {
            const id = req.params.id;
            const success = await paieModel.deletePaie(id);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Paie non trouvée"
                });
            }

            res.json({
                success: true,
                message: "Paie supprimée avec succès"
            });
        } catch (error) {
            console.error('Erreur deletePaie:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de la paie",
                error: error.message
            });
        }
    }
};

module.exports = paieController; 