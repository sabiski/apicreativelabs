const Candidature = require('../models/candidatureModel');
const multer = require('multer');
const path = require('path');
const emailService = require('../utils/emailService');
const Entretien = require('../models/entretienModel');
const Evaluation = require('../models/evaluationModel');

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
    getAllCandidatures: (req, res) => {
        Candidature.getAllCandidatures((err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération des candidatures",
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                data: results
            });
        });
    },

    getCandidatureById: (req, res) => {
        const id = req.params.id;
        Candidature.getCandidatureById(id, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération de la candidature",
                    error: err
                });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Candidature non trouvée"
                });
            }
            res.status(200).json({
                success: true,
                data: results[0]
            });
        });
    },

    getCandidaturesByOffre: (req, res) => {
        const offreId = req.params.offreId;
        Candidature.getCandidaturesByOffre(offreId, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération des candidatures",
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                data: results
            });
        });
    },

    createCandidature: (req, res) => {
        const candidatureData = {
            offre_id: req.body.offre_id,
            nom: req.body.nom,
            email: req.body.email,
            experience: req.body.experience,
            cv_path: req.files?.cv ? req.files.cv[0].path : null,
            lettre_motivation_path: req.files?.lettre_motivation ? req.files.lettre_motivation[0].path : null,
            statut: 'pending'
        };

        Candidature.createCandidature(candidatureData, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la création de la candidature",
                    error: err
                });
            }
            res.status(201).json({
                success: true,
                message: "Candidature créée avec succès",
                data: { id: result.insertId, ...candidatureData }
            });
        });
    },

    updateCandidature: (req, res) => {
        const id = req.params.id;
        const candidatureData = req.body;

        Candidature.updateCandidature(id, candidatureData, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la mise à jour de la candidature",
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                message: "Candidature mise à jour avec succès"
            });
        });
    },

    deleteCandidature: (req, res) => {
        const id = req.params.id;

        Candidature.deleteCandidature(id, (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la suppression de la candidature",
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                message: "Candidature supprimée avec succès"
            });
        });
    }
};

module.exports = candidatureController; 