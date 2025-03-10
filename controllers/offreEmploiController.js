const OffreEmploi = require('../models/offreEmploiModel');
const emailService = require('../utils/emailService');
const db = require('../config/database');

const offreEmploiController = {
    getAllOffres: async (req, res) => {
        try {
            const [rows] = await db.query('SELECT * FROM offre_emploi ORDER BY date_creation DESC');
            return res.status(200).json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Erreur getAllOffres:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des offres",
                error: error.message
            });
        }
    },

    createOffre: async (req, res) => {
        try {
            const offreData = {
                titre: req.body.titre,
                description: req.body.description,
                competences_requises: req.body.competences_requises,
                lieu_travail: req.body.lieu_travail,
                conditions: req.body.conditions,
                date_limite: req.body.date_limite,
                statut: 'draft',
                date_creation: new Date()
            };

            const [result] = await db.query(
                'INSERT INTO offre_emploi SET ?',
                [offreData]
            );

            return res.status(201).json({
                success: true,
                message: "Offre créée avec succès",
                data: { id: result.insertId }
            });

        } catch (error) {
            console.error('Erreur createOffre:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la création de l'offre",
                error: error.message
            });
        }
    },

    getOffreById: async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM offre_emploi WHERE id = ?',
                [req.params.id]
            );

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Offre non trouvée"
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Erreur getOffreById:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'offre",
                error: error.message
            });
        }
    },

    updateOffre: async (req, res) => {
        try {
            const id = req.params.id;
            const offreData = {
                titre: req.body.titre,
                description: req.body.description,
                competences_requises: req.body.competences_requises,
                lieu_travail: req.body.lieu_travail,
                conditions: req.body.conditions,
                date_limite: req.body.date_limite,
                statut: req.body.statut,
                date_modification: new Date()
            };

            console.log('Mise à jour offre ID:', id, 'avec données:', offreData);

            const [result] = await db.query(
                'UPDATE offre_emploi SET ? WHERE id = ?',
                [offreData, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Offre non trouvée"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Offre mise à jour avec succès"
            });

        } catch (error) {
            console.error('Erreur updateOffre:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de l'offre",
                error: error.message
            });
        }
    },

    deleteOffre: (req, res) => {
        const id = req.params.id;

        OffreEmploi.deleteOffre(id, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la suppression de l'offre",
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                message: "Offre supprimée avec succès"
            });
        });
    }
};

module.exports = offreEmploiController; 