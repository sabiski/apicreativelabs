const EvaluationCandidat = require('../models/evaluationCandidatModel');

const evaluationCandidatController = {
    getAllEvaluations: async (req, res) => {
        try {
            const evaluations = await EvaluationCandidat.getAll();
            res.json({
                success: true,
                data: evaluations
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des évaluations'
            });
        }
    },

    createEvaluation: async (req, res) => {
        try {
            const result = await EvaluationCandidat.create(req.body);
            res.json({
                success: true,
                message: 'Évaluation créée avec succès',
                data: { id: result.insertId }
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la création de l\'évaluation'
            });
        }
    },

    getEvaluationById: async (req, res) => {
        try {
            const evaluation = await EvaluationCandidat.getById(req.params.id);
            if (evaluation) {
                res.json({
                    success: true,
                    data: evaluation
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Évaluation non trouvée'
                });
            }
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération de l\'évaluation'
            });
        }
    },

    updateEvaluation: async (req, res) => {
        try {
            await EvaluationCandidat.update(req.params.id, req.body);
            res.json({
                success: true,
                message: 'Évaluation mise à jour avec succès'
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la mise à jour de l\'évaluation'
            });
        }
    },

    deleteEvaluation: async (req, res) => {
        try {
            await EvaluationCandidat.delete(req.params.id);
            res.json({
                success: true,
                message: 'Évaluation supprimée avec succès'
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression de l\'évaluation'
            });
        }
    }
};

module.exports = evaluationCandidatController; 