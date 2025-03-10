const Candidature = require('../models/candidatureModel');
const multer = require('multer');
const path = require('path');
const emailService = require('../utils/emailService');
const Entretien = require('../models/entretienModel');
const Evaluation = require('../models/evaluationModel');
const db = require('../config/database');

// Configuration de multer pour l'upload des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/candidatures')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

const candidatureController = {
    getAllCandidatures: async (req, res) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    c.*,
                    o.titre as offre_titre
                FROM candidature c 
                LEFT JOIN offre_emploi o ON c.offre_id = o.id 
                ORDER BY c.date_candidature DESC
            `);

            // Nettoyer et formater les chemins de fichiers
            const formattedRows = rows.map(row => {
                // Fonction pour extraire le nom du fichier
                const getFilename = (path) => {
                    if (!path) return null;
                    // Gérer les différents formats de chemins
                    return path.split(/[\/\\]/).pop();
                };

                return {
                    ...row,
                    cv_path: getFilename(row.cv_path),
                    lettre_motivation_path: getFilename(row.lettre_motivation_path)
                };
            });

            console.log('Données formatées:', formattedRows); // Debug

            return res.status(200).json({
                success: true,
                data: formattedRows
            });

        } catch (error) {
            console.error('Erreur getAllCandidatures:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des candidatures",
                error: error.message
            });
        }
    },

    getCandidatureById: async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM candidature WHERE id = ?',
                [req.params.id]
            );

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Candidature non trouvée"
                });
            }

            return res.status(200).json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Erreur getCandidatureById:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de la candidature",
                error: error.message
            });
        }
    },

    getCandidaturesByOffre: async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM candidature WHERE offre_id = ?',
                [req.params.offreId]
            );

            return res.status(200).json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Erreur getCandidaturesByOffre:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des candidatures",
                error: error.message
            });
        }
    },

    createCandidature: async (req, res) => {
        try {
            const candidatureData = {
                offre_id: req.body.offre_id,
                nom: req.body.nom,
                email: req.body.email,
                experience: req.body.experience,
                statut: 'pending',
                date_candidature: new Date()
            };

            if (req.files) {
                if (req.files.cv) {
                    candidatureData.cv_path = req.files.cv[0].path;
                }
                if (req.files.lettre_motivation) {
                    candidatureData.lettre_motivation_path = req.files.lettre_motivation[0].path;
                }
            }

            const [result] = await db.query(
                'INSERT INTO candidature SET ?',
                [candidatureData]
            );

            return res.status(201).json({
                success: true,
                message: "Candidature créée avec succès",
                data: { id: result.insertId }
            });

        } catch (error) {
            console.error('Erreur createCandidature:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la création de la candidature",
                error: error.message
            });
        }
    },

    updateCandidature: async (req, res) => {
        try {
            const [result] = await db.query(
                'UPDATE candidature SET ? WHERE id = ?',
                [req.body, req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Candidature non trouvée"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Candidature mise à jour avec succès"
            });
        } catch (error) {
            console.error('Erreur updateCandidature:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de la candidature",
                error: error.message
            });
        }
    },

    deleteCandidature: async (req, res) => {
        try {
            const [result] = await db.query(
                'DELETE FROM candidature WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Candidature non trouvée"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Candidature supprimée avec succès"
            });
        } catch (error) {
            console.error('Erreur deleteCandidature:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de la candidature",
                error: error.message
            });
        }
    }
};

module.exports = candidatureController; 