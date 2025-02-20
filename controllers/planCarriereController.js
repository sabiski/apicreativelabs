const planCarriereModel = require('../models/planCarriereModel');

const planCarriereController = {
    // Obtenir tous les plans de carrière
    getAllPlanCarriere: async (req, res) => {
        try {
            const plans = await planCarriereModel.getAllPlanCarriere();
            res.json({
                success: true,
                data: plans
            });
        } catch (error) {
            console.error('Erreur getAllPlanCarriere:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des plans de carrière",
                error: error.message
            });
        }
    },

    // Obtenir le plan de carrière complet d'un employé
    getPlanCarriere: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const plan = await planCarriereModel.getPlanCarriere(employeId);

            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: "Plan de carrière non trouvé"
                });
            }

            res.json({
                success: true,
                data: plan
            });
        } catch (error) {
            console.error('Erreur getPlanCarriere:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du plan de carrière",
                error: error.message
            });
        }
    },

    // Créer un nouveau plan de carrière
    createPlanCarriere: async (req, res) => {
        try {
            const newPlan = await planCarriereModel.createPlanCarriere(req.body);
            res.status(201).json({
                success: true,
                message: "Plan de carrière créé avec succès",
                data: newPlan
            });
        } catch (error) {
            console.error('Erreur createPlanCarriere:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du plan de carrière",
                error: error.message
            });
        }
    },

    // Mettre à jour un plan de carrière
    updatePlanCarriere: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const updatedPlan = await planCarriereModel.updatePlanCarriere(employeId, req.body);

            if (!updatedPlan) {
                return res.status(404).json({
                    success: false,
                    message: "Plan de carrière non trouvé"
                });
            }

            res.json({
                success: true,
                message: "Plan de carrière mis à jour avec succès",
                data: updatedPlan
            });
        } catch (error) {
            console.error('Erreur updatePlanCarriere:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour du plan de carrière",
                error: error.message
            });
        }
    },

    // Supprimer un plan de carrière
    deletePlanCarriere: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const result = await planCarriereModel.deletePlanCarriere(employeId);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Plan de carrière non trouvé"
                });
            }

            res.json({
                success: true,
                message: "Plan de carrière supprimé avec succès"
            });
        } catch (error) {
            console.error('Erreur deletePlanCarriere:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du plan de carrière",
                error: error.message
            });
        }
    },

    // Obtenir l'historique des évaluations
    getHistoriqueEvaluations: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const evaluations = await planCarriereModel.getHistoriqueEvaluations(employeId);

            res.json({
                success: true,
                data: evaluations
            });
        } catch (error) {
            console.error('Erreur getHistoriqueEvaluations:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'historique des évaluations",
                error: error.message
            });
        }
    },

    // Obtenir l'historique des formations
    getHistoriqueFormations: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const formations = await planCarriereModel.getHistoriqueFormations(employeId);

            res.json({
                success: true,
                data: formations
            });
        } catch (error) {
            console.error('Erreur getHistoriqueFormations:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'historique des formations",
                error: error.message
            });
        }
    },

    // Obtenir l'historique des postes
    getHistoriquePostes: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const postes = await planCarriereModel.getHistoriquePostes(employeId);

            res.json({
                success: true,
                data: postes
            });
        } catch (error) {
            console.error('Erreur getHistoriquePostes:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'historique des postes",
                error: error.message
            });
        }
    }
};

module.exports = planCarriereController; 