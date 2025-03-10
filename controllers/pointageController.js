const Pointage = require('../models/pointage');

const pointageController = {
    getAllPointages: async (req, res) => {
        try {
            const pointages = await Pointage.getAllPointages();
            res.json({
                success: true,
                data: pointages
            });
        } catch (error) {
            console.error('Erreur getAllPointages:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des pointages",
                error: error.message
            });
        }
    },

    getPointageById: async (req, res) => {
        try {
            const id = req.params.id;
            const pointage = await Pointage.getPointageById(id);
            
            if (!pointage) {
                return res.status(404).json({
                    success: false,
                    message: "Pointage non trouvé"
                });
            }

            res.json({
                success: true,
                data: pointage
            });
        } catch (error) {
            console.error('Erreur getPointageById:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération du pointage",
                error: error.message
            });
        }
    },

    createPointage: async (req, res) => {
        try {
            const { heure_arrive, heure_depart, date, employeid, managerid } = req.body;

            // Validation des données requises
            if (!heure_arrive || !heure_depart || !employeid) {
                return res.status(400).json({
                    success: false,
                    message: "L'heure d'arrivée, l'heure de départ et l'ID de l'employé sont requis"
                });
            }

            const newPointage = await Pointage.createPointage({
                heure_arrive,
                heure_depart,
                date: date || new Date(),
                employeid,
                managerid
            });

            res.status(201).json({
                success: true,
                message: "Pointage créé avec succès",
                data: newPointage
            });
        } catch (error) {
            console.error('Erreur createPointage:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création du pointage",
                error: error.message
            });
        }
    },

    updatedPointage: async (req, res) => {
        try {
            const id = req.params.id;
            const { heure_arrive, heure_depart, date, employeid, managerid } = req.body;

            // Validation des données requises
            if (!heure_arrive || !heure_depart || !employeid) {
                return res.status(400).json({
                    success: false,
                    message: "L'heure d'arrivée, l'heure de départ et l'ID de l'employé sont requis"
                });
            }

            const success = await Pointage.updatePointage(id, {
                heure_arrive,
                heure_depart,
                date,
                employeid,
                managerid
            });

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Pointage non trouvé"
                });
            }

            res.json({
                success: true,
                message: "Pointage mis à jour avec succès"
            });
        } catch (error) {
            console.error('Erreur updatedPointage:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour du pointage",
                error: error.message
            });
        }
    },

    deletePointage: async (req, res) => {
        try {
            const id = req.params.id;
            const success = await Pointage.deletePointage(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Pointage non trouvé"
                });
            }

            res.json({
                success: true,
                message: "Pointage supprimé avec succès"
            });
        } catch (error) {
            console.error('Erreur deletePointage:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression du pointage",
                error: error.message
            });
        }
    }
};

module.exports = pointageController; 