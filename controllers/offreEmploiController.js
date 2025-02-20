const OffreEmploi = require('../models/offreEmploiModel');
const emailService = require('../utils/emailService');

const offreEmploiController = {
    getAllOffres: (req, res) => {
        OffreEmploi.getAllOffres((err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération des offres",
                    error: err
                });
            }
            res.status(200).json({
                success: true,
                data: results
            });
        });
    },

    createOffre: async (req, res) => {
        const offreData = {
            titre: req.body.titre,
            description: req.body.description,
            competences_requises: req.body.competences_requises,
            lieu_travail: req.body.lieu_travail,
            conditions: req.body.conditions,
            date_limite: req.body.date_limite,
            statut: req.body.statut || 'draft'
        };

        try {
            OffreEmploi.createOffre(offreData, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la création de l'offre",
                        error: err
                    });
                }

                // Si l'offre est publiée, envoyer des notifications
                if (offreData.statut === 'published') {
                    try {
                        // Récupérer la liste des abonnés aux offres d'emploi
                        const subscribers = await getSubscribers(); // À implémenter selon votre logique
                        
                        await emailService.sendNewOffreEmail(subscribers, {
                            ...offreData,
                            lien_candidature: `${process.env.FRONTEND_URL}/offres/${result.insertId}`
                        });
                    } catch (emailError) {
                        console.error('Erreur lors de l\'envoi des notifications:', emailError);
                    }
                }

                res.status(201).json({
                    success: true,
                    message: "Offre créée avec succès",
                    data: { id: result.insertId, ...offreData }
                });
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de l'offre",
                error: error
            });
        }
    },
    getOffreById: (req, res) => {
        const id = req.params.id;
        
        OffreEmploi.getOffreById(id, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Erreur lors de la récupération de l'offre",
                    error: err
                });
            }
            
            // Si aucun résultat n'est trouvé
            if (!results || results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Offre non trouvée"
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });
        });
    },
    updateOffre: async (req, res) => {
        const id = req.params.id;
        const offreData = req.body;

        try {
            OffreEmploi.updateOffre(id, offreData, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la mise à jour de l'offre",
                        error: err
                    });
                }

                // Si le statut passe à "closed", notifier les candidats
                if (offreData.statut === 'closed') {
                    try {
                        const candidats = await getCandidatsByOffre(id); // À implémenter
                        for (const candidat of candidats) {
                            await emailService.sendStatutUpdate(candidat, {
                                message: "Le processus de recrutement pour cette offre est maintenant terminé. Nous vous remercions de votre intérêt."
                            });
                        }
                    } catch (emailError) {
                        console.error('Erreur lors de l\'envoi des notifications:', emailError);
                    }
                }

                res.status(200).json({
                    success: true,
                    message: "Offre mise à jour avec succès"
                });
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de l'offre",
                error: error
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