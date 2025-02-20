const competenceModel = require('../models/competenceModel');

const competenceController = {
    getAllCompetences: async (req, res) => {
        try {
            const competences = await competenceModel.getAllCompetences();
            res.json({
                success: true,
                data: competences
            });
        } catch (error) {
            console.error('Erreur getAllCompetences:', error);
            res.status(500).json({ 
                success: false,
                message: "Erreur lors de la récupération des compétences",
                error: error.message 
            });
        }
    },

    getCompetenceById: async (req, res) => {
        try {
            const competence = await competenceModel.getCompetenceById(req.params.id);
            if (!competence) {
                return res.status(404).json({
                    success: false,
                    message: "Compétence non trouvée"
                });
            }
            res.json({
                success: true,
                data: competence
            });
        } catch (error) {
            console.error('Erreur getCompetenceById:', error);
            res.status(500).json({ 
                success: false,
                message: "Erreur lors de la récupération de la compétence",
                error: error.message 
            });
        }
    },

    createCompetence: async (req, res) => {
        try {
            const result = await competenceModel.createCompetence(req.body);
            res.status(201).json({
                success: true,
                message: "Compétence créée avec succès",
                data: {
                    id: result.insertId,
                    ...req.body
                }
            });
        } catch (error) {
            console.error('Erreur createCompetence:', error);
            res.status(500).json({ 
                success: false,
                message: "Erreur lors de la création de la compétence",
                error: error.message 
            });
        }
    },

    evaluerCompetence: async (req, res) => {
        try {
            const { employeId, competenceId, niveau } = req.body;
            
            if (!employeId || !competenceId || niveau === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Données manquantes pour l'évaluation"
                });
            }

            await competenceModel.evaluerCompetence(employeId, competenceId, niveau);
            res.json({
                success: true,
                message: "Évaluation enregistrée avec succès",
                data: { employeId, competenceId, niveau }
            });
        } catch (error) {
            console.error('Erreur evaluerCompetence:', error);
            res.status(500).json({ 
                success: false,
                message: "Erreur lors de l'évaluation de la compétence",
                error: error.message 
            });
        }
    }
};

module.exports = competenceController;