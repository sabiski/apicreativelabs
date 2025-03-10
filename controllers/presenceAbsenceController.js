const PresenceAbsence = require('../models/presenceAbsence');

const presenceAbsenceController = {
    getAllPresenceAbsences: async (req, res) => {
        try {
            const presences = await PresenceAbsence.getAllPresenceAbsences();
            res.json({
                success: true,
                data: presences
            });
        } catch (error) {
            console.error('Erreur getAllPresenceAbsences:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des présences/absences",
                error: error.message
            });
        }
    },

    getPresenceAbsenceById: async (req, res) => {
        try {
            const id = req.params.id;
            const presence = await PresenceAbsence.getPresenceAbsenceById(id);
            
            if (!presence) {
                return res.status(404).json({
                    success: false,
                    message: "Présence/Absence non trouvée"
                });
            }

            res.json({
                success: true,
                data: presence
            });
        } catch (error) {
            console.error('Erreur getPresenceAbsenceById:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la présence/absence",
                error: error.message
            });
        }
    },

    createPresenceAbsence: async (req, res) => {
        try {
            const { date, type, justification, employeid } = req.body;

            // Validation des données requises
            if (!date || !type || !employeid) {
                return res.status(400).json({
                    success: false,
                    message: "La date, le type et l'ID de l'employé sont requis"
                });
            }

            const newPresence = await PresenceAbsence.createPresenceAbsence({
                date,
                type,
                justification,
                employeid
            });

            res.status(201).json({
                success: true,
                message: "Présence/Absence créée avec succès",
                data: newPresence
            });
        } catch (error) {
            console.error('Erreur createPresenceAbsence:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de la présence/absence",
                error: error.message
            });
        }
    },

    updatedPresenceAbsence: async (req, res) => {
        try {
            const id = req.params.id;
            const { date, type, justification, employeid } = req.body;

            // Validation des données requises
            if (!date || !type || !employeid) {
                return res.status(400).json({
                    success: false,
                    message: "La date, le type et l'ID de l'employé sont requis"
                });
            }

            const success = await PresenceAbsence.updatePresenceAbsence(id, {
                date,
                type,
                justification,
                employeid
            });

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Présence/Absence non trouvée"
                });
            }

            res.json({
                success: true,
                message: "Présence/Absence mise à jour avec succès"
            });
        } catch (error) {
            console.error('Erreur updatedPresenceAbsence:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de la présence/absence",
                error: error.message
            });
        }
    },

    deletePresenceAbsence: async (req, res) => {
        try {
            const id = req.params.id;
            const success = await PresenceAbsence.deletePresenceAbsence(id);

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Présence/Absence non trouvée"
                });
            }

            res.json({
                success: true,
                message: "Présence/Absence supprimée avec succès"
            });
        } catch (error) {
            console.error('Erreur deletePresenceAbsence:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de la présence/absence",
                error: error.message
            });
        }
    }
};

module.exports = presenceAbsenceController; 