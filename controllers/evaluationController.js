const Evaluation = require('../models/evaluationModel');
const Employe = require('../models/employe');
const emailService = require('../utils/emailService');
const db = require('../config/database');

const evaluationController = {
    // Récupérer toutes les évaluations
    getAllEvaluations: async (req, res) => {
        try {
            const [evaluations] = await db.query(`
                SELECT e.*, 
                       emp.nom as employe_nom, 
                       emp.prenom as employe_prenom,
                       eval.nom as evaluateur_nom,
                       eval.prenom as evaluateur_prenom
                FROM evaluations e
                LEFT JOIN employe emp ON e.employe_id = emp.id
                LEFT JOIN employe eval ON e.evaluateur_id = eval.id
                ORDER BY e.date_evaluation DESC
            `);

            console.log('Évaluations trouvées:', evaluations.length);

            // Formater les données pour inclure les noms complets
            const formattedEvaluations = evaluations.map(eval => ({
                ...eval,
                employe_nom_complet: `${eval.employe_prenom || ''} ${eval.employe_nom || ''}`.trim() || 'Non assigné',
                evaluateur_nom_complet: `${eval.evaluateur_prenom || ''} ${eval.evaluateur_nom || ''}`.trim() || 'Non assigné'
            }));

            return res.status(200).json({
                success: true,
                data: formattedEvaluations
            });
        } catch (error) {
            console.error('Erreur getAllEvaluations:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des évaluations",
                error: error.message
            });
        }
    },

    // Récupérer une évaluation par ID
    getEvaluationById: async (req, res) => {
        try {
            const id = req.params.id;
            const evaluation = await new Promise((resolve, reject) => {
                Evaluation.getEvaluationById(id, (err, results) => {
                    if (err) {
                        console.error('Erreur SQL:', err);
                        reject(err);
                    } else {
                        resolve(results[0]);
                    }
                });
            });

            if (!evaluation) {
                return res.status(404).json({
                    success: false,
                    message: "Évaluation non trouvée"
                });
            }

            res.status(200).json({
                success: true,
                data: evaluation
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'évaluation",
                error: error.message
            });
        }
    },

    // Créer une nouvelle évaluation
    createEvaluation: async (req, res) => {
        const evaluationData = {
            candidature_id: req.body.candidature_id,
            recruteur_id: req.body.recruteur_id,
            note_technique: req.body.note_technique,
            note_soft_skills: req.body.note_soft_skills,
            commentaires: req.body.commentaires
        };

        try {
            Evaluation.createEvaluation(evaluationData, async (err, result) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        message: "Erreur lors de la création de l'évaluation",
                        error: err
                    });
                }

                try {
                    // Notifier les autres recruteurs impliqués
                    const recruteurs = await getAutresRecruteurs(evaluationData.recruteur_id, evaluationData.candidature_id);
                    const candidat = await getCandidatInfo(evaluationData.candidature_id);
                    
                    for (const recruteur of recruteurs) {
                        await emailService.sendEmail(
                            recruteur.email,
                            'nouvelleEvaluation',
                            {
                                candidat: candidat.nom,
                                evaluateur: req.user.nom, // Supposant que l'utilisateur est dans req.user
                                note_moyenne: (evaluationData.note_technique + evaluationData.note_soft_skills) / 2
                            }
                        );
                    }
                } catch (emailError) {
                    console.error('Erreur lors de l\'envoi des notifications:', emailError);
                }

                res.status(201).json({
                    success: true,
                    message: "Évaluation créée avec succès",
                    data: { id: result.insertId, ...evaluationData }
                });
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de l'évaluation",
                error: error
            });
        }
    },

    // Mettre à jour une évaluation
    updateEvaluation: async (req, res) => {
        try {
            const id = parseInt(req.params.id);
            console.log('Mise à jour évaluation ID:', id); // Debug
            console.log('Données reçues:', req.body); // Debug

            // Préparer les données de mise à jour
            const evaluationData = {
                note_technique: parseFloat(req.body.note_technique) || 0,
                note_soft_skills: parseFloat(req.body.note_soft_skills) || 0,
                commentaires: req.body.commentaires,
                date_modification: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };

            console.log('Données formatées:', evaluationData); // Debug

            const [result] = await db.query(
                'UPDATE evaluations SET ? WHERE id = ?',
                [evaluationData, id]
            );

            console.log('Résultat de la mise à jour:', result); // Debug

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Évaluation non trouvée"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Évaluation mise à jour avec succès",
                data: { id, ...evaluationData }
            });

        } catch (error) {
            console.error('Erreur updateEvaluation:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la mise à jour de l'évaluation",
                error: error.message
            });
        }
    },

    // Supprimer une évaluation
    deleteEvaluation: async (req, res) => {
        try {
            console.log('Début deleteEvaluation, ID:', req.params.id); // Debug

            const [result] = await db.query(
                'DELETE FROM evaluations WHERE id = ?',
                [req.params.id]
            );

            console.log('Résultat de la suppression:', result); // Debug

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Évaluation non trouvée"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Évaluation supprimée avec succès"
            });

        } catch (error) {
            console.error('Erreur deleteEvaluation:', error);
            return res.status(500).json({
                success: false,
                message: "Erreur lors de la suppression de l'évaluation",
                error: error.message
            });
        }
    },

    // Obtenir les évaluations par candidature
    getEvaluationsByCandidature: async (req, res) => {
        try {
            const candidatureId = req.params.candidatureId;
            const evaluations = await new Promise((resolve, reject) => {
                Evaluation.getEvaluationsByCandidature(candidatureId, (err, results) => {
                    if (err) {
                        console.error('Erreur SQL:', err);
                        reject(err);
                    } else {
                        resolve(results);
                    }
                });
            });

            res.status(200).json({
                success: true,
                data: evaluations
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des évaluations",
                error: error.message
            });
        }
    },

    // Nouvelle méthode pour lier une évaluation à un employé
    createEvaluationEmploye: async (req, res) => {
        try {
            const evaluationData = {
                employe_id: req.body.employe_id,
                evaluateur_id: req.body.evaluateur_id,
                type_evaluation: req.body.type_evaluation, // 'periodique', 'performance', etc.
                note_technique: req.body.note_technique,
                note_soft_skills: req.body.note_soft_skills,
                objectifs_atteints: req.body.objectifs_atteints,
                commentaires: req.body.commentaires,
                date_evaluation: new Date()
            };

            // Vérifier si l'employé existe
            const employe = await new Promise((resolve, reject) => {
                Employe.getEmployeById(evaluationData.employe_id, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            if (!employe) {
                return res.status(404).json({
                    success: false,
                    message: "Employé non trouvé"
                });
            }

            // Créer l'évaluation
            const result = await new Promise((resolve, reject) => {
                Evaluation.createEvaluation(evaluationData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            // Mettre à jour l'historique des évaluations de l'employé
            await new Promise((resolve, reject) => {
                Employe.updateEvaluationHistory(evaluationData.employe_id, {
                    evaluation_id: result.insertId,
                    date: evaluationData.date_evaluation,
                    type: evaluationData.type_evaluation,
                    note_moyenne: (evaluationData.note_technique + evaluationData.note_soft_skills) / 2
                }, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            // Envoyer une notification par email
            try {
                await emailService.sendEmail(
                    employe.email,
                    'Nouvelle évaluation',
                    {
                        nom: employe.nom,
                        type: evaluationData.type_evaluation,
                        date: evaluationData.date_evaluation
                    }
                );
            } catch (emailError) {
                console.error('Erreur envoi email:', emailError);
            }

            res.status(201).json({
                success: true,
                message: "Évaluation créée avec succès",
                data: { id: result.insertId, ...evaluationData }
            });

        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de l'évaluation",
                error: error.message
            });
        }
    },

    // Nouvelle méthode pour obtenir l'historique des évaluations d'un employé
    getEvaluationHistoryByEmploye: async (req, res) => {
        try {
            const employeId = req.params.employeId;
            const evaluations = await new Promise((resolve, reject) => {
                Evaluation.getEvaluationsByEmploye(employeId, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.status(200).json({
                success: true,
                data: evaluations
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération de l'historique des évaluations",
                error: error.message
            });
        }
    },

    // Méthode pour obtenir les candidats disponibles pour évaluation
    getAvailableCandidates: async (req, res) => {
        try {
            const evaluations = await new Promise((resolve, reject) => {
                Evaluation.getAllEvaluations((err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const evaluatedIds = evaluations.map(e => e.candidature_id);

            // Récupérer les candidats non évalués
            const candidates = await new Promise((resolve, reject) => {
                Evaluation.getUnevaluatedCandidates(evaluatedIds, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            res.status(200).json({
                success: true,
                data: candidates
            });
        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des candidats disponibles",
                error: error.message
            });
        }
    },

    // Méthode pour créer une évaluation avec notification
    createEvaluationWithNotification: async (req, res) => {
        try {
            const evaluationData = {
                candidature_id: req.body.candidature_id,
                recruteur_id: req.body.recruteur_id,
                note_technique: req.body.note_technique,
                note_soft_skills: req.body.note_soft_skills,
                commentaires: req.body.commentaires,
                date_evaluation: new Date()
            };

            // Vérifier si le candidat n'a pas déjà été évalué
            const existingEval = await new Promise((resolve, reject) => {
                Evaluation.getEvaluationByCandidature(evaluationData.candidature_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            if (existingEval) {
                return res.status(400).json({
                    success: false,
                    message: "Ce candidat a déjà été évalué"
                });
            }

            // Créer l'évaluation
            const result = await new Promise((resolve, reject) => {
                Evaluation.createEvaluation(evaluationData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            // Récupérer les informations du recruteur
            const recruteur = await new Promise((resolve, reject) => {
                Employe.getEmployeById(evaluationData.recruteur_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            // Envoyer les notifications
            if (recruteur && recruteur.email) {
                try {
                    await emailService.sendEmail(
                        recruteur.email,
                        'Nouvelle évaluation créée',
                        {
                            type: 'evaluation_creation',
                            note_moyenne: (evaluationData.note_technique + evaluationData.note_soft_skills) / 2,
                            date: evaluationData.date_evaluation
                        }
                    );
                } catch (emailError) {
                    console.error('Erreur envoi email:', emailError);
                }
            }

            res.status(201).json({
                success: true,
                message: "Évaluation créée avec succès",
                data: { id: result.insertId, ...evaluationData }
            });

        } catch (error) {
            console.error('Erreur:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la création de l'évaluation",
                error: error.message
            });
        }
    },

    // Ajouter cette nouvelle méthode
    getAllEvaluateurs: async (req, res) => {
        try {
            const evaluateurs = await Evaluation.getAllEvaluateurs();
            res.json({
                success: true,
                data: evaluateurs
            });
        } catch (error) {
            console.error('Erreur getAllEvaluateurs:', error);
            res.status(500).json({
                success: false,
                message: "Erreur lors de la récupération des évaluateurs",
                error: error.message
            });
        }
    }
};

module.exports = evaluationController; 