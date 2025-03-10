const congeModel = require('../models/congeModel');

const congeController = {
    // Obtenir tous les congés
    getAllConges: async (req, res) => {
        try {
            const conges = await congeModel.getAllConges();
            res.json({
                success: true,
                data: conges
            });
        } catch (error) {
            console.error('Erreur getAllConges:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des congés",
                error: error.message
            });
        }
    },

    // Obtenir un congé spécifique
    getCongeById: async (req, res) => {
        try {
            const id = req.params.id;
            const conge = await congeModel.getCongeById(id);
            
            if (!conge) {
                return res.status(404).json({
                    success: false,
                    message: "Congé non trouvé"
                });
            }

            res.json({
                success: true,
                data: conge
            });
        } catch (error) {
            console.error('Erreur getCongeById:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du congé",
                error: error.message
            });
        }
    },

    // Créer un nouveau congé
    createConge: async (req, res) => {
        try {
            const newCongeId = await congeModel.createConge(req.body);
            const newConge = await congeModel.getCongeById(newCongeId);
            
            res.status(201).json({
                success: true,
                message: "Congé créé avec succès",
                data: newConge
            });
        } catch (error) {
            console.error('Erreur createConge:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du congé",
                error: error.message
            });
        }
    },

    // Mettre à jour un congé
    updateConge: async (req, res) => {
        try {
            const id = req.params.id;
            const success = await congeModel.updateConge(id, req.body);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Congé non trouvé"
                });
            }

            const updatedConge = await congeModel.getCongeById(id);
            res.json({
                success: true,
                message: "Congé mis à jour avec succès",
                data: updatedConge
            });
        } catch (error) {
            console.error('Erreur updateConge:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour du congé",
                error: error.message
            });
        }
    },

    // Supprimer un congé
    deleteConge: async (req, res) => {
        try {
            const id = req.params.id;
            const success = await congeModel.deleteConge(id);
            
            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Congé non trouvé"
                });
            }

            res.json({
                success: true,
                message: "Congé supprimé avec succès"
            });
        } catch (error) {
            console.error('Erreur deleteConge:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du congé",
                error: error.message
            });
        }
    },

    // Obtenir les congés d'un employé
    getCongesByEmploye: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const conges = await congeModel.getCongesByEmploye(employeId);
            
            res.json({
                success: true,
                data: conges
            });
        } catch (error) {
            console.error('Erreur getCongesByEmploye:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des congés de l'employé",
                error: error.message
            });
        }
    }
};

module.exports = congeController; 