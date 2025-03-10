const db = require('../config/database');

const formationParticipationController = {
    getAllParticipations: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM formation_participation');
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Erreur getAllParticipations:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des participations",
                error: error.message
            });
        }
    },

    getParticipationById: async (req, res) => {
        try {
            const id = req.params.id;
            const [rows] = await db.query('SELECT * FROM formation_participation WHERE id = ?', [id]);
            
            if (!rows[0]) {
                return res.status(404).json({
                    success: false,
                    message: "Participation non trouvée"
                });
            }

            res.json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Erreur getParticipationById:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la participation",
                error: error.message
            });
        }
    },

    getParticipationsByFormation: async (req, res) => {
        try {
            const formationId = req.params.formationId;
            
            const [participants] = await db.query(`
                SELECT 
                    fp.id,
                    fp.formation_id,
                    fp.employe_id,
                    fp.date_participation,
                    fp.status,
                    fp.evaluation,
                    e.nom,
                    e.prenom
                FROM formation_participation fp
                JOIN employe e ON fp.employe_id = e.id
                WHERE fp.formation_id = ?`,
                [formationId]
            );

            // Restructurer les données pour correspondre au format attendu par le frontend
            const formattedParticipants = participants.map(p => ({
                id: p.id,
                formation_id: p.formation_id,
                date_participation: p.date_participation,
                status: p.status,
                evaluation: p.evaluation,
                nom: p.nom,        // Ajout direct du nom
                prenom: p.prenom   // Ajout direct du prénom
            }));

            res.json({
                success: true,
                data: formattedParticipants
            });
        } catch (error) {
            console.error('Erreur getParticipationsByFormation:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des participants",
                error: error.message
            });
        }
    },

    getParticipationsByEmployee: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const [rows] = await db.query('SELECT * FROM formation_participation WHERE employe_id = ?', [employeId]);
            
            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Erreur getParticipationsByEmployee:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des participations",
                error: error.message
            });
        }
    },

    createParticipation: async (req, res) => {
        try {
            const { formation_id, employe_id, date_participation, status = 'inscrit' } = req.body;

            // Validation des données
            if (!formation_id || !employe_id) {
                return res.status(400).json({
                    success: false,
                    message: "L'ID de la formation et l'ID de l'employé sont requis"
                });
            }

            // Vérifier si la participation existe déjà
            const [existing] = await db.query(
                'SELECT id FROM formation_participation WHERE formation_id = ? AND employe_id = ?',
                [formation_id, employe_id]
            );

            if (existing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Cet employé est déjà inscrit à cette formation"
                });
            }

            // Insérer la nouvelle participation
            const [result] = await db.query(
                'INSERT INTO formation_participation (formation_id, employe_id, date_participation, status) VALUES (?, ?, ?, ?)',
                [formation_id, employe_id, date_participation || new Date(), status]
            );

            res.status(201).json({
                success: true,
                message: "Participation créée avec succès",
                data: {
                    id: result.insertId,
                    formation_id,
                    employe_id,
                    date_participation,
                    status
                }
            });
        } catch (error) {
            console.error('Erreur createParticipation:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de la participation",
                error: error.message
            });
        }
    },

    updateParticipation: async (req, res) => {
        try {
            const id = req.params.id;
            const { status } = req.body;  // Récupérer le status du body

            // Vérifier que status est bien présent
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Le status est requis"
                });
            }

            const [result] = await db.query(
                'UPDATE formation_participation SET status = ? WHERE id = ?',
                [status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Participation non trouvée"
                });
            }

            res.json({
                success: true,
                message: "Statut mis à jour avec succès"
            });
        } catch (error) {
            console.error('Erreur updateParticipation:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour du statut",
                error: error.message
            });
        }
    },

    deleteParticipation: async (req, res) => {
        try {
            const id = req.params.id;
            const [result] = await db.query('DELETE FROM formation_participation WHERE id = ?', [id]);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Participation non trouvée"
                });
            }

            res.json({
                success: true,
                message: "Participation supprimée avec succès"
            });
        } catch (error) {
            console.error('Erreur deleteParticipation:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de la participation",
                error: error.message
            });
        }
    }
};

module.exports = formationParticipationController; 